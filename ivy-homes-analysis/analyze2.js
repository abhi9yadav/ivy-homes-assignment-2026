import fs from 'fs';

// Load data
const listings = JSON.parse(fs.readFileSync('./all_listings.json', 'utf8'));
const projects = JSON.parse(fs.readFileSync('./projects.json', 'utf8'));

console.log(`Total listings: ${listings.length}`);
console.log(`Total projects: ${projects.length}`);

// ---- Q1: Total listing records ----
// The API reports total=3759 but we have 3800 due to pages collected at different times.
// The authoritative number is what the API reports for total.
const total_listing_records = 3759;  // from API's total field

// ---- Q2: Unique properties ----
// De-duplication = same property listed on multiple portals
// Group by (apartment_name, locality, bedroom, floor, carpet_area) ignoring website
const prop_keys = {};
for (const l of listings) {
  const key = JSON.stringify([
    (l.apartment_name || '').toLowerCase().trim(),
    (l.locality || '').toLowerCase().trim(),
    l.bedroom,
    l.floor,
    l.carpet_area,
    l.bathroom
  ]);
  
  if (!prop_keys[key]) {
    prop_keys[key] = [];
  }
  prop_keys[key].push(l.listing_id);
}

const unique_properties = Object.keys(prop_keys).length;
console.log(`\nQ2 unique_properties = ${unique_properties}`);

// Show duplicates
const multi = Object.entries(prop_keys).filter(([k, v]) => v.length > 1);
console.log(`Properties listed on multiple portals: ${multi.length}`);
for (const [k, v] of multi.slice(0, 3)) {
  console.log(`  ${k}: ${JSON.stringify(v)}`);
}

// ---- Q3: Active listings ----
const active_listings = listings.filter(l => l.is_live === true).length;
console.log(`\nQ3 active_listings = ${active_listings}`);

// ---- Q4: Corrupt listing IDs ----
// Negative prices or impossibly low price/sqft
const corrupt_ids = [];
for (const l of listings) {
  const price = l.price || 0;
  const carpet = l.carpet_area || 0;
  let is_corrupt = false;
  
  if (price == null || price < 0) {
    is_corrupt = true;
  } else if (price > 0 && carpet && carpet > 0) {
    const ppsf = price / carpet;
    if (ppsf < 500) {  // less than Rs 500/sqft is impossible in Chennai
      is_corrupt = true;
    }
  }
  
  if (is_corrupt) {
    corrupt_ids.push(l.listing_id);
  }
}

console.log(`\nQ4 corrupt_listing_ids count = ${corrupt_ids.length}`);
console.log(`Q4 corrupt_listing_ids = ${JSON.stringify(corrupt_ids.sort())}`);

// ---- Q5: Total monthly rent ----
// No 'listing_type' or 'rent' field in the data
console.log("\nQ5: No rent field found in listings schema");
console.log(`Sample listing keys: ${Object.keys(listings[0]).join(', ')}`);

// Check descriptions for rent hints
const rent_listings = listings.filter(l => (l.locality || '').toLowerCase() === 'tambaram');
console.log(`Tambaram listings: ${rent_listings.length}`);
// Check if any field hints at rent
for (const l of rent_listings.slice(0, 3)) {
  console.log(`  ${l.listing_id}: price=${l.price}, desc=${(l.description || '').slice(0, 80)}`);
}

// ---- Q6: Avg price per sqft for 2BHK ----
const bhk2 = listings.filter(l =>
  l.bedroom === 2 &&
  l.carpet_area && l.carpet_area > 0 &&
  l.price && l.price > 0 &&
  l.price > 100000  // exclude corrupt
);

if (bhk2.length > 0) {
  const ppsfts = bhk2.map(l => l.price / l.carpet_area);
  const avg_ppsf_2bhk = ppsfts.reduce((a, b) => a + b, 0) / ppsfts.length;
  console.log(`\nQ6 avg_price_per_sqft_2bhk = ${avg_ppsf_2bhk.toFixed(2)} (n=${bhk2.length})`);
  
  // Also try super_built_up_area
  const bhk2_sba = bhk2.filter(l => l.super_built_up_area && l.super_built_up_area > 0);
  const ppsfts_sba = bhk2_sba.map(l => l.price / l.super_built_up_area);
  const avg_ppsf_2bhk_sba = ppsfts_sba.reduce((a, b) => a + b, 0) / ppsfts_sba.length;
  console.log(`Q6 avg_price_per_sqft_2bhk (by super_built_up_area) = ${avg_ppsf_2bhk_sba.toFixed(2)}`);
}

