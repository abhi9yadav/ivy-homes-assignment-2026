import fs from 'fs';

// Load data
const listings = JSON.parse(fs.readFileSync('./all_listings.json', 'utf8'));

console.log(`Total listings: ${listings.length}`);

// Q1: Total listing records
const total_listing_records = listings.length;
console.log(`Q1 total_listing_records = ${total_listing_records}`);

// Q2: Unique properties (de-duplicated)
// Same property listed on multiple portals = same project_id + bedroom + floor + carpet_area
const uniqueByPropKey = {};
for (const l of listings) {
  const key = `${l.project_id || ''}_${l.bedroom}_${l.floor}_${l.carpet_area}`;
  if (!uniqueByPropKey[key]) {
    uniqueByPropKey[key] = l;
  }
}
console.log(`Q2 unique_properties (project+bed+floor+carpet) = ${Object.keys(uniqueByPropKey).length}`);

// Also try without project (same apt_name+locality+bed+floor+carpet)
const uniqueByPropKey2 = {};
for (const l of listings) {
  const key = `${(l.apartment_name || '').toLowerCase()}_${(l.locality || '').toLowerCase()}_${l.bedroom}_${l.floor}_${l.carpet_area}`;
  if (!uniqueByPropKey2[key]) {
    uniqueByPropKey2[key] = l;
  }
}
console.log(`Q2 unique_properties (apt+loc+bed+floor+carpet) = ${Object.keys(uniqueByPropKey2).length}`);

// Q3: Active listings (is_live=true)
const active_listings = listings.filter(l => l.is_live === true).length;
console.log(`Q3 active_listings = ${active_listings}`);

// Q4: Corrupt listing IDs
// Corrupt = price <= 0 OR carpet_area <= 0 OR price_per_sqft is absurdly low
const corrupt_ids = [];
for (const l of listings) {
  const issues = [];
  const price = l.price || 0;
  const carpet = l.carpet_area || 0;
  
  if (price == null || price <= 0) {
    issues.push('price_zero_or_negative');
  } else if (carpet != null && carpet > 0) {
    const ppsf = price / carpet;
    if (ppsf < 1000) {  // less than Rs 1000/sqft for Chennai is impossible
      issues.push(`price_per_sqft_too_low=${ppsf.toFixed(1)}`);
    }
  }
  
  if (carpet == null || carpet <= 0) {
    issues.push('carpet_area_zero_or_missing');
  }
  
  if (issues.length > 0) {
    corrupt_ids.push(l.listing_id);
    console.log(`  Corrupt: ${l.listing_id}, price=${price}, carpet=${carpet}, issues=${JSON.stringify(issues)}`);
  }
}

console.log(`Q4 corrupt_listing_ids count = ${corrupt_ids.length}`);
console.log(`Q4 corrupt_listing_ids = ${JSON.stringify(corrupt_ids)}`);

// Q5: Total monthly rent
// Look for listings that might be rentals
const rent_listings = listings.filter(l => 
  l.listing_type === 'rent' || (l.price && l.price < 100000)
);
console.log(`Listings with price < 100000 (potential rent): ${rent_listings.length}`);
for (const l of rent_listings.slice(0, 5)) {
  console.log(`  ${l.listing_id}: price=${l.price}, listing_type=${l.listing_type}`);
}

// Check if there's a rent field
const sample = listings[0];
console.log(`Sample listing keys: ${Object.keys(sample).join(', ')}`);

// Q6: Average price per sqft for 2BHK listings
const bhk2 = listings.filter(l => 
  l.bedroom === 2 && 
  l.carpet_area && l.carpet_area > 0 && 
  l.price && l.price > 0
);

if (bhk2.length > 0) {
  const ppsfts = bhk2.map(l => l.price / l.carpet_area);
  const avg_ppsf_2bhk = ppsfts.reduce((a, b) => a + b, 0) / ppsfts.length;
  console.log(`Q6 avg_price_per_sqft_2bhk (price/carpet_area) = ${avg_ppsf_2bhk.toFixed(2)} for ${bhk2.length} listings`);
}

// Q7: Costliest project
const project_max_prices = {};
for (const l of listings) {
  const pid = l.project_id;
  const price = l.price || 0;
  if (pid && price) {
    if (!project_max_prices[pid] || price > project_max_prices[pid]) {
      project_max_prices[pid] = price;
    }
  }
}

if (Object.keys(project_max_prices).length > 0) {
  const costliest = Object.keys(project_max_prices).reduce((a, b) => 
    project_max_prices[a] > project_max_prices[b] ? a : b
  );
  console.log(`Q7 costliest_project: project_id=${costliest}, max_price=${project_max_prices[costliest]}`);
}

// Q8: Listings in last 7 days (relative to reference date 2026-09-10)
const ref_date = new Date('2026-09-10T00:00:00Z');
const seven_days_before = new Date(ref_date.getTime() - 7 * 24 * 60 * 60 * 1000);
let recent = 0;

for (const l of listings) {
  const posted_at = l.posted_at;
  if (posted_at) {
    try {
      const dt = new Date(posted_at);
      if (dt >= seven_days_before && dt <= ref_date) {
        recent++;
      }
    } catch (e) {
      // ignore parse errors
    }
  }
}

console.log(`Q8 listings_last_7_days (relative to 2026-09-10) = ${recent}`);
