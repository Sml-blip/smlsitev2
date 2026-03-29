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
  const imageUrl = product['Images'];
  
  if (name && imageUrl && imageUrl.includes('sml.boutique')) {
    const filename = imageUrl.split('/').pop();
    const newUrl = `https://files.manuscdn.com/user_upload_by_module/session_file/310419663031366693/${filename}`;
    imageMapping[name] = newUrl;
  }
});

const sqlStatements = [];

Object.entries(imageMapping).forEach(([name, url]) => {
  const escapedName = name.replace(/'/g, "''");
  const escapedUrl = url.replace(/'/g, "''");
  sqlStatements.push(`UPDATE products SET images = '["${escapedUrl}"]'::jsonb WHERE name = '${escapedName}';`);
});

console.log('Total products found:', products.length);
console.log('Products with image mappings:', Object.keys(imageMapping).length);
console.log('\n--- SQL Statements ---\n');
console.log(sqlStatements.slice(0, 20).join('\n'));
console.log('\n... and', sqlStatements.length - 20, 'more');

fs.writeFileSync(path.join(__dirname, 'update-images.sql'), sqlStatements.join('\n'));
console.log('\nSQL file saved to scripts/update-images.sql');
