const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(client);

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
  'Building Wealth in Your 20s/30s/40s',
  'Estate Planning Basics',
  'Understanding Risk Tolerance',
  'The Power of Patience in Investing',
  'Avoiding Common Investment Mistakes',
  'Building Generational Wealth'
];

const generateBlogPost = (topic, postNumber) => {
  const templates = {
    'The Psychology of Wealth Building': {
      content: `![Psychology of Wealth](https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&h=600&fit=crop)

Understanding the psychological aspects of wealth building is crucial for long-term financial success. Many people focus solely on the numbers—returns, interest rates, and portfolio balances—but overlook the mental game that determines whether they'll stick to their plan during market downturns or resist lifestyle inflation as their income grows.

The concept of delayed gratification sits at the heart of wealth building. Studies show that individuals who can resist immediate rewards in favor of larger future gains tend to accumulate significantly more wealth over their lifetimes. This isn't about deprivation; it's about making conscious choices that align with your long-term goals.

![Delayed Gratification](https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=1200&h=600&fit=crop)

One of the most powerful psychological tools is automating your finances. When investment contributions happen automatically, you remove the emotional decision-making from the equation. You're not tempted to skip a month because you saw something you wanted to buy. The money moves to your investment accounts before you have a chance to spend it.

Another critical aspect is understanding your relationship with money. Many of our financial behaviors are shaped by childhood experiences and societal messages. Some people view money as scarce and hoard it anxiously, while others see it as something to be spent immediately. Neither extreme serves wealth building well. The goal is to develop a balanced perspective where money is seen as a tool for creating the life you want.

Loss aversion is a well-documented psychological phenomenon where people feel the pain of losses more acutely than the pleasure of equivalent gains. This can lead investors to sell during market downturns, locking in losses, or to avoid investing altogether out of fear. Recognizing this bias in yourself is the first step to overcoming it.

The comparison trap is another wealth-building killer. Social media makes it easy to compare your financial situation to others, often leading to unnecessary spending to "keep up." Remember that wealth building is a personal journey, not a competition. Someone else's financial choices shouldn't dictate yours.

Finally, cultivate patience. Wealth building is a marathon, not a sprint. The most successful investors are those who can stay the course through market cycles, continuing to invest consistently regardless of short-term market movements. This psychological resilience, more than any investment strategy, often determines long-term success.

#WealthBuilding #InvestingPsychology #FinancialMindset #DelayedGratification #MoneyMindset #InvestmentStrategy #FinancialFreedom #WealthCreation`,
      image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&h=600&fit=crop'
    },
    'Index Funds vs Individual Stocks': {
      content: `![Index Funds](https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=600&fit=crop)

The debate between investing in index funds versus picking individual stocks is one of the most discussed topics in personal finance. Both approaches have their merits, but for most investors, the answer is clearer than you might think.

Index funds are investment vehicles that track a specific market index, like the S&P 500. When you buy an index fund, you're essentially buying a small piece of every company in that index. This provides instant diversification across hundreds or thousands of companies with a single purchase.

The primary advantage of index funds is simplicity combined with strong historical performance. Over the long term, index funds tracking major market indices have consistently outperformed the majority of actively managed funds and individual stock pickers. This isn't just a small edge—studies show that over 90% of actively managed funds fail to beat their benchmark index over 15-year periods.

![Stock Market](https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&h=600&fit=crop)

Cost is another significant factor. Index funds typically have expense ratios below 0.1%, meaning you pay less than $10 per year for every $10,000 invested. In contrast, actively managed funds often charge 1% or more, and the costs of researching and trading individual stocks can add up quickly through trading fees and the time investment required.

Individual stock picking, on the other hand, offers the potential for outsized returns if you can identify undervalued companies before the broader market does. Some investors find the research process engaging and enjoy the control that comes with building their own portfolio.

However, successful stock picking requires significant time, expertise, and emotional discipline. You need to understand financial statements, industry dynamics, competitive advantages, and valuation metrics. Even professional fund managers with teams of analysts struggle to consistently beat the market.

For most investors, especially those just starting out or who don't want to dedicate substantial time to investment research, index funds are the superior choice. They offer broad diversification, low costs, and historically strong returns with minimal effort required.

That said, there's no rule against combining both approaches. Many investors build a core portfolio of index funds for stability and diversification, then allocate a small percentage (perhaps 5-10%) to individual stocks they've researched and believe in. This "core and satellite" approach lets you scratch the stock-picking itch while keeping the bulk of your wealth in a proven strategy.

#IndexFunds #StockMarket #PassiveInvesting #Diversification #InvestmentStrategy #SP500 #ETF #FinancialIndependence`,
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=600&fit=crop'
    },
    'Building Multiple Income Streams': {
      content: `![Multiple Income Streams](https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&h=600&fit=crop)

The concept of multiple income streams has gained significant attention in recent years, and for good reason. Relying solely on a single source of income—typically a job—creates financial vulnerability. If that income source disappears, you're left scrambling. Multiple income streams provide security, accelerate wealth building, and offer more freedom in how you spend your time.

The first income stream for most people is their primary employment. This is typically your largest and most reliable source of income. Before diversifying, ensure this foundation is solid. Invest in your skills, build your professional network, and position yourself for advancement or higher-paying opportunities.

![Investment Income](https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop)

Investment income is often the second stream people develop. This includes dividends from stocks, interest from bonds, and capital gains from selling appreciated assets. The beauty of investment income is that it's largely passive once your portfolio is established. The key is to start early and invest consistently, allowing compound growth to work its magic over time.

Rental income from real estate is another popular stream. This could be a traditional rental property, a room in your home, or short-term rentals through platforms like Airbnb. Real estate can provide both monthly cash flow and long-term appreciation, though it requires more active management than stock investments.

Side businesses or freelancing represent active income streams that leverage your skills outside your primary job. This could be consulting, freelance writing, graphic design, tutoring, or any service you can provide. The advantage is that you control the income potential through the time and effort you invest.

Digital products and content creation offer scalable income opportunities. This includes creating online courses, writing ebooks, building apps, or monetizing a blog or YouTube channel. These require significant upfront effort but can generate ongoing income with minimal maintenance once established.

The key to successfully building multiple income streams is to start with one additional stream and build it to a meaningful level before adding another. Trying to develop too many streams simultaneously often results in none of them reaching their potential. Focus, build, then expand.

Remember that building multiple income streams is a long-term project. It might take years to develop each stream to a significant level. Be patient, stay consistent, and celebrate small wins along the way. The financial security and freedom that come from multiple income streams are worth the effort.

#MultipleIncomeStreams #PassiveIncome #SideHustle #FinancialFreedom #DiversifiedIncome #WealthBuilding #Entrepreneurship #FinancialIndependence`,
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&h=600&fit=crop'
    }
  };

  const template = templates[topic] || templates['The Psychology of Wealth Building'];
  
  return {
    title: topic,
    content: template.content,
    image: template.image,
    publishedDate: new Date().toISOString(),
    postNumber
  };
};

exports.handler = async (event) => {
  try {
    // Get or create counter
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
    
    // Save post
    await docClient.send(new PutCommand({
      TableName: 'wealth-planner-blog-posts',
      Item: {
        postId: `post-${Date.now()}`,
        ...post
      }
    }));
    
    // Update counter
    await docClient.send(new PutCommand({
      TableName: 'wealth-planner-blog-posts',
      Item: {
        postId: 'COUNTER',
        count: postNumber
      }
    }));
    
    console.log(`Published blog post #${postNumber}: ${topic}`);
    return { statusCode: 200, body: JSON.stringify({ message: 'Blog post published', topic, postNumber }) };
  } catch (error) {
    console.error('Error generating blog post:', error);
    throw error;
  }
};
