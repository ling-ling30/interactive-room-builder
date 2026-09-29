const fs = require('fs');
const path = require('path');

const STRAPI_BASE = 'https://strapi.monis.rent';

async function fetchAllProducts() {
  console.log('Fetching products from Strapi...');
  let allRawProducts = [];
  let page = 1;
  let pageCount = 1;

  while (page <= pageCount) {
    console.log(`Fetching page ${page}...`);
    const url = `${STRAPI_BASE}/api/products?pagination[page]=${page}&pagination[pageSize]=100&populate=*`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch page ${page}: ${res.statusText}`);
    }
    const json = await res.json();
    pageCount = json.meta?.pagination?.pageCount || 1;
    const items = json.data || [];
    allRawProducts.push(...items);
    console.log(`Page ${page}/${pageCount}: fetched ${items.length} items.`);
    page++;
  }

  console.log(`Total raw products fetched: ${allRawProducts.length}`);

  // Process and normalize the data
  const normalizedProducts = allRawProducts.map(p => {
    const attr = p.attributes || {};

    // Categories
    const categories = (attr.product_categories?.data || []).map(c => c.attributes?.name).filter(Boolean);

    // Photos
    const photos = (attr.images?.data || []).map(img => {
      const imgAttr = img.attributes || {};
      const url = imgAttr.url ? (imgAttr.url.startsWith('http') ? imgAttr.url : `${STRAPI_BASE}${imgAttr.url}`) : null;
      const formats = imgAttr.formats || {};
      const medium = formats.medium?.url ? (formats.medium.url.startsWith('http') ? formats.medium.url : `${STRAPI_BASE}${formats.medium.url}`) : url;
      const thumbnail = formats.thumbnail?.url ? (formats.thumbnail.url.startsWith('http') ? formats.thumbnail.url : `${STRAPI_BASE}${formats.thumbnail.url}`) : url;
      return {
        id: img.id,
        url,
        medium,
        thumbnail,
        caption: imgAttr.caption || null,
        name: imgAttr.name || null,
      };
    }).filter(img => Boolean(img.url));

    // Variants (sizes, colors, specs)
    const variants = (attr.product_variants?.data || []).map(v => {
      const vAttr = v.attributes || {};
      return {
        id: v.id,
        name: vAttr.name,
        weeklyPrice: vAttr.weekly_price,
        monthlyPrice: vAttr.monthly_price,
        overOneMonthWeeklyPrice: vAttr.over_one_month_weekly_price,
        status: vAttr.status || vAttr.state,
      };
    });

    // Specifications / Sizes
    const specs = (attr.product_specs || []).map(s => ({
      headline: s.headline,
      text: s.text,
    }));

    // Find dimensions from specs or variants
    const dimensionSpec = specs.find(s => s.headline?.toUpperCase() === 'DIMENSION' || s.headline?.toUpperCase() === 'DIMENSIONS');
    const heightSpec = specs.find(s => s.headline?.toUpperCase() === 'HEIGHT');
    const materialSpec = specs.find(s => s.headline?.toUpperCase() === 'MATERIAL');
    const colorSpec = specs.find(s => s.headline?.toUpperCase() === 'COLOR');
    const loadSpec = specs.find(s => s.headline?.toUpperCase() === 'LOAD');
    const modelSpec = specs.find(s => s.headline?.toUpperCase() === 'MODEL');

    // Brand
    const brand = attr.product_brand?.data?.attributes?.name || 'Monis';

    return {
      id: p.id,
      slug: attr.slug,
      name: attr.name,
      shortDescription: attr.short_description || null,
      description: attr.description || null,
      categories,
      primaryCategory: categories[0] || 'Uncategorized',
      weeklyPrice: attr.weekly_price || 0,
      monthlyPrice: attr.monthly_price || 0,
      overOneMonthWeeklyPrice: attr.over_one_month_weekly_price || null,
      securityDeposit: attr.security_deposit || 0,
      setupCost: attr.setup_cost || 0,
      weightKg: attr.weight || null,
      brand,
      sizeCategory: attr.size_category || null,
      dimensions: dimensionSpec?.text || null,
      height: heightSpec?.text || null,
      material: materialSpec?.text || null,
      color: colorSpec?.text || null,
      maxLoad: loadSpec?.text || null,
      model: modelSpec?.text || null,
      allSpecs: specs,
      primaryPhoto: photos[0]?.medium || photos[0]?.url || null,
      photos,
      variants,
      whatsIncluded: (attr.product_whats_includeds?.data || []).map(w => w.attributes?.name || w.attributes?.title).filter(Boolean),
      sourceUrl: `https://monis.rent/products/${attr.slug}`,
      state: attr.state || attr.status,
    };
  });

  // Filter only active / in-store items or all
  const furnitureProducts = normalizedProducts.filter(p => 
    p.categories.some(c => c.toLowerCase().includes('furniture') || c.toLowerCase().includes('desk') || c.toLowerCase().includes('chair'))
  );

  console.log(`Total normalized products: ${normalizedProducts.length}`);
  console.log(`Furniture category products: ${furnitureProducts.length}`);

  // Write all products to JSON file
  const outDir = path.resolve(__dirname, '../src/data');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const allOutputPath = path.join(outDir, 'monisAllProducts.json');
  fs.writeFileSync(allOutputPath, JSON.stringify(normalizedProducts, null, 2));
  console.log(`Saved all products to ${allOutputPath}`);

  const furnitureOutputPath = path.join(outDir, 'monisFurnitureProducts.json');
  fs.writeFileSync(furnitureOutputPath, JSON.stringify(furnitureProducts, null, 2));
  console.log(`Saved furniture products to ${furnitureOutputPath}`);

  // Print summary of furniture items
  console.log('\n--- CRAWLED FURNITURE SUMMARY ---');
  furnitureProducts.forEach((f, idx) => {
    console.log(`${idx + 1}. [${f.name}]`);
    console.log(`   Price: $${f.weeklyPrice}/wk ($${f.monthlyPrice}/mo) | Deposit: $${f.securityDeposit}`);
    console.log(`   Sizes: ${f.dimensions || 'Standard'} | Height: ${f.height || 'N/A'}`);
    console.log(`   Variants (${f.variants.length}): ${f.variants.map(v => `${v.name} ($${v.weeklyPrice}/wk)`).join(', ') || 'None'}`);
    console.log(`   Photo: ${f.primaryPhoto}`);
    console.log('');
  });
}

fetchAllProducts().catch(err => {
  console.error('Crawl failed:', err);
  process.exit(1);
});
