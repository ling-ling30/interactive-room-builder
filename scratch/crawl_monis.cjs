const fs = require('fs');

async function testPage() {
  const res = await fetch('https://monis.rent/products/electrical-adjustable-desk');
  const html = await res.text();
  console.log('HTML length:', html.length);

  // Check __NEXT_DATA__
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (nextDataMatch) {
    console.log('Found __NEXT_DATA__!');
    fs.writeFileSync('scratch/next_data.json', nextDataMatch[1]);
  }

  // Check JSON-LD
  const jsonLdMatches = html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
  for (const m of jsonLdMatches) {
    console.log('JSON-LD:', m[1].slice(0, 300));
  }

  // Check script tags with product data or state
  const scripts = html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g);
  let count = 0;
  for (const s of scripts) {
    count++;
    if (s[1].includes('variant') || s[1].includes('price') || s[1].includes('product')) {
      console.log(`Script ${count} has keywords! Length: ${s[1].length}`);
      if (s[1].length > 500 && s[1].length < 100000) {
        fs.writeFileSync(`scratch/script_${count}.js`, s[1]);
      }
    }
  }

  // Also check sitemap to find all products
  const sitemapRes = await fetch('https://monis.rent/sitemap.xml');
  if (sitemapRes.ok) {
    const sitemap = await sitemapRes.text();
    console.log('Sitemap length:', sitemap.length);
    fs.writeFileSync('scratch/sitemap.xml', sitemap);
  }
}

testPage().catch(console.error);
