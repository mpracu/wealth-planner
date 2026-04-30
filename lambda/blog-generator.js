const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);
const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' });

const BLOG_TOPICS = [
  // Mindset & fundamentals
  'The Psychology of Wealth Building',
  'Compound Interest: The Eighth Wonder',
  'The Cost of Waiting to Invest',
  'Avoiding Lifestyle Inflation',
  'The Power of Patience in Investing',
  'Avoiding Common Investment Mistakes',
  'The Danger of Timing the Market',
  'Bear Markets: How to Stay Calm',
  'Stock Market Corrections: What to Do',
  'Teaching Kids About Money and Investing',
  'How Automation Builds Better Investment Habits',

  // Budgeting & savings
  'The 50/30/20 Budget Rule',
  'Zero-Based Budgeting Explained',
  'How to Calculate Your Savings Rate',
  'Emergency Fund Strategies',
  'Debt Payoff vs Investing',
  'Building Multiple Income Streams',

  // Spanish tax & accounts
  'Tax on Investments in Spain: IRPF Guide',
  'Planes de Pensiones in Spain: Are They Worth It?',
  'PIAS: The Tax-Efficient Savings Plan for Spanish Investors',
  'Fondos de Inversión vs ETFs: Tax Implications in Spain',
  'How to Declare Investment Income in Spain (Renta)',
  'Spanish Inheritance Tax: Planning Ahead',
  'Cuenta de Valores vs Fondo de Inversión in Spain',
  'How the Spanish Public Pension System Works',
  'Complementing Your Spanish Pension with Private Investments',

  // Spanish & European brokers & platforms
  'Investing with Degiro: A Beginner Guide',
  'MyInvestor: Spain\'s Low-Cost Investment Platform',
  'Indexa Capital: Spain\'s Leading Robo-Advisor Reviewed',
  'Scalable Capital vs Interactive Brokers for Spanish Investors',
  'Finizens vs Indexa Capital: Which Robo-Advisor Wins?',
  'Opening a Brokerage Account in Spain: Step by Step',

  // European investing
  'How to Choose an ETF in Europe',
  'How to Invest in the S&P 500 from Spain',
  'ISIN Codes Explained for Retail Investors',
  'Accumulating vs Distributing ETFs: What Spanish Investors Should Know',
  'Understanding TER (Total Expense Ratio)',
  'Currency Risk for European Investors',
  'MSCI World vs S&P 500',
  'The Case for Small-Cap Investing',
  'Sustainable and ESG Investing in Europe',
  'The Bogleheads Investment Philosophy',
  'How to Build a 3-Fund Portfolio',
  'All-Weather Portfolio Strategy',
  'The European FIRE Community',

  // Strategy & portfolio
  'Index Funds vs Individual Stocks',
  'Dollar Cost Averaging Explained',
  'Lump Sum vs Dollar Cost Averaging',
  'Rebalancing Your Portfolio',
  'Dividend Growth Investing',
  'Bond Allocation by Age',
  'Diversification: How Much Is Enough?',
  'Understanding Risk Tolerance',
  'International Investing',
  'What Is a Robo-Advisor?',
  'How to Invest Your First €1,000',
  'How to Invest a Windfall',
  'When Should You Sell Investments?',

  // Market dynamics
  'Understanding Market Volatility',
  'Inflation and Your Investments',
  'How to Protect Wealth During a Recession',
  'Sequence of Returns Risk',

  // Retirement & net worth
  'The 4% Rule for Retirement: A European Perspective',
  'The Trinity Study and Safe Withdrawal Rates',
  'How Much Do You Need to Retire Early in Spain?',
  'Bucket Strategy for Retirement',
  'The FIRE Movement',
  'Net Worth Tracking: Why It Matters',
  'Understanding Your Net Worth Statement',
  'Pension vs Private Investment Accounts in Spain',

  // Life stages
  'Building Wealth in Your 20s',
  'Building Wealth in Your 30s',
  'Building Wealth in Your 40s',
  'Investing in Your 50s: What Changes',
  'Real Estate Investment in Spain: What to Know',
  'Building Generational Wealth',
  'Estate Planning Basics in Spain',

  // Other
  'Ray Dalio\'s Investment Principles',
  'Warren Buffett\'s Advice for Regular Investors',
];

