import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, ProductFilters } from '../types/product.ts';

interface ProductStore {
  products: Product[];
  filteredProducts: Product[];
  filters: ProductFilters;
  searchQuery: string;
  selectedProducts: string[];
  isLoading: boolean;
  error: string | null;
  scrollPosition: number;
  viewMode: 'grid' | 'list';

  // Actions
  setProducts: (products: Product[]) => void;
  setFilters: (filters: Partial<ProductFilters>) => void;
  setSearchQuery: (query: string) => void;
  toggleProductSelection: (productId: string) => void;
  clearSelection: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  applyFilters: () => void;
  setScrollPosition: (position: number) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: [],
      filteredProducts: [],
      filters: {
        search: '',
        brand: '',
        industry: '',
        chemistry: '',
        applications: [],
        published: 'all',
      },
      searchQuery: '',
      selectedProducts: [],
      isLoading: false,
      error: null,
      scrollPosition: 0,
      viewMode: 'grid' as const,

  setProducts: (products) => {
    console.log('🏪 Store: Setting products', products.length);
    set({ products, filteredProducts: products });
  },
  
  setFilters: (newFilters) => {
    const currentFilters = get().filters;
    const updatedFilters = { ...currentFilters, ...newFilters };
    set({ filters: updatedFilters });
    get().applyFilters();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().applyFilters();
  },

  toggleProductSelection: (productId) => {
    const { selectedProducts } = get();
    const isSelected = selectedProducts.includes(productId);
    const newSelection = isSelected
      ? selectedProducts.filter(id => id !== productId)
      : [...selectedProducts, productId];
    set({ selectedProducts: newSelection });
  },

  clearSelection: () => set({ selectedProducts: [] }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  applyFilters: () => {
    const { products, filters, searchQuery } = get();
    
    console.log('🔍 Store: Applying filters', {
      totalProducts: products.length,
      searchQuery,
      filters
    });
    
    let filtered = products;

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.full_name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.industry.toLowerCase().includes(query) ||
        product.chemistry?.toLowerCase().includes(query)
      );
      console.log('🔍 Store: After search filter', filtered.length, 'products');
    }

    // Apply brand filter
    if (filters.brand) {
      filtered = filtered.filter(product => product.brand === filters.brand);
    }

    // Apply industry filter
    if (filters.industry) {
      filtered = filtered.filter(product => product.industry === filters.industry);
    }

    // Apply chemistry filter
    if (filters.chemistry) {
      filtered = filtered.filter(product => product.chemistry === filters.chemistry);
    }

    // Apply applications filter
    if (filters.applications.length > 0) {
      filtered = filtered.filter(product =>
        Array.isArray(product.applications) && product.applications.some((app: string) =>
          filters.applications.some(filterApp =>
            app.toLowerCase().includes(filterApp.toLowerCase())
          )
        )
      );
    }

    // Apply published filter
    if (filters.published !== 'all') {
      const shouldBePublished = filters.published === 'published';
      filtered = filtered.filter(product => {
        // If published field exists, use it; otherwise assume published if no field
        const isPublished = product.published !== undefined ? product.published : true;
        return isPublished === shouldBePublished;
      });
      console.log('🔍 Store: After published filter', filtered.length, 'products');
    }

    console.log('✅ Store: Final filtered products', filtered.length);
    set({ filteredProducts: filtered });
  },

  setScrollPosition: (position) => {
    set({ scrollPosition: position });
  },

  setViewMode: (mode) => {
    set({ viewMode: mode });
  },
}),
{
  name: 'product-store',
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({
    filters: state.filters,
    searchQuery: state.searchQuery,
    scrollPosition: state.scrollPosition,
    viewMode: state.viewMode,
  }),
}
));
