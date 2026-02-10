const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand, DeleteCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

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

  const userId = event.requestContext.authorizer.jwt.claims.sub;

  const rawPath = event.requestContext.http.path;
  const path = rawPath.replace(/^\/prod/, ''); // Remove /prod prefix
  const method = event.requestContext.http.method;

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

    if (path.startsWith('/recurring/') && method === 'DELETE') {
      const itemId = path.split('/')[2];
      await docClient.send(new DeleteCommand({
        TableName: 'wealth-planner-recurring',
        Key: { userId, itemId }
      }));
      return { statusCode: 204, headers, body: '' };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found' }) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