const getUnusedTopic = async () => {
  // Load previously used topics from DynamoDB
  let usedTopics = [];
  try {
    const result = await docClient.send(new GetCommand({
      TableName: 'wealth-planner-blog-posts',
      Key: { postId: 'USED_TOPICS' }
    }));
    usedTopics = result.Item?.topics || [];
  } catch (err) {
    console.log('No used topics found, starting fresh');
  }

  const usedSet = new Set(usedTopics);
  const unused = BLOG_TOPICS.filter(t => !usedSet.has(t));

  let topic;
  if (unused.length > 0) {
    // Pick the next unused topic in order
    topic = unused[0];
  } else {
    // All topics exhausted — reset and start the cycle again
    console.log('All topics used, resetting cycle');
    usedTopics = [];
    topic = BLOG_TOPICS[0];
  }

  // Persist the updated used-topics list
  usedTopics.push(topic);
  await docClient.send(new PutCommand({
    TableName: 'wealth-planner-blog-posts',
    Item: { postId: 'USED_TOPICS', topics: usedTopics }
  }));

  return topic;
};

const PHOTO_POOL = [
  'photo-1554224155-8d04cb21cd6c', 'photo-1579621970563-ebec7560ff3e',
  'photo-1590283603385-17ffb3a7f29f', 'photo-1553729459-efe14ef6055d',
  'photo-1559526324-4b87b5e36e44', 'photo-1434626881859-194d67b2b86f',
  'photo-1579532537598-459ecdaf39cc', 'photo-1563986768609-322da13575f3',
  'photo-1611974789855-9c2a0a7236a3', 'photo-1460925895917-afdab827c52f',
  'photo-1518186285589-2f7649de83e0', 'photo-1507679799987-c73779587ccf',
  'photo-1551836022-deb4988cc6c0', 'photo-1450101499163-c8848c66ca85',
  'photo-1526304640581-d334cdbbf45e', 'photo-1543286386-713bdd548da4',
  'photo-1454165804606-c3d57bc86b40', 'photo-1488190211105-8b0e65b80b4e',
  'photo-1499750310107-5fef28a66643', 'photo-1521791136064-7986c2920216',
  'photo-1486312338219-ce68d2c6f44d', 'photo-1600880292203-757bb62b4baf',
  'photo-1565372195458-9de0b320ef04', 'photo-1444653614773-995cb1ef9efa',
  'photo-1520607162513-77705c0f0d4a', 'photo-1434030216411-0b793f4b4173',
  'photo-1559526323-cb2f2fe2591b', 'photo-1638913662252-70efce1e60a7',
  'photo-1535320903710-d993d3d77d29', 'photo-1591696331111-ef9586a5b17a',
  'photo-1468254095679-bbcba94a7066', 'photo-1504711434969-e33886168f5c',
  'photo-1516383740770-fbcc5ccbece0', 'photo-1572021335469-31706a17aaef',
  'photo-1611532736597-de2d4265fba3', 'photo-1559523161-0fc0d8b38a7a',
  'photo-1567427017947-545c5f8d16ad', 'photo-1504868584819-f8e8b4b6d7e3',
  'photo-1560472354-b33ff0c44a43', 'photo-1553484771-371a605b060b',
  'photo-1515378791036-0648a814c963', 'photo-1536494126589-29fadf0d7e3b',
];

const getUniqueHeroImage = async () => {
  // Load all previously used hero images
  let usedImages = [];
  try {
    const result = await docClient.send(new GetCommand({
      TableName: 'wealth-planner-blog-posts',
      Key: { postId: 'USED_IMAGES' }
    }));
    usedImages = result.Item?.images || [];
  } catch (err) {
    console.log('No used images found, starting fresh');
  }

  const usedSet = new Set(usedImages);

  // Pick first unused image from pool
  let heroImage = null;
  for (const photoId of PHOTO_POOL) {
    const url = `https://images.unsplash.com/${photoId}?w=1200&h=600&fit=crop`;
    if (!usedSet.has(url)) {
      heroImage = url;
      break;
    }
  }

  // If pool is exhausted, reuse least-recently used
  if (!heroImage) {
    const photoId = PHOTO_POOL[usedImages.length % PHOTO_POOL.length];
    heroImage = `https://images.unsplash.com/${photoId}?w=1200&h=600&fit=crop`;
    console.log('Photo pool exhausted, reusing older images');
  }

  // Pick a different inline image (not the hero)
  const inlineImage = PHOTO_POOL
    .map(id => `https://images.unsplash.com/${id}?w=1200&h=600&fit=crop`)
    .find(url => url !== heroImage) || heroImage;

  // Persist hero image to USED_IMAGES permanently (no cap)
  usedImages.push(heroImage);
  await docClient.send(new PutCommand({
    TableName: 'wealth-planner-blog-posts',
    Item: { postId: 'USED_IMAGES', images: usedImages }
  }));

  return [heroImage, inlineImage];
};

