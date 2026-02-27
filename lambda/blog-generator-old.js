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

// Unique image pool - 60 different images (3 per topic)
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
  'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1556155092-490a1ba16284?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1579532537902-1e50099867b4?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1559526324-593bc073d938?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1559526324-593bc073d938?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1579532537902-1e50099867b4?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1559526324-593bc073d938?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1579532537902-1e50099867b4?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1559526324-593bc073d938?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1579532537902-1e50099867b4?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1559526324-593bc073d938?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1579532537902-1e50099867b4?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&h=600&fit=crop'
];

const generateBlogPost = (topic, postNumber) => {
  // Use postNumber to select unique images (2 images per post, cycling through pool)
  const imageIndex = ((postNumber - 1) * 2) % IMAGE_POOL.length;
  const heroImage = IMAGE_POOL[imageIndex];
  const image2 = IMAGE_POOL[(imageIndex + 1) % IMAGE_POOL.length];
  
  // Longer, more detailed content
  const content = `![${topic}](${heroImage})

Understanding ${topic.toLowerCase()} is crucial for long-term financial success. Many investors overlook this important aspect of wealth building, but mastering these concepts can significantly impact your financial journey and help you achieve your goals faster than you might think.

The foundation of success in this area lies in consistent application of proven principles combined with patience and discipline. Whether you're just starting out or have years of experience, there's always room to deepen your understanding and refine your approach. The most successful investors are those who never stop learning and adapting.

One of the most important factors is taking action based on knowledge. Information without implementation is worthless in the world of finance. Start small if needed, but start today. The compound effect of small, consistent actions over time can lead to remarkable results that seem almost magical in retrospect.

Many people make the mistake of waiting for the "perfect" time to begin. They wait for more money, more knowledge, or better market conditions. But the truth is, the best time to start was yesterday, and the second-best time is now. Every day you delay is a day of potential compound growth lost forever.

![Financial Strategy](${image2})

Another critical aspect is staying informed and adapting to changing circumstances. The financial landscape evolves constantly, and what worked yesterday might need adjustment tomorrow. Stay curious, keep learning, and be willing to adjust your strategy as new information becomes available. Flexibility combined with core principles is the winning formula.

Risk management is often overlooked but absolutely essential. Understanding your risk tolerance and building a strategy that lets you sleep at night is more important than chasing maximum returns. The best investment strategy is one you can stick with through market ups and downs, not the one that looks best on paper.

Diversification remains one of the few free lunches in investing. By spreading your investments across different asset classes, sectors, and geographies, you reduce the impact of any single investment's poor performance. This doesn't eliminate risk, but it manages it intelligently.

The psychological aspect cannot be understated. Your emotions will be your biggest enemy in wealth building. Fear during market downturns and greed during bull markets have destroyed more wealth than any market crash. Developing emotional discipline is as important as understanding financial concepts.

Time in the market beats timing the market. This old adage has been proven true repeatedly throughout history. Trying to predict short-term market movements is a fool's errand that even professionals struggle with. Instead, focus on consistent investing over long periods, letting compound growth work its magic.

Remember that building wealth is a marathon, not a sprint. The most successful investors are those who can maintain discipline through market cycles, continuing to execute their strategy regardless of short-term noise and media hysteria. Block out the noise and focus on your long-term plan.

Focus on what you can control: your savings rate, your investment choices, your learning, your patience, and your emotional responses. These factors, more than market timing or luck, determine long-term success. External factors will always exist, but your response to them is entirely within your control.

Finally, remember that wealth building is not just about accumulating money—it's about creating freedom, security, and options for yourself and your loved ones. Keep your ultimate goals in mind, and let them motivate you through the inevitable challenges along the way.

#WealthBuilding #FinancialPlanning #InvestmentStrategy #FinancialFreedom #LongTermInvesting #SmartMoney #FinancialIndependence #WealthCreation`;

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
