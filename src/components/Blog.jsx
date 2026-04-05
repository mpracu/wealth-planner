import { useState, useEffect } from 'react';
import './Blog.css';

const FALLBACK_IMAGES = [
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
];

const getFallbackImage = (postId, index) => {
  const hash = (postId || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), index * 7);
  return `https://images.unsplash.com/${FALLBACK_IMAGES[hash % FALLBACK_IMAGES.length]}?w=1200&h=600&fit=crop`;
};

function Blog() {
  const [selectedPost, setSelectedPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await fetch('https://rkjlzbsc84.execute-api.us-east-1.amazonaws.com/prod/blog-posts');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setPosts(data.map((post, index) => {
        const cleanContent = post.content
          .replace(/!\[.*?\]\(.*?\)/g, '')
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/#{1,3}\s+/g, '')
          .replace(/#[A-Za-z]+/g, '')
          .replace(/\n\n+/g, ' ')
          .trim();

        const image = post.image || getFallbackImage(post.postId, index);

        return {
          id: post.postId,
          title: post.title,
          date: new Date(post.publishedDate).toISOString().split('T')[0],
          author: 'Wealth Planner Team',
          readTime: '8 min read',
          tags: ['Investing', 'Wealth Building', 'Financial Independence'],
          image,
          excerpt: cleanContent.substring(0, 180) + '...',
          content: post.content,
          fallbackImage: getFallbackImage(post.postId, index + 1),
        };
      }));
    } catch (error) {
      console.error('Error loading blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (content, fallbackImage) => {
    const contentWithoutFirstImage = content.replace(/^!\[.*?\]\(.*?\)\n\n/, '');
    let inlineImageCount = 0;

    return contentWithoutFirstImage.split('\n\n').map((paragraph, idx) => {
      // Images
      if (paragraph.startsWith('![')) {
        const match = paragraph.match(/!\[(.*?)\]\((.*?)\)/);
        if (match) {
          inlineImageCount++;
          const src = match[2] || fallbackImage;
          return <img key={idx} src={src} alt={match[1]} className="blog-image" />;
        }
      }

      // Headings
      const headingMatch = paragraph.match(/^(#{1,3})\s+(.+)/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = headingMatch[2];
        if (level === 1) return <h1 key={idx}>{text}</h1>;
        if (level === 2) return <h2 key={idx}>{text}</h2>;
        return <h3 key={idx}>{text}</h3>;
      }

      // Hashtag lines
      if (paragraph.startsWith('#') && paragraph.includes(' #')) {
        const hashtags = paragraph.split(' ').filter(tag => tag.startsWith('#'));
        return (
          <div key={idx} className="hashtags">
            {hashtags.map((tag, i) => <span key={i} className="hashtag">{tag}</span>)}
          </div>
        );
      }

      const processedText = paragraph
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');

      return <p key={idx} dangerouslySetInnerHTML={{ __html: processedText }} />;
    });
  };

  if (loading) {
    return (
      <div className="blog">
        <div className="blog-header">
          <h1>Wealth Building Insights</h1>
          <p>Loading latest articles...</p>
        </div>
      </div>
    );
  }

  if (selectedPost) {
    return (
      <div className="blog">
        <button className="back-btn" onClick={() => setSelectedPost(null)}>
          ← Back to all posts
        </button>
        <article className="blog-post-full">
          <img src={selectedPost.image} alt={selectedPost.title} className="post-hero-image" />
          <div className="post-header">
            <h1>{selectedPost.title}</h1>
            <div className="post-meta">
              <span>By {selectedPost.author}</span>
              <span>•</span>
              <span>{selectedPost.date}</span>
              <span>•</span>
              <span>{selectedPost.readTime}</span>
            </div>
            <div className="post-tags">
              {selectedPost.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>
          <div className="post-content">
            {renderContent(selectedPost.content, selectedPost.fallbackImage)}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="blog">
      <div className="blog-header">
        <h1>Wealth Building Insights</h1>
        <p>Expert advice and strategies for building lasting wealth. New posts every 2 days.</p>
      </div>

      <div className="blog-grid">
        {posts.map(post => (
          <article key={post.id} className="blog-card" onClick={() => setSelectedPost(post)}>
            <img src={post.image} alt={post.title} />
            <div className="blog-card-content">
              <div className="blog-card-tags">
                {post.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              <h2>{post.title}</h2>
              <p className="excerpt">{post.excerpt}</p>
              <div className="blog-card-meta">
                <span>{post.date}</span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Blog;