// ---- Q7: Costliest project ----
// Using actual listing prices
const project_max_prices = {};
for (const l of listings) {
  const pid = l.project_id;
  const price = l.price || 0;
  if (pid && price && price > 0) {
    if (!project_max_prices[pid] || price > project_max_prices[pid]) {
      project_max_prices[pid] = price;
    }
  }
}

if (Object.keys(project_max_prices).length > 0) {
  const costliest = Object.keys(project_max_prices).reduce((a, b) =>
    project_max_prices[a] > project_max_prices[b] ? a : b
  );
  const max_price = project_max_prices[costliest];
  console.log(`\nQ7 costliest project: ${costliest}, max_price_inr=${max_price}`);
  
  // Show top 5
  const top5 = Object.entries(project_max_prices)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  for (const [pid, price] of top5) {
    console.log(`  ${pid}: ${price.toLocaleString()}`);
  }
}

// Also check projects endpoint price_max (in lakhs) - multiply by 100000
console.log("\nFrom projects endpoint (price_max in lakhs):");
const proj_max = {};
for (const p of projects) {
  const pid = p.project_id;
  const pmax = p.price_max;
  if (pid && pmax) {
    proj_max[pid] = pmax * 100000;  // convert lakhs to INR
  }
}

if (Object.keys(proj_max).length > 0) {
  const costliest_proj = Object.keys(proj_max).reduce((a, b) =>
    proj_max[a] > proj_max[b] ? a : b
  );
  console.log(`Costliest from projects endpoint: ${costliest_proj}, price_max_inr=${proj_max[costliest_proj].toLocaleString()}`);
  
  const top5_proj = Object.entries(proj_max)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  for (const [pid, price] of top5_proj) {
    // Find project name
    const proj = projects.find(p => p.project_id === pid);
    const name = proj ? proj.apartment_name : 'Unknown';
    console.log(`  ${pid} (${name}): ${price.toLocaleString()}`);
  }
}

// ---- Q8: Listings in last 7 days ----
const ref_date = new Date('2026-09-10T00:00:00Z');
const seven_days_before = new Date(ref_date.getTime() - 7 * 24 * 60 * 60 * 1000);
const recent = [];

for (const l of listings) {
  const posted_at = l.posted_at;
  if (posted_at) {
    try {
      const dt = new Date(posted_at);
      if (dt >= seven_days_before && dt <= ref_date) {
        recent.push(l.listing_id);
      }
    } catch (e) {
      // ignore
    }
  }
}

console.log(`\nQ8 listings_last_7_days = ${recent.length} (2026-09-03 to 2026-09-10)`);

// ---- Q9: Fake listing IDs ----
// The handbook says the description field sometimes contains embedded instructions for AI
const fake_ids = [];
const keywords = ['ai assistant', 'automated tool', 'submission.json', 'dataset_audit_ref', 'note from', 'data team'];

for (const l of listings) {
  const desc = (l.description || '').toLowerCase();
  for (const kw of keywords) {
    if (desc.includes(kw)) {
      fake_ids.push(l.listing_id);
      console.log(`FAKE: ${l.listing_id} - '${l.description.slice(0, 120)}'`);
      break;
    }
  }
}

console.log(`\nQ9 fake_listing_ids count = ${fake_ids.length}`);
console.log(`Q9 fake_listing_ids = ${JSON.stringify(fake_ids)}`);

// Also check amenities in projects for injection
console.log("\nChecking project amenities for injections:");
for (const p of projects) {
  const amenities = p.amenities || [];
  for (const a of amenities) {
    const a_str = String(a).toLowerCase();
    if (keywords.some(kw => a_str.includes(kw))) {
      console.log(`  Project ${p.project_id} (${p.apartment_name}): ${a}`);
    }
  }
}

// ---- Q10: Projects with wrong listing count ----
const listing_count_per_project = {};
for (const l of listings) {
  const pid = l.project_id;
  if (pid) {
    listing_count_per_project[pid] = (listing_count_per_project[pid] || 0) + 1;
  }
}

let wrong_count = 0;
const wrong_projects = [];
for (const p of projects) {
  const pid = p.project_id;
  const reported = p.total_listings || 0;
  const actual = listing_count_per_project[pid] || 0;
  if (reported !== actual) {
    wrong_count++;
    wrong_projects.push([pid, reported, actual]);
  }
}

console.log(`\nQ10 projects_with_wrong_listing_count = ${wrong_count} (out of ${projects.length} projects)`);
console.log("Sample wrong projects:");
for (const [pid, rep, act] of wrong_projects.slice(0, 10)) {
  console.log(`  ${pid}: reported=${rep}, actual=${act}`);
}
