// change or modify the types as your requirement

export type ParentCategory = 'Informatique' | 'Électroménager';

export const PARENT_CATEGORIES: { id: ParentCategory; label: string; emoji: string }[] = [
  { id: 'Informatique',    label: 'Informatique',    emoji: '💻' },
  { id: 'Électroménager', label: 'Électroménager',  emoji: '🏠' },
];

// Sub-categories per parent
export const SUBCATEGORIES: Record<ParentCategory, string[]> = {
  Informatique: [
    'PC PORTABLE', 'COMPOSANTS', 'ECRANS', 'ACCESSOIRES',
    'SMARTPHONE ACCESSOIRES', 'IMAGE & SON', 'CONSOLES',
    'SÉCURITÉ & PROTECTION', 'CABLES', 'SOURIS', 'STOCKAGE', 'AUDIO',
  ],
  Électroménager: [
    'RÉFRIGÉRATEURS', 'LAVE-LINGE', 'CLIMATISEURS', 'FOURS & MICRO-ONDES',
    'ASPIRATEURS', 'TÉLÉVISEURS', 'PETIT ÉLECTROMÉNAGER', 'CUISINE',
  ],
};

export type Product = {
  id: string | number;
  name: string;
  slug?: string;
  category: string;
  parent_category?: ParentCategory;
  description: string;
  about_item?: string[];
  aboutItem?: string[];
  price: number | string;
  discount: number;
  rating: number;
  reviews?: Review[];
  brand?: string;
  color?: string[];
  colors?: string[];
  stock?: number;
  stock_items?: number;
  stockItems?: number;
  images: string[];
  featured?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Review = {
  author: string;
  image: string;
  content: string;
  rating:number
  date: Date;
};

export type SearchParams = {
  page?: string;
  category?: string;
  brand?: string;
  search?: string;
  min?: string;
  max?: string;
  color?: string;
};

export type CartItem = Product & {
  selectedColor: string;
  quantity: number;
};
