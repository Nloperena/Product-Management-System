import axios from 'axios';
import type { Product, ProductStats, BrandIndustryCounts, ApiResponse, ProductFilters, ProductFormData } from '../types/product';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const productApi = {
  // Get all products with optional filters
  getProducts: async (filters?: ProductFilters): Promise<Product[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.brand) params.append('brand', filters.brand);
      if (filters?.industry) params.append('industry', filters.industry);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.published !== undefined) params.append('published', filters.published.toString());

      const response = await api.get<ApiResponse<Product[]>>(`/api/products?${params}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get product by ID
  getProduct: async (id: string): Promise<Product | null> => {
    try {
      const response = await api.get<ApiResponse<Product>>(`/api/products/${id}`);
      return response.data.data || null;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Create new product
  createProduct: async (productData: ProductFormData): Promise<Product> => {
    try {
      const response = await api.post<ApiResponse<Product>>('/api/products', productData);
      if (!response.data.data) {
        throw new Error('No data returned from server');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update existing product
  updateProduct: async (id: string, productData: ProductFormData): Promise<Product> => {
    try {
      const response = await api.put<ApiResponse<Product>>(`/api/products/${id}`, productData);
      if (!response.data.data) {
        throw new Error('No data returned from server');
      }
      return response.data.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete product
  deleteProduct: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/products/${id}`);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Get product statistics
  getStats: async (): Promise<ProductStats | null> => {
    try {
      const response = await api.get<ApiResponse<ProductStats>>('/api/stats');
      return response.data.data || null;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  // Get brand and industry counts
  getBrandIndustryCounts: async (): Promise<BrandIndustryCounts> => {
    try {
      const response = await api.get<ApiResponse<BrandIndustryCounts>>('/api/brand-industry-counts');
      return response.data.data || {};
    } catch (error) {
      console.error('Error fetching brand industry counts:', error);
      throw error;
    }
  },
};

export default api;
