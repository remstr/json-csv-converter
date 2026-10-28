export default async function sitemap() {
  const baseUrl = 'https://jsontocsv.fyi';

  // List of all your tool routes
  const routes = [
    '',
    '/json-to-csv',
    '/image-converter',
    '/pdf-converter',
    '/qr-generator',
    '/diff-checker',
    '/signature-generator',
  ];

  const sitemapEntries = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));

  return sitemapEntries;
}
