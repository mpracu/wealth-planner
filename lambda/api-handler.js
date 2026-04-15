const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand, DeleteCommand, GetCommand, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

async function getTickerFromISIN(isin) {
  const response = await fetch(
    `https://query1.finance.yahoo.com/v1/finance/search?q=${isin}&quotesCount=1&newsCount=0&enableFuzzyQuery=false`,
    { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } }
  );
  const data = await response.json();
  const quotes = data?.quotes;
  if (!quotes || quotes.length === 0) return null;
  return quotes[0].symbol;
}

async function getPriceForTicker(ticker) {
  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`,
    { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } }
  );
  const data = await response.json();
  return data?.chart?.result?.[0]?.meta?.regularMarketPrice || null;
}

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  };

  if (event.requestContext.http.method === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const rawPath = event.requestContext.http.path;
  const path = rawPath.replace(/^\/prod/, '');
  const method = event.requestContext.http.method;

  // Public blog posts endpoint (no auth required)
  if (path === '/blog-posts' && method === 'GET') {
    try {
      const result = await docClient.send(new ScanCommand({
        TableName: 'wealth-planner-blog-posts'
      }));
      const posts = (result.Items || [])
        .filter(item => item.postId !== 'COUNTER' && item.postId !== 'USED_IMAGES')
        .sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
      return { statusCode: 200, headers, body: JSON.stringify(posts) };
    } catch (error) {
      console.error(error);
      return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }
  }

  const userId = event.requestContext.authorizer.jwt.claims.sub;

  try {
    // Scenarios endpoints
    if (path === '/scenarios' && method === 'GET') {
      const result = await docClient.send(new QueryCommand({
        TableName: 'wealth-planner-scenarios',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId }
      }));
      return { statusCode: 200, headers, body: JSON.stringify(result.Items || []) };
    }

    if (path === '/scenarios' && method === 'POST') {
      const body = JSON.parse(event.body);
      const scenarioId = Date.now().toString();
      await docClient.send(new PutCommand({
        TableName: 'wealth-planner-scenarios',
        Item: {
          userId,
          scenarioId,
          name: body.name,
          data: body.data,
          createdAt: new Date().toISOString()
        }
      }));
      return { statusCode: 201, headers, body: JSON.stringify({ scenarioId }) };
    }

    if (path.startsWith('/scenarios/') && method === 'DELETE') {
      const scenarioId = path.split('/')[2];
      await docClient.send(new DeleteCommand({
        TableName: 'wealth-planner-scenarios',
        Key: { userId, scenarioId }
      }));
      return { statusCode: 204, headers, body: '' };
    }

    // Net worth endpoints
    if (path === '/networth-history' && method === 'GET') {
      const result = await docClient.send(new QueryCommand({
        TableName: 'wealth-planner-networth-history',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId },
        ScanIndexForward: true
      }));
      return { statusCode: 200, headers, body: JSON.stringify(result.Items) };
    }

    if (path === '/networth' && method === 'GET') {
      const result = await docClient.send(new QueryCommand({
        TableName: 'wealth-planner-networth-items',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId }
      }));
      return { statusCode: 200, headers, body: JSON.stringify(result.Items) };
    }

    if (path === '/networth' && method === 'POST') {
      const body = JSON.parse(event.body);
      const itemId = Date.now().toString();
      await docClient.send(new PutCommand({
        TableName: 'wealth-planner-networth-items',
        Item: {
          userId,
          itemId,
          ...body,
          updatedAt: new Date().toISOString()
        }
      }));
      return { statusCode: 201, headers, body: JSON.stringify({ itemId }) };
    }

    if (path.startsWith('/networth/') && method === 'PUT') {
      const itemId = path.split('/')[2];
      const body = JSON.parse(event.body);
      await docClient.send(new PutCommand({
        TableName: 'wealth-planner-networth-items',
        Item: {
          userId,
          itemId,
          ...body,
          updatedAt: new Date().toISOString()
        }
      }));
      return { statusCode: 200, headers, body: '' };
    }

    if (path.startsWith('/networth/') && method === 'DELETE') {
      const itemId = path.split('/')[2];
      await docClient.send(new DeleteCommand({
        TableName: 'wealth-planner-networth-items',
        Key: { userId, itemId }
      }));
      return { statusCode: 204, headers, body: '' };
    }

    // Recurring investments endpoints
    if (path === '/recurring' && method === 'GET') {
      const result = await docClient.send(new QueryCommand({
        TableName: 'wealth-planner-recurring',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId }
      }));
      return { statusCode: 200, headers, body: JSON.stringify(result.Items) };
    }

    if (path === '/recurring' && method === 'POST') {
      const body = JSON.parse(event.body);
      const itemId = Date.now().toString();
      await docClient.send(new PutCommand({
        TableName: 'wealth-planner-recurring',
        Item: {
          userId,
          itemId,
          ...body,
          createdAt: new Date().toISOString()
        }
      }));
      return { statusCode: 201, headers, body: JSON.stringify({ itemId }) };
    }

    if (path.startsWith('/recurring/') && method === 'PUT') {
      const itemId = path.split('/')[2];
      const body = JSON.parse(event.body);
      await docClient.send(new PutCommand({
        TableName: 'wealth-planner-recurring',
        Item: { userId, itemId, ...body, updatedAt: new Date().toISOString() }
      }));
      return { statusCode: 200, headers, body: '' };
    }

    if (path.startsWith('/recurring/') && method === 'DELETE') {
      const itemId = path.split('/')[2];
      await docClient.send(new DeleteCommand({
        TableName: 'wealth-planner-recurring',
        Key: { userId, itemId }
      }));
      return { statusCode: 204, headers, body: '' };
    }

    // Portfolio endpoints
    if (path === '/portfolio' && method === 'GET') {
      const result = await docClient.send(new QueryCommand({
        TableName: 'wealth-planner-portfolio',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId }
      }));
      return { statusCode: 200, headers, body: JSON.stringify(result.Items || []) };
    }

    if (path === '/portfolio' && method === 'POST') {
      const body = JSON.parse(event.body);
      const holdingId = `holding-${Date.now()}`;
      await docClient.send(new PutCommand({
        TableName: 'wealth-planner-portfolio',
        Item: {
          userId,
          holdingId,
          ...body,
          createdAt: new Date().toISOString()
        }
      }));
      return { statusCode: 201, headers, body: JSON.stringify({ holdingId }) };
    }

    if (path.startsWith('/portfolio/') && method === 'DELETE') {
      const holdingId = path.split('/')[2];
      await docClient.send(new DeleteCommand({
        TableName: 'wealth-planner-portfolio',
        Key: { userId, holdingId }
      }));
      return { statusCode: 204, headers, body: '' };
    }

    // Refresh stock prices for the authenticated user
    if (path === '/refresh-prices' && method === 'POST') {
      const itemsResult = await docClient.send(new QueryCommand({
        TableName: 'wealth-planner-networth-items',
        KeyConditionExpression: 'userId = :userId',
        FilterExpression: 'attribute_exists(isin) AND attribute_exists(shares)',
        ExpressionAttributeValues: { ':userId': userId }
      }));

      const items = itemsResult.Items || [];
      const priceCache = {};
      let updatedCount = 0;

      for (const item of items) {
        const isin = item.isin;
        if (!priceCache[isin]) {
          const ticker = await getTickerFromISIN(isin);
          if (!ticker) continue;
          const price = await getPriceForTicker(ticker);
          if (!price) continue;
          priceCache[isin] = price;
        }

        const price = priceCache[isin];
        const newValue = parseFloat(item.shares) * price;

        await docClient.send(new UpdateCommand({
          TableName: 'wealth-planner-networth-items',
          Key: { userId: item.userId, itemId: item.itemId },
          UpdateExpression: 'SET pricePerShare = :price, #val = :value, updatedAt = :updatedAt',
          ExpressionAttributeNames: { '#val': 'value' },
          ExpressionAttributeValues: {
            ':price': price,
            ':value': newValue,
            ':updatedAt': new Date().toISOString()
          }
        }));
        updatedCount++;
      }

      return { statusCode: 200, headers, body: JSON.stringify({ updated: updatedCount }) };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found' }) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