const CONTENT_MAP = {
  'The Psychology of Wealth Building': (img1, img2) => `![The Psychology of Wealth Building](${img1})

Your mindset shapes every financial decision you make. Understanding the psychology behind wealth building is crucial for long-term success.

The scarcity versus abundance mindset plays a huge role. People with scarcity thinking focus on what they lack, leading to fear-based decisions. Those with abundance thinking see opportunities and take calculated risks.

Delayed gratification is perhaps the most important psychological trait. The famous marshmallow experiment showed that children who could wait for a bigger reward later achieved more success in life. The same applies to wealth.

![Mindset Matters](${img2})

Your relationship with money often stems from childhood. Did your parents fight about money? Were you taught that "money is the root of all evil"? These beliefs, often unconscious, sabotage your wealth-building efforts.

The comparison trap destroys wealth. Social media makes it worse - everyone's highlight reel makes you feel behind. But wealth building is personal. Focus on your own journey, not others' appearances.

Emotional spending is wealth's enemy. Retail therapy, stress eating out, impulse purchases - these are psychological coping mechanisms that drain your resources. Developing healthier coping strategies protects your wealth.

#WealthMindset #FinancialPsychology #MoneyMindset #WealthBuilding`,

  'Index Funds vs Individual Stocks': (img1, img2) => `![Index Funds vs Individual Stocks](${img1})

The debate between index funds and individual stocks has raged for decades. Understanding both approaches helps you make informed decisions.

Index funds offer instant diversification. When you buy an S&P 500 index fund, you own pieces of 500 companies. If one fails, it barely affects you.

The data strongly favors index funds. Studies show that over 90% of active fund managers fail to beat the market over 15-year periods. If professionals can't consistently pick winning stocks, what chance do individual investors have?

![Market Performance](${img2})

Individual stocks offer higher potential returns - but also higher risk. If you pick the next Amazon early, you could multiply your money many times. But for every Amazon, there are dozens of failed companies.

Costs matter enormously. Index funds charge 0.03-0.20% annually. Active trading costs much more in time and fees. Over decades, these cost differences compound into hundreds of thousands of dollars.

The best approach for most? Core index funds with perhaps 5-10% in individual stocks if you enjoy it. This gives you diversification's safety while allowing some active participation.

#IndexFunds #StockMarket #PassiveInvesting #InvestmentStrategy #ETFs`,

  'Building Multiple Income Streams': (img1, img2) => `![Building Multiple Income Streams](${img1})

Relying on a single income source is risky in today's economy. Building multiple income streams creates financial security and accelerates wealth building.

Start with your primary job, but don't stop there. Side hustles, freelancing, consulting - these add income without requiring you to quit your day job. Even an extra $500 monthly compounds to significant wealth over time.

Investment income is the ultimate passive stream. Dividends, interest, rental income - money working for you while you sleep. This is how the wealthy stay wealthy.

![Multiple Streams](${img2})

Digital products offer scalability. Create once, sell forever. Ebooks, courses, templates, software - these require upfront work but can generate income for years.

Rental properties provide monthly cash flow plus appreciation. Yes, they require work and capital, but they're a proven wealth builder. Start with house hacking - rent out rooms in your home.

Don't spread yourself too thin. Three solid income streams beat ten mediocre attempts. Focus on streams that align with your skills and interests.

#MultipleIncomeStreams #PassiveIncome #SideHustle #FinancialFreedom`,

  'The 4% Rule for Retirement': (img1, img2) => `![The 4% Rule for Retirement](${img1})

The 4% rule is retirement planning's most famous guideline. Understanding it helps you determine how much you need to retire comfortably.

The rule states: withdraw 4% of your portfolio in year one of retirement, then adjust for inflation annually. Historically, this approach has sustained portfolios for 30+ years.

The math is simple. Need $40,000 annually? You need $1 million saved ($1M × 4% = $40K). Want $80,000? Save $2 million. This clarity helps you set concrete savings goals.

![Retirement Planning](${img2})

But the 4% rule has critics. It's based on historical data, and past performance doesn't guarantee future results. Lower expected returns might require a 3% or 3.5% withdrawal rate.

Your retirement age matters. Retiring at 50 means your money must last longer than retiring at 65. Earlier retirement might require a 3% rule.

Flexibility is key. The 4% rule assumes fixed spending, but real life is flexible. Spend less in down markets, more in good years. This dynamic approach significantly improves success rates.

#RetirementPlanning #4PercentRule #FinancialIndependence #FIRE`,

  'Planes de Pensiones in Spain: Are They Worth It?': (img1, img2) => `![Planes de Pensiones in Spain](${img1})

Planes de Pensiones are Spain's main tax-advantaged retirement vehicle. Contributions are deducted directly from your IRPF taxable base — meaning if you contribute €1,500 and you're in the 30% bracket, you save €450 in taxes that year.

Since 2022, the individual annual limit was reduced to €1,500 (down from €8,000). However, employer plans (planes de empleo) allow up to €8,500 more, making them far more attractive if your company offers one.

The catch is liquidity. Your money is locked until retirement, serious illness, long-term unemployment, or 10 years from the contribution date (from 2025 onwards for contributions made after 2015). This illiquidity is the price of the tax break.

![Retirement Planning Spain](${img2})

At withdrawal, the money is taxed as ordinary income — not as capital gains. This matters enormously. If you withdraw a large lump sum, it could push you into a higher IRPF bracket. Taking it as a monthly income smooths this out.

For high earners (marginal rate above 30%), planes de pensiones still make sense — especially employer plans. For lower earners, a fondo de inversión or ETF portfolio may offer more flexibility with comparable net returns.

The verdict: use them, but don't over-rely on them. Complement your plan with flexible, liquid investments in fondos or ETFs.

#PlanesDePensiones #Spain #IRPF #RetirementSpain #InversionEspana`
};

