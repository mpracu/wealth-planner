const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

const BLOG_TOPICS = [
  'The Psychology of Wealth Building',
  'Index Funds vs Individual Stocks',
  'Building Multiple Income Streams',
  'The 4% Rule for Retirement',
  'Tax-Advantaged Investment Accounts'
];

const IMAGE_POOL = [
  'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=1200&h=600&fit=crop'
];

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

const generateBlogPost = (topic, postNumber) => {
  const imageIndex = ((postNumber - 1) * 2) % IMAGE_POOL.length;
  const heroImage = IMAGE_POOL[imageIndex];
  const image2 = IMAGE_POOL[(imageIndex + 1) % IMAGE_POOL.length];
  
  const contentGenerator = CONTENT_MAP[topic];
  const content = contentGenerator ? contentGenerator(heroImage, image2) : `![${topic}](${heroImage})

This is a placeholder for ${topic}. Content coming soon!

#WealthBuilding #FinancialPlanning`;

  return {
    title: topic,
    content: content,
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
    
    const post = generateBlogPost(topic, postNumber);
    
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
