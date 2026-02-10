// Import script for your net worth data
// Run this in the browser console when logged in to the Net Worth page

const items = [
  { name: "Fondos indexados - SP500", type: "asset", value: 25786.01, tags: "fondos indexados, inversión" },
  { name: "Fondos indexados - MSCI World", type: "asset", value: 15682.03, tags: "fondos indexados, inversión" },
  { name: "Fondos indexados - Nasdaq", type: "asset", value: 24531.57, tags: "fondos indexados, inversión" },
  { name: "Fondos indexados - Emerging Markets", type: "asset", value: 100.55, tags: "fondos indexados, inversión" },
  { name: "ETFs - SP500", type: "asset", value: 17092.29, tags: "ETFs, inversión" },
  { name: "ETFs - Nasdaq", type: "asset", value: 8014.22, tags: "ETFs, inversión" },
  { name: "Fondos de pensiones - Foyer", type: "asset", value: 11259.51, tags: "pensiones, jubilación" },
  { name: "Fondos de pensiones - NN", type: "asset", value: 516.06, tags: "pensiones, jubilación" },
  { name: "Fondos de pensiones - Myinvestor", type: "asset", value: 94.47, tags: "pensiones, jubilación" },
  { name: "Acciones - Booz Allen", type: "asset", value: 2880.84, tags: "acciones, inversión" },
  { name: "Acciones - Alibaba", type: "asset", value: 563.70, tags: "acciones, inversión" },
  { name: "Cash", type: "asset", value: 8850.00, tags: "liquidez, efectivo" }
];

async function importItems() {
  const { fetchAuthSession } = await import('aws-amplify/auth');
  const { post } = await import('aws-amplify/api');
  
  const session = await fetchAuthSession();
  const token = session.tokens?.idToken?.toString();
  
  for (const item of items) {
    try {
      await post({
        apiName: 'WealthPlannerAPI',
        path: '/networth',
        options: {
          body: item,
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }).response;
      console.log(`✅ Added: ${item.name}`);
    } catch (err) {
      console.error(`❌ Error adding ${item.name}:`, err);
    }
  }
  
  console.log('✅ Import complete! Refresh the page.');
}

importItems();