const generateBlogContent = async (topic) => {
  const prompt = `Write a 600-word blog post about "${topic}" for a Spanish wealth planning app aimed at investors living in Spain.

Important context:
- The audience is based in Spain. Focus on Spanish and European financial products, regulations, and tax rules (IRPF, retención, impuesto de sucesiones, etc.).
- Do NOT mention US-specific products like 401(k), Roth IRA, HSA, 529 plans, or Social Security. Instead reference Spanish equivalents: Planes de Pensiones, PIAS, fondos de inversión, Seguridad Social, etc.
- Where relevant, mention Spanish/European brokers and platforms: DEGIRO, Interactive Brokers, MyInvestor, Indexa Capital, Finizens, Scalable Capital.
- Reference European ETFs and funds (UCITS-compliant, listed on Euronext, Xetra, or BME) rather than US-domiciled funds.
- Use euros (€) not dollars ($) for all monetary examples.
- Tax references should be to Spanish law: investment gains are taxed as "rendimientos del capital mobiliario" at 19-28% depending on the bracket.

Make it practical, actionable, and engaging. Include specific examples and numbers.
Structure: 6-8 short paragraphs (2-3 sentences each).
End with 3-5 relevant hashtags.
Do not include a title or image placeholders - just the content.`;

  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 1500,
    messages: [{
      role: "user",
      content: prompt
    }]
  };

  const command = new InvokeModelCommand({
    modelId: "us.anthropic.claude-haiku-4-5-20251001-v1:0",
    body: JSON.stringify(payload)
  });

  const response = await bedrock.send(command);
  const result = JSON.parse(new TextDecoder().decode(response.body));
  return result.content[0].text;
};

const generateBlogPost = async (topic, postNumber) => {
  const [heroImage] = await getUniqueHeroImage();

  const aiContent = await generateBlogContent(topic);

  return {
    title: topic,
    content: aiContent,
    image: heroImage,
    publishedDate: new Date().toISOString(),
    postNumber
  };
};

exports.handler = async (event) => {
  try {
    // Get a topic that hasn't been published yet
    const topic = await getUnusedTopic();
    console.log(`Generating post for topic: "${topic}"`);

    // Increment the post counter (for postNumber tracking only)
    let counter = 0;
    try {
      const counterResult = await docClient.send(new GetCommand({
        TableName: 'wealth-planner-blog-posts',
        Key: { postId: 'COUNTER' }
      }));
      counter = counterResult.Item?.count || 0;
    } catch (err) {
      console.log('No counter found, starting at 0');
    }

    const postNumber = counter + 1;
    const post = await generateBlogPost(topic, postNumber);

    await docClient.send(new PutCommand({
      TableName: 'wealth-planner-blog-posts',
      Item: {
        postId: `post-${Date.now()}`,
        ...post
      }
    }));

    await docClient.send(new PutCommand({
      TableName: 'wealth-planner-blog-posts',
      Item: {
        postId: 'COUNTER',
        count: postNumber
      }
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Blog post created', topic, postNumber })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
