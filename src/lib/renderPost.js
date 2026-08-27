const escapeHtml = (s) => s
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

export function extractTags(content) {
  const hashtagLine = content.split('\n\n').find(p =>
    p.trim().startsWith('#') && p.includes(' #')
  );
  return hashtagLine
    ? hashtagLine.trim().split(/\s+/).filter(t => t.startsWith('#')).map(t => t.replace('#', ''))
    : ['Inversión', 'Patrimonio', 'Independencia financiera'];
}

export function cleanExcerpt(content, length = 180) {
  const clean = content
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,3}\s+/g, '')
    .replace(/#[A-Za-zÀ-ɏ]+/g, '')
    .replace(/\n\n+/g, ' ')
    .trim();
  return clean.substring(0, length) + '...';
}

// Same markdown-lite format Blog.jsx renders client-side, ported to
// produce a static HTML string at build time instead of React elements.
export function renderPostHtml(content) {
  const contentWithoutImages = content.replace(/!\[.*?\]\(.*?\)\n?\n?/g, '');

  return contentWithoutImages.split('\n\n').map((paragraph) => {
    if (!paragraph.trim()) return '';

    const headingMatch = paragraph.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const tag = level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3';
      return `<${tag}>${escapeHtml(headingMatch[2])}</${tag}>`;
    }

    if (paragraph.startsWith('#') && paragraph.includes(' #')) {
      const hashtags = paragraph.split(' ').filter(tag => tag.startsWith('#'));
      const pills = hashtags.map(tag => `<span class="hashtag">${escapeHtml(tag)}</span>`).join('');
      return `<div class="hashtags">${pills}</div>`;
    }

    const processedText = paragraph
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');

    return `<p>${processedText}</p>`;
  }).join('\n');
}
