const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Free API - Alpha Vantage (get free key at https://www.alphavantage.co/support/#api-key)
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY;

exports.handler = async (event) => {
  try {
    // Get all unique stock symbols from networth items
    const result = await docClient.send(new ScanCommand({
      TableName: 'wealth-planner-networth-items',
      FilterExpression: 'attribute_exists(symbol)',
      ProjectionExpression: 'symbol'
    }));

    const symbols = [...new Set(result.Items.map(item => item.symbol))];
    
    for (const symbol of symbols) {
      try {
        const response = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`
        );
        const data = await response.json();
        
        if (data['Global Quote']) {
          const price = parseFloat(data['Global Quote']['05. price']);
          await docClient.send(new PutCommand({
            TableName: 'wealth-planner-stock-prices',
            Item: {
              symbol,
              price,
              updatedAt: new Date().toISOString()
            }
          }));
          console.log(`Updated ${symbol}: $${price}`);
        }
        
        // Rate limit: 5 calls per minute on free tier
        await new Promise(resolve => setTimeout(resolve, 12000));
      } catch (error) {
        console.error(`Error updating ${symbol}:`, error);
      }
    }

    return { statusCode: 200, body: JSON.stringify({ updated: symbols.length }) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
