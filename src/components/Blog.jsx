import { useState, useEffect } from 'react';
import './Blog.css';

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
      const data = await response.json();
      setPosts(data.map(post => ({
        id: post.postId,
        title: post.title,
        date: new Date(post.publishedDate).toISOString().split('T')[0],
        author: 'Wealth Planner Team',
        readTime: '8 min read',
        tags: ['Investing', 'Wealth Building', 'Financial Independence'],
        image: post.image,
        excerpt: post.content.substring(0, 200) + '...',
        content: post.content
      })));
    } catch (error) {
      console.error('Error loading blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (content) => {
    return content.split('\n\n').map((paragraph, idx) => {
      if (paragraph.startsWith('![')) {
        const match = paragraph.match(/!\[(.*?)\]\((.*?)\)/);
        if (match) {
          return <img key={idx} src={match[2]} alt={match[1]} className="blog-image" />;
        }
      }
      
      let processedText = paragraph
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      return <p key={idx} dangerouslySetInnerHTML={{ __html: processedText }} />;
    });
  };

  if (loading) {
    return (
      <div className="blog">
        <div className="blog-header">
          <h1>💡 Wealth Building Insights</h1>
          <p>Loading latest articles...</p>
        </div>
      </div>
    );
  }

  if (selectedPost) {
    return (
      <div className="blog">
        <button className="back-button" onClick={() => setSelectedPost(null)}>
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
            {renderContent(selectedPost.content)}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="blog">
      <div className="blog-header">
        <h1>💡 Wealth Building Insights</h1>
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
