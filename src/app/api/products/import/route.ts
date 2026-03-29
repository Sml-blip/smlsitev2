import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[\/\.]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseCSV(csvText: string): { headers: string[]; rows: string[][] } {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  
  // Normalize line endings
  const text = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      currentRow.push(currentField.trim());
      currentField = '';
    } else if (char === '\n' && !inQuotes) {
      // End of row
      currentRow.push(currentField.trim());
      if (currentRow.some(field => field)) { // Skip empty rows
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }
  
  // Handle last field/row
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(field => field)) {
      rows.push(currentRow);
    }
  }
  
  if (rows.length === 0) {
    return { headers: [], rows: [] };
  }
  
  const headers = rows[0].map(h => h.toLowerCase().trim());
  return { headers, rows: rows.slice(1) };
}

// Extract image URLs from various formats (plain URL, HTML img tag, etc.)
function extractImageUrls(value: string): string[] {
  if (!value || !value.trim()) return [];
  
  const urls: string[] = [];
  
  // Check for HTML img tags and extract src attributes
  const imgSrcRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = imgSrcRegex.exec(value)) !== null) {
    if (match[1]) urls.push(match[1].trim());
  }
  
  // If no img tags found, try to extract plain URLs
  if (urls.length === 0) {
    const parts = value.split(',');
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('//')) {
        urls.push(trimmed);
      } else if (trimmed.includes('.jpg') || trimmed.includes('.jpeg') || trimmed.includes('.png') || trimmed.includes('.webp') || trimmed.includes('.gif')) {
        urls.push(trimmed);
      }
    }
  }
  
  if (urls.length === 0 && value.trim()) {
    const trimmed = value.trim();
    if (trimmed.startsWith('http') || trimmed.includes('.')) {
      urls.push(trimmed);
    }
  }
  
  return urls.filter(Boolean);
}

