const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);
const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' });

const BLOG_TOPICS = [
  'The Psychology of Wealth Building',
  'Index Funds vs Individual Stocks',
  'Building Multiple Income Streams',
  'The 4% Rule for Retirement',
  'Tax-Advantaged Investment Accounts',
  'Real Estate Investment Basics',
  'Emergency Fund Strategies',
  'Debt Payoff vs Investing',
  'Dollar Cost Averaging Explained',
  'Understanding Market Volatility',
  'Dividend Growth Investing',
  'The FIRE Movement',
  'Rebalancing Your Portfolio',
  'Inflation and Your Investments',
  'Building Wealth in Your 20s',
  'Building Wealth in Your 30s',
  'Building Wealth in Your 40s',
  'Estate Planning Basics',
  'Understanding Risk Tolerance',
  'The Power of Patience in Investing',
  'Avoiding Common Investment Mistakes',
  'Building Generational Wealth',
  'Health Savings Accounts (HSAs)',
  'Backdoor Roth IRA Strategies',
  'International Investing'
];

const getUniqueImages = async (postNumber) => {
  const topics = ['finance', 'business', 'money', 'investment', 'wealth', 'banking', 'economy', 'stock-market'];
  
  // Get used images from DynamoDB
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
  
  // Generate unique images using Unsplash photo IDs
  const photoIds = [
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
    'photo-1516383740770-fbcc5ccbece0', 'photo-1633158829585-23ba8f7c8caf',
    'photo-1572021335469-31706a17aaef', 'photo-1611532736597-de2d4265fba3',
    'photo-1642543348745-03b1219733d9', 'photo-1559523161-0fc0d8b38a7a',
    'photo-1567427017947-545c5f8d16ad', 'photo-1617791160505-6f00504e3519',
    'photo-1504868584819-f8e8b4b6d7e3', 'photo-1560472354-b33ff0c44a43',
    'photo-1553484771-371a605b060b', 'photo-1614028674026-a65e31bfd27c',
    'photo-1623227866882-c8c41f5b6e44', 'photo-1559523161-0fc0d8b38a7a',
    'photo-1450101499163-c8848c66ca85', 'photo-1515378791036-0648a814c963',
    'photo-1507003211169-0a1dd7228f2d', 'photo-1536494126589-29fadf0d7e3b'
  ];
  
  const images = [];
  let attempts = 0;
  while (images.length < 2 && attempts < 20) {
    const photoId = photoIds[Math.floor(Math.random() * photoIds.length)];
    const img = `https://images.unsplash.com/${photoId}?w=1200&h=600&fit=crop`;
    
    if (!usedImages.includes(img) && !images.includes(img)) {
      images.push(img);
    }
    attempts++;
  }
  
  // Store used images (keep last 100)
  usedImages.push(...images);
  if (usedImages.length > 100) {
    usedImages = usedImages.slice(-100);
  }
  
  await docClient.send(new PutCommand({
    TableName: 'wealth-planner-blog-posts',
    Item: {
      postId: 'USED_IMAGES',
      images: usedImages
    }
  }));
  
  return images;
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

  'Tax-Advantaged Investment Accounts': (img1, img2) => `![Tax-Advantaged Investment Accounts](${img1})

Tax-advantaged accounts are wealth building's secret weapons. Using them properly can save hundreds of thousands in taxes over your lifetime.

401(k)s offer immediate tax deductions and tax-deferred growth. Contributing $20,000 annually saves $5,000+ in taxes if you're in the 25% bracket. That's free money.

Roth IRAs provide tax-free growth and withdrawals. Pay taxes now, never again. For young investors, this is incredibly powerful. Decades of compound growth, all tax-free.

![Tax Strategy](${img2})

HSAs are the ultimate tax-advantaged account. Tax-deductible contributions, tax-free growth, tax-free withdrawals for medical expenses. It's a triple tax advantage.

529 plans make college savings tax-efficient. State tax deductions on contributions, tax-free growth, tax-free withdrawals for education.

The order matters: 401(k) to match, then max Roth IRA, then max 401(k), then HSA, then taxable accounts. This sequence optimizes your tax benefits.

#TaxStrategy #401k #RothIRA #HSA #RetirementAccounts #TaxPlanning`
};

const generateBlogContent = async (topic) => {
  const prompt = `Write a 600-word blog post about "${topic}" for a wealth planning app. 
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
    modelId: "anthropic.claude-3-haiku-20240307-v1:0",
    body: JSON.stringify(payload)
  });

  const response = await bedrock.send(command);
  const result = JSON.parse(new TextDecoder().decode(response.body));
  return result.content[0].text;
};

const generateBlogPost = async (topic, postNumber) => {
  const [heroImage, image2] = await getUniqueImages(postNumber);
  
  const aiContent = await generateBlogContent(topic);
  const paragraphs = aiContent.split('\n\n');
  const midPoint = Math.floor(paragraphs.length / 2);
  
  const contentWithImages = [
    `![${topic}](${heroImage})`,
    '',
    ...paragraphs.slice(0, midPoint),
    '',
    `![${topic}](${image2})`,
    '',
    ...paragraphs.slice(midPoint)
  ].join('\n\n');

  return {
    title: topic,
    content: contentWithImages,
    image: heroImage,
    publishedDate: new Date().toISOString(),
    postNumber
  };
};

exports.handler = async (event) => {
  try {
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
    const topicIndex = counter % BLOG_TOPICS.length;
    const topic = BLOG_TOPICS[topicIndex];
    
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
      body: JSON.stringify({ message: 'Blog post created', post })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
