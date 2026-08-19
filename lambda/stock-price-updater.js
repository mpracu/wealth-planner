const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

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
  const meta = data?.chart?.result?.[0]?.meta;
  if (!meta || meta.regularMarketPrice == null) return null;
  return { price: meta.regularMarketPrice, currency: meta.currency || 'EUR' };
}

// Returns the value of 1 unit of `currency` in EUR, e.g. getExchangeRateToEUR('USD') ≈ 0.86
async function getExchangeRateToEUR(currency) {
  if (!currency || currency === 'EUR') return 1;
  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${currency}EUR=X?interval=1d&range=1d`,
    { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } }
  );
  const data = await response.json();
  return data?.chart?.result?.[0]?.meta?.regularMarketPrice || null;
}

exports.handler = async (event) => {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: 'wealth-planner-networth-items',
      FilterExpression: 'attribute_exists(isin) AND attribute_exists(shares)',
    }));

    const items = result.Items || [];
    console.log(`Found ${items.length} items with ISIN and shares`);

    // Cache ISIN -> { ticker, price, currency } to avoid duplicate lookups
    const priceCache = {};
    const fxCache = {};
    let updatedCount = 0;

    for (const item of items) {
      try {
        const isin = item.isin;

        if (!priceCache[isin]) {
          const ticker = await getTickerFromISIN(isin);
          if (!ticker) {
            console.log(`No ticker found for ISIN ${isin}`);
            continue;
          }
          console.log(`ISIN ${isin} -> ticker ${ticker}`);

          const quote = await getPriceForTicker(ticker);
          if (!quote) {
            console.log(`No price found for ticker ${ticker}`);
            continue;
          }
          priceCache[isin] = { ticker, ...quote };
        }

        const { price, currency } = priceCache[isin];

        if (!(currency in fxCache)) {
          fxCache[currency] = await getExchangeRateToEUR(currency);
        }
        const fxRate = fxCache[currency];
        if (!fxRate) {
          console.log(`No EUR exchange rate found for ${currency}`);
          continue;
        }

        const priceEUR = price * fxRate;
        const newValue = parseFloat(item.shares) * priceEUR;

        await docClient.send(new UpdateCommand({
          TableName: 'wealth-planner-networth-items',
          Key: { userId: item.userId, itemId: item.itemId },
          UpdateExpression: 'SET pricePerShare = :price, currency = :currency, #val = :value, updatedAt = :updatedAt',
          ExpressionAttributeNames: { '#val': 'value' },
          ExpressionAttributeValues: {
            ':price': priceEUR,
            ':currency': currency,
            ':value': newValue,
            ':updatedAt': new Date().toISOString()
          }
        }));

        console.log(`Updated ${item.name} (${isin}): ${item.shares} shares @ ${priceEUR} EUR (${price} ${currency}) = ${newValue}`);
        updatedCount++;

        // Polite delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error updating item ${item.itemId}:`, error);
      }
    }

    return { statusCode: 200, body: JSON.stringify({ updated: updatedCount }) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
