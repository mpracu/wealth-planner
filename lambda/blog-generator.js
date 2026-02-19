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
  // Use postNumber to select unique images (3 images per post, cycling through pool)
  const imageIndex = ((postNumber - 1) * 3) % IMAGE_POOL.length;
  const heroImage = IMAGE_POOL[imageIndex];
  const image2 = IMAGE_POOL[(imageIndex + 1) % IMAGE_POOL.length];
  const image3 = IMAGE_POOL[(imageIndex + 2) % IMAGE_POOL.length];
  
  // Generic content that works for any topic
  const content = `![${topic}](${heroImage})

Understanding ${topic.toLowerCase()} is crucial for long-term financial success. Many investors overlook this important aspect of wealth building, but mastering these concepts can significantly impact your financial journey.

The key to success in this area lies in consistent application of proven principles. Whether you're just starting out or have years of experience, there's always room to deepen your understanding and refine your approach.

![Financial Strategy](${image2})

One of the most important factors is taking action. Knowledge without implementation is worthless. Start small if needed, but start today. The compound effect of small, consistent actions over time can lead to remarkable results.

Another critical aspect is staying informed and adapting to changing circumstances. The financial landscape evolves, and what worked yesterday might need adjustment tomorrow. Stay curious, keep learning, and be willing to adjust your strategy as needed.

![Long-term Success](${image3})

Remember that building wealth is a marathon, not a sprint. The most successful investors are those who can maintain discipline through market cycles, continuing to execute their strategy regardless of short-term noise.

Focus on what you can control: your savings rate, your investment choices, your learning, and your patience. These factors, more than market timing or luck, determine long-term success.

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
