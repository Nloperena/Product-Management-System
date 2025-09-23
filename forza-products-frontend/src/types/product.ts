export interface Product {
  product_id: string;
  id?: string; // Keep for backward compatibility
  name: string;
  full_name: string;
  description?: string;
  brand: 'forza_bond' | 'forza_seal' | 'forza_tape';
  industry: string;
  chemistry?: string;
  url?: string;
  image?: string;
  benefits?: string | string[];
  applications?: string | string[];
  technical?: string | {
    [key: string]: string | number;
  };
  sizing?: string | {
    [key: string]: string;
  };
  packaging?: string[];
  published?: boolean;
  benefits_count?: number;
}

export interface ProductFilters {
  search: string;
  brand: string;
  industry: string;
  chemistry: string;
  applications: string[];
  published: 'all' | 'published' | 'unpublished';
}

export interface ProductStats {
  totalProducts: number;
  totalBrands: number;
  totalIndustries: number;
  recentProducts: Product[];
}

export interface Brand {
  id: string;
  name: string;
  displayName: string;
  productCount: number;
  color: string;
}

export interface Industry {
  id: string;
  name: string;
  displayName: string;
  productCount: number;
  description: string;
}
