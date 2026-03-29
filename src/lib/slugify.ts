const ACCENT_MAP: Record<string, string> = {
  'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
  'à': 'a', 'â': 'a', 'ä': 'a', 'á': 'a',
  'î': 'i', 'ï': 'i', 'í': 'i', 'ì': 'i',
  'ô': 'o', 'ö': 'o', 'ó': 'o', 'ò': 'o',
  'ù': 'u', 'û': 'u', 'ü': 'u', 'ú': 'u',
  'ç': 'c', 'ñ': 'n',
  'É': 'e', 'È': 'e', 'Ê': 'e', 'Ë': 'e',
  'À': 'a', 'Â': 'a', 'Á': 'a',
  'Î': 'i', 'Ï': 'i',
  'Ô': 'o', 'Ö': 'o',
  'Ù': 'u', 'Û': 'u', 'Ü': 'u',
  'Ç': 'c',
};

function removeAccents(str: string): string {
  return str.split('').map(c => ACCENT_MAP[c] ?? c).join('');
}

export function generateSlug(name: string): string {
  return removeAccents(name)
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[\/\.\+°,]/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getProductUrl(product: { slug?: string; name: string }): string {
  return `/shop/${product.slug || generateSlug(product.name)}`;
}
