export async function GET() {
  const apiBase = import.meta.env.VITE_API_ENDPOINT;
  const res = await fetch(`${apiBase}/blog-posts`);
  const posts = (await res.json()).filter((post) => post.slug);

  const today = new Date().toISOString().split('T')[0];
  const latestPost = posts.length
    ? posts.reduce((a, b) => (a.publishedDate > b.publishedDate ? a : b))
    : null;

  const urls = [
    { loc: 'https://caudalfinanzas.com/', lastmod: today, changefreq: 'weekly', priority: '1.0' },
    {
      loc: 'https://caudalfinanzas.com/blog/',
      lastmod: latestPost ? latestPost.publishedDate.split('T')[0] : today,
      changefreq: 'weekly',
      priority: '0.9',
    },
    ...posts.map((post) => ({
      loc: `https://caudalfinanzas.com/articulo/${post.slug}/`,
      lastmod: post.publishedDate.split('T')[0],
      changefreq: 'monthly',
      priority: '0.8',
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
