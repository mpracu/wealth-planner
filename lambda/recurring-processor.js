const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, QueryCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { SESv2Client, SendEmailCommand } = require('@aws-sdk/client-sesv2');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const sesClient = new SESv2Client({ region: 'us-east-1' });

const ALERT_EMAIL = 'manugvd@gmail.com';

async function sendErrorEmail(subject, body) {
  try {
    await sesClient.send(new SendEmailCommand({
      FromEmailAddress: ALERT_EMAIL,
      Destination: { ToAddresses: [ALERT_EMAIL] },
      Content: {
        Simple: {
          Subject: { Data: subject },
          Body: { Text: { Data: body } }
        }
      }
    }));
  } catch (e) {
    console.error('Failed to send alert email:', e.message);
  }
}

exports.handler = async (event) => {
  const today = new Date();
  const dayOfMonth = today.getDate();
  const dateStr = today.toISOString().split('T')[0];
  const errors = [];

  try {
    // Get all recurring investments for today
    const recurringResult = await docClient.send(new ScanCommand({
      TableName: 'wealth-planner-recurring',
      FilterExpression: 'dayOfMonth = :day',
      ExpressionAttributeValues: { ':day': dayOfMonth }
    }));

    console.log(`Processing ${recurringResult.Items.length} recurring investment(s) for day ${dayOfMonth}`);

    // Process each recurring investment — errors are isolated per item
    for (const recurring of recurringResult.Items) {
      try {
        const amount = Number(recurring.amount);
        if (!amount || isNaN(amount)) {
          throw new Error(`Invalid amount "${recurring.amount}" for asset "${recurring.assetName}"`);
        }

        const existingResult = await docClient.send(new QueryCommand({
          TableName: 'wealth-planner-networth-items',
          KeyConditionExpression: 'userId = :userId',
          FilterExpression: '#name = :name',
          ExpressionAttributeNames: { '#name': 'name' },
          ExpressionAttributeValues: { ':userId': recurring.userId, ':name': recurring.assetName }
        }));

        const existing = existingResult.Items?.[0];

        if (existing) {
          const currentValue = Number(existing.value) || 0;
          const currentShares = Number(existing.shares) || 0;
          const pricePerShare = Number(existing.pricePerShare) || 0;

          if (pricePerShare > 0 && currentShares > 0) {
            const newShares = amount / pricePerShare;
            await docClient.send(new UpdateCommand({
              TableName: 'wealth-planner-networth-items',
              Key: { userId: existing.userId, itemId: existing.itemId },
              UpdateExpression: 'SET #val = :newVal, shares = :newShares, updatedAt = :updatedAt',
              ExpressionAttributeNames: { '#val': 'value' },
              ExpressionAttributeValues: {
                ':newVal': currentValue + amount,
                ':newShares': currentShares + newShares,
                ':updatedAt': new Date().toISOString()
              }
            }));
          } else {
            await docClient.send(new UpdateCommand({
              TableName: 'wealth-planner-networth-items',
              Key: { userId: existing.userId, itemId: existing.itemId },
              UpdateExpression: 'SET #val = :newVal, updatedAt = :updatedAt',
              ExpressionAttributeNames: { '#val': 'value' },
              ExpressionAttributeValues: {
                ':newVal': currentValue + amount,
                ':updatedAt': new Date().toISOString()
              }
            }));
          }
          console.log(`Updated ${recurring.assetName} for user ${recurring.userId}: +${amount}`);
        } else {
          // No existing item — create a new one
          const itemId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
          await docClient.send(new PutCommand({
            TableName: 'wealth-planner-networth-items',
            Item: {
              userId: recurring.userId,
              itemId,
              name: recurring.assetName,
              type: 'asset',
              value: amount,
              tags: recurring.tags || [],
              updatedAt: new Date().toISOString()
            }
          }));
          console.log(`Created new item ${recurring.assetName} for user ${recurring.userId}`);
        }
      } catch (itemError) {
        const msg = `Failed to process "${recurring.assetName}" (user ${recurring.userId}): ${itemError.message}`;
        console.error(msg);
        errors.push(msg);
      }
    }

    // Snapshot net worth for all users
    const usersResult = await docClient.send(new ScanCommand({
      TableName: 'wealth-planner-networth-items',
      ProjectionExpression: 'userId'
    }));

    const uniqueUsers = [...new Set(usersResult.Items.map(i => i.userId))];

    for (const userId of uniqueUsers) {
      try {
        const itemsResult = await docClient.send(new QueryCommand({
          TableName: 'wealth-planner-networth-items',
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: { ':userId': userId }
        }));

        const totalAssets = itemsResult.Items
          .filter(i => i.type === 'asset')
          .reduce((sum, i) => sum + (Number(i.value) || 0), 0);
        const totalLiabilities = itemsResult.Items
          .filter(i => i.type === 'liability')
          .reduce((sum, i) => sum + (Number(i.value) || 0), 0);
        const netWorth = totalAssets - totalLiabilities;

        await docClient.send(new PutCommand({
          TableName: 'wealth-planner-networth-history',
          Item: { userId, date: dateStr, netWorth, assets: totalAssets, liabilities: totalLiabilities }
        }));

        console.log(`Snapshotted net worth for user ${userId}: €${netWorth.toFixed(2)}`);
      } catch (snapError) {
        const msg = `Failed to snapshot net worth for user ${userId}: ${snapError.message}`;
        console.error(msg);
        errors.push(msg);
      }
    }

    // Send alert email if any item-level errors occurred
    if (errors.length > 0) {
      await sendErrorEmail(
        `[Caudal] ⚠️ Recurring DCA errors on ${dateStr}`,
        `The following errors occurred during the recurring investment processing on ${dateStr}:\n\n` +
        errors.map((e, i) => `${i + 1}. ${e}`).join('\n') +
        '\n\nAll other items processed successfully.'
      );
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ processed: recurringResult.Items.length, users: uniqueUsers.length, errors: errors.length })
    };
  } catch (error) {
    // Top-level failure (e.g. DynamoDB scan failed entirely)
    console.error('Fatal error in recurring processor:', error);
    await sendErrorEmail(
      `[Caudal] 🚨 Recurring DCA processor FAILED on ${dateStr}`,
      `The recurring investment processor crashed on ${dateStr} and did NOT run.\n\nError: ${error.message}\n\nStack:\n${error.stack}`
    );
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
