const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, QueryCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  const today = new Date();
  const dayOfMonth = today.getDate();
  
  try {
    // Get all recurring investments for today
    const recurringResult = await docClient.send(new ScanCommand({
      TableName: 'wealth-planner-recurring',
      FilterExpression: 'dayOfMonth = :day',
      ExpressionAttributeValues: { ':day': dayOfMonth }
    }));

    // Process each recurring investment
    for (const recurring of recurringResult.Items) {
      const itemId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
      await docClient.send(new PutCommand({
        TableName: 'wealth-planner-networth-items',
        Item: {
          userId: recurring.userId,
          itemId,
          name: recurring.assetName,
          type: 'asset',
          value: recurring.amount,
          tags: recurring.tags,
          recurring: true,
          updatedAt: new Date().toISOString()
        }
      }));
      
      console.log(`Added recurring investment for user ${recurring.userId}: ${recurring.assetName}`);
    }

    // Snapshot net worth for all users
    const usersResult = await docClient.send(new ScanCommand({
      TableName: 'wealth-planner-networth-items',
      ProjectionExpression: 'userId'
    }));

    const uniqueUsers = [...new Set(usersResult.Items.map(i => i.userId))];

    for (const userId of uniqueUsers) {
      const itemsResult = await docClient.send(new QueryCommand({
        TableName: 'wealth-planner-networth-items',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId }
      }));

      const totalAssets = itemsResult.Items.filter(i => i.type === 'asset').reduce((sum, i) => sum + i.value, 0);
      const totalLiabilities = itemsResult.Items.filter(i => i.type === 'liability').reduce((sum, i) => sum + i.value, 0);
      const netWorth = totalAssets - totalLiabilities;

      await docClient.send(new PutCommand({
        TableName: 'wealth-planner-networth-history',
        Item: {
          userId,
          date: today.toISOString().split('T')[0],
          netWorth,
          assets: totalAssets,
          liabilities: totalLiabilities
        }
      }));

      console.log(`Snapshotted net worth for user ${userId}: $${netWorth}`);
    }

    return { statusCode: 200, body: JSON.stringify({ processed: recurringResult.Items.length, users: uniqueUsers.length }) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
