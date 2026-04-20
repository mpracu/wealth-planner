const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand, DeleteCommand, GetCommand, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const YF_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
};

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

async function getTickerFromISIN(isin) {
  const res = await fetchWithTimeout(
    `https://query2.finance.yahoo.com/v1/finance/search?q=${isin}&quotesCount=1&newsCount=0&enableFuzzyQuery=false`,
    { headers: YF_HEADERS }
  );
  const data = await res.json();
  const quotes = data?.quotes;
  if (!quotes || quotes.length === 0) return null;
  return quotes[0].symbol;
}

async function getPriceForTicker(ticker) {
  const res = await fetchWithTimeout(
    `https://query2.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`,
    { headers: YF_HEADERS }
  );
  const data = await res.json();
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
        .filter(item => !['COUNTER', 'USED_IMAGES', 'USED_TOPICS'].includes(item.postId))
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
        FilterExpression: 'attribute_exists(isin) AND isin <> :empty',
        ExpressionAttributeValues: { ':userId': userId, ':empty': '' }
      }));

      const items = itemsResult.Items || [];
      console.log(`Found ${items.length} items with ISIN for user ${userId}`);

      const priceCache = {};
      let updatedCount = 0;
      const errors = [];

      for (const item of items) {
        try {
          const isin = item.isin;
          if (!priceCache[isin]) {
            console.log(`Looking up ISIN: ${isin}`);
            const ticker = await getTickerFromISIN(isin);
            if (!ticker) { errors.push(`${isin}: no ticker found`); continue; }
            console.log(`${isin} → ${ticker}`);
            const price = await getPriceForTicker(ticker);
            if (!price) { errors.push(`${isin}: no price for ${ticker}`); continue; }
            priceCache[isin] = { ticker, price };
          }

          const { price } = priceCache[isin];
          const shares = parseFloat(item.shares);
          const hasShares = !isNaN(shares) && shares > 0;

          if (hasShares) {
            await docClient.send(new UpdateCommand({
              TableName: 'wealth-planner-networth-items',
              Key: { userId: item.userId, itemId: item.itemId },
              UpdateExpression: 'SET pricePerShare = :price, #val = :value, updatedAt = :updatedAt',
              ExpressionAttributeNames: { '#val': 'value' },
              ExpressionAttributeValues: { ':price': price, ':value': shares * price, ':updatedAt': new Date().toISOString() }
            }));
            console.log(`Updated ${item.name}: ${shares} × ${price} = ${shares * price}`);
          } else {
            await docClient.send(new UpdateCommand({
              TableName: 'wealth-planner-networth-items',
              Key: { userId: item.userId, itemId: item.itemId },
              UpdateExpression: 'SET pricePerShare = :price, updatedAt = :updatedAt',
              ExpressionAttributeValues: { ':price': price, ':updatedAt': new Date().toISOString() }
            }));
            console.log(`Updated price only for ${item.name}: ${price} (no shares set)`);
          }
          updatedCount++;
        } catch (err) {
          console.error(`Error on item ${item.itemId}:`, err.message);
          errors.push(`${item.name}: ${err.message}`);
        }
      }

      return { statusCode: 200, headers, body: JSON.stringify({ updated: updatedCount, total: items.length, errors }) };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found' }) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