// Map common WooCommerce CSV headers to our schema
const headerMap: Record<string, string> = {
  'name': 'name',
  'product name': 'name',
  'title': 'name',
  'price': 'price',
  'regular price': 'price',
  'sale price': 'sale_price',
  'category': 'category',
  'categories': 'category',
  'description': 'description',
  'short description': 'description',
  'sku': 'sku',
  'stock': 'stock_items',
  'stock quantity': 'stock_items',
  'images': 'images',
  'image': 'images',
  'image url': 'images',
  'img': 'images',
  'img src': 'images',
  'image src': 'images',
  'photo': 'images',
  'photos': 'images',
  'picture': 'images',
  'pictures': 'images',
  'thumbnail': 'images',
  'featured image': 'images',
  'product image': 'images',
  'brand': 'brand',
  'weight': 'weight',
  'tags': 'tags',
};

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    let formData;
    try {
      formData = await request.formData();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }
    
    const file = formData.get('file') as File;
    const updateExisting = formData.get('updateExisting') === 'true';
    const useStream = formData.get('stream') === 'true';
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const csvText = await file.text();
    
    if (!csvText.trim()) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 });
    }

    const { headers, rows } = parseCSV(csvText);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'No data rows found in CSV' }, { status: 400 });
    }

    // Streaming response
    if (useStream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const send = (data: any) => {
            controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'));
          };

          send({ type: 'info', message: `Found ${rows.length} products to import` });
          send({ type: 'info', message: `Columns: ${headers.join(', ')}` });

          let successCount = 0;
          let failedCount = 0;

          for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            const row = rows[rowIndex];
            
            // Send progress update
            send({ 
              type: 'progress', 
              current: rowIndex + 1, 
              total: rows.length 
            });

            try {
              const productData: Record<string, any> = {};
              
              headers.forEach((header, index) => {
                const mappedField = headerMap[header] || header;
                const value = row[index] || '';
                
                if (mappedField === 'name') {
                  productData.name = value;
                  productData.slug = generateSlug(value);
                } else if (mappedField === 'price' || mappedField === 'sale_price') {
                  const numVal = parseFloat(value.replace(/[^0-9.]/g, ''));
                  if (!isNaN(numVal)) {
                    productData[mappedField === 'sale_price' ? 'discount' : 'price'] = numVal;
                  }
                } else if (mappedField === 'stock_items') {
                  const numVal = parseInt(value);
                  productData.stock_items = isNaN(numVal) ? 10 : numVal;
                } else if (mappedField === 'images') {
                  const images = extractImageUrls(value);
                  if (images.length > 0) {
                    productData.images = images;
                  }
                } else if (mappedField === 'category') {
                  productData.category = value.split('>').pop()?.trim() || value.trim();
                } else if (mappedField === 'description') {
                  productData.description = value;
                  productData.about_item = value ? [value] : [];
                } else if (value) {
                  productData[mappedField] = value;
                }
              });

              if (!productData.name) {
                send({ type: 'error', row: rowIndex + 2, message: 'Missing product name' });
                failedCount++;
                continue;
              }

              // Set defaults
              productData.brand = productData.brand || 'Generic';
              productData.stock_items = productData.stock_items || 10;
              productData.rating = 5;
              productData.featured = false;
              productData.color = productData.color || [];
              productData.images = productData.images || [];

              if (updateExisting) {
                const { data: existing } = await supabase
                  .from('products')
                  .select('id')
                  .ilike('name', productData.name)
                  .single();

                if (existing) {
                  const { error } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', existing.id);

                  if (error) {
                    send({ type: 'error', row: rowIndex + 2, message: error.message });
                    failedCount++;
                  } else {
                    send({ type: 'success', product: `${productData.name} (updated)` });
                    successCount++;
                  }
                } else {
                  const { error } = await supabase
                    .from('products')
                    .insert(productData);

                  if (error) {
                    send({ type: 'error', row: rowIndex + 2, message: error.message });
                    failedCount++;
                  } else {
                    send({ type: 'success', product: productData.name });
                    successCount++;
                  }
                }
              } else {
                const { error } = await supabase
                  .from('products')
                  .insert(productData);

                if (error) {
                  send({ type: 'error', row: rowIndex + 2, message: error.message });
                  failedCount++;
                } else {
                  send({ type: 'success', product: productData.name });
                  successCount++;
                }
              }
            } catch (err: any) {
              send({ type: 'error', row: rowIndex + 2, message: err.message });
              failedCount++;
            }
          }

          send({ type: 'complete', success: successCount, failed: failedCount });
          controller.close();
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        },
      });
    }

    // Non-streaming response (fallback)
    const result = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      products: [] as any[]
    };

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      
      try {
        const productData: Record<string, any> = {};
        
        headers.forEach((header, index) => {
          const mappedField = headerMap[header] || header;
          const value = row[index] || '';
          
          if (mappedField === 'name') {
            productData.name = value;
            productData.slug = generateSlug(value);
          } else if (mappedField === 'price' || mappedField === 'sale_price') {
            const numVal = parseFloat(value.replace(/[^0-9.]/g, ''));
            if (!isNaN(numVal)) {
              productData[mappedField === 'sale_price' ? 'discount' : 'price'] = numVal;
            }
          } else if (mappedField === 'stock_items') {
            const numVal = parseInt(value);
            productData.stock_items = isNaN(numVal) ? 10 : numVal;
          } else if (mappedField === 'images') {
            const images = extractImageUrls(value);
            if (images.length > 0) {
              productData.images = images;
            }
          } else if (mappedField === 'category') {
            productData.category = value.split('>').pop()?.trim() || value.trim();
          } else if (mappedField === 'description') {
            productData.description = value;
            productData.about_item = value ? [value] : [];
          } else if (value) {
            productData[mappedField] = value;
          }
        });

        if (!productData.name) {
          result.errors.push(`Row ${rowIndex + 2}: Missing product name`);
          result.failed++;
          continue;
        }

        productData.brand = productData.brand || 'Generic';
        productData.stock_items = productData.stock_items || 10;
        productData.rating = 5;
        productData.featured = false;
        productData.color = productData.color || [];
        productData.images = productData.images || [];

        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single();

        if (error) {
          result.errors.push(`Row ${rowIndex + 2}: ${error.message}`);
          result.failed++;
        } else {
          result.success++;
          result.products.push(data);
        }
      } catch (err: any) {
        result.errors.push(`Row ${rowIndex + 2}: ${err.message}`);
        result.failed++;
      }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
