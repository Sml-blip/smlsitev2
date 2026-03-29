const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../src/data/products.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');

function parseCSV(content) {
  const lines = content.split('\n');
  const headers = parseCSVLine(lines[0]);
  const products = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseCSVLine(line);
    const product = {};
    headers.forEach((header, index) => {
      product[header] = values[index] || '';
    });
    products.push(product);
  }
  
  return products;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  
  return result;
}

const products = parseCSV(csvContent);

const imageMapping = {};

products.forEach(product => {
  const name = product['Name'];
  let imageUrl = product['Images'];
  
  if (name && imageUrl) {
    // Extract filename from sml.boutique URL
    if (imageUrl.includes('sml.boutique')) {
      const filename = imageUrl.split('/').pop();
      imageUrl = `https://files.manuscdn.com/user_upload_by_module/session_file/310419663031366693/${filename}`;
    }
    
    // Only add if we have a valid manuscdn URL or keep original if it's already manuscdn
    if (imageUrl.includes('manuscdn.com') || imageUrl.startsWith('https://')) {
      imageMapping[name] = imageUrl;
    }
  }
});

const sqlStatements = [];

Object.entries(imageMapping).forEach(([name, url]) => {
  const escapedName = name.replace(/'/g, "''");
  const escapedUrl = url.replace(/'/g, "''");
  sqlStatements.push(`UPDATE products SET images = '["${escapedUrl}"]' WHERE name = '${escapedName}';`);
});

console.log('Total products found:', products.length);
console.log('Products with image mappings:', Object.keys(imageMapping).length);

// Write SQL to file
fs.writeFileSync(path.join(__dirname, 'update-all-images.sql'), sqlStatements.join('\n'));
console.log('\nSQL file saved to scripts/update-all-images.sql');
console.log('\nFirst 10 statements:');
sqlStatements.slice(0, 10).forEach(s => console.log(s));
