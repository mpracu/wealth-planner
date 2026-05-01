import { useState, useEffect } from 'react';
import { ArrowLeft, Link, MessageCircle } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
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
  const { t } = useLanguage();
  const [selectedPost, setSelectedPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  // Deep-link: open post from ?post= query param once posts are loaded
  useEffect(() => {
    if (posts.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('post');
    if (postId) {
      const post = posts.find(p => p.id === postId);
      if (post) setSelectedPost(post);
    }
  }, [posts]);

  // Handle browser back button
  useEffect(() => {
    const onPop = () => {
      const params = new URLSearchParams(window.location.search);
      if (!params.get('post')) setSelectedPost(null);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const openPost = (post) => {
    setSelectedPost(post);
    window.history.pushState({ postId: post.id }, '', `?post=${post.id}`);
  };

  const goBack = () => {
    setSelectedPost(null);
    window.history.pushState({}, '', window.location.pathname);
  };

  const getShareUrl = (post) =>
    `${window.location.origin}${window.location.pathname}?post=${post.id}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(getShareUrl(selectedPost));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const loadPosts = async () => {
    try {
      const response = await fetch('https://rkjlzbsc84.execute-api.us-east-1.amazonaws.com/prod/blog-posts');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setPosts(data.map((post, index) => {
        const hashtagLine = post.content.split('\n\n').find(p =>
          p.trim().startsWith('#') && p.includes(' #')
        );
        const tags = hashtagLine
          ? hashtagLine.trim().split(/\s+/).filter(t => t.startsWith('#')).map(t => t.replace('#', ''))
          : ['Inversión', 'Patrimonio', 'Independencia financiera'];

        const cleanContent = post.content
          .replace(/!\[.*?\]\(.*?\)/g, '')
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/#{1,3}\s+/g, '')
          .replace(/#[A-Za-zÀ-ɏ]+/g, '')
          .replace(/\n\n+/g, ' ')
          .trim();

        const image = post.image || getFallbackImage(post.postId, index);

        return {
          id: post.postId,
          title: post.title,
          date: new Date(post.publishedDate).toISOString().split('T')[0],
          author: t('blog.author'),
          readTime: t('blog.readTime'),
          tags,
          image,
          excerpt: cleanContent.substring(0, 180) + '...',
          content: post.content,
        };
      }));
    } catch (error) {
      console.error('Error loading blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (content) => {
    const contentWithoutImages = content.replace(/!\[.*?\]\(.*?\)\n?\n?/g, '');

    return contentWithoutImages.split('\n\n').map((paragraph, idx) => {
      if (!paragraph.trim()) return null;

      const headingMatch = paragraph.match(/^(#{1,3})\s+(.+)/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = headingMatch[2];
        if (level === 1) return <h1 key={idx}>{text}</h1>;
        if (level === 2) return <h2 key={idx}>{text}</h2>;
        return <h3 key={idx}>{text}</h3>;
      }

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
          <h1>{t('blog.title')}</h1>
          <p>{t('blog.loading')}</p>
        </div>
      </div>
    );
  }

  if (selectedPost) {
    const shareUrl = getShareUrl(selectedPost);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(selectedPost.title + '\n' + shareUrl)}`;
    return (
      <div className="blog">
        <button className="back-btn" onClick={goBack}>
          <ArrowLeft size={15} /> {t('blog.back')}
        </button>
        <article className="blog-post-full">
          <img src={selectedPost.image} alt={selectedPost.title} className="post-hero-image" />
          <div className="post-header">
            <h1>{selectedPost.title}</h1>
            <div className="post-meta">
              <span>{t('blog.by')}{selectedPost.author}</span>
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
          <div className="share-bar">
            <span className="share-label">{t('blog.share')}</span>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="share-btn share-btn--whatsapp">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
            <button className={`share-btn share-btn--copy${copied ? ' copied' : ''}`} onClick={copyLink}>
              <Link size={14} />
              {copied ? t('blog.copied') : t('blog.copyLink')}
            </button>
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
        <h1>{t('blog.title')}</h1>
        <p>{t('blog.desc')}</p>
      </div>

      <div className="blog-grid">
        {posts.map(post => (
          <article key={post.id} className="blog-card" onClick={() => openPost(post)}>
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
