import axios from 'axios';
import type { Product, ProductStats, BrandIndustryCounts, ProductFormData } from '@/types/product';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    throw error;
  }
);

export const productApi = {
  // Get all products
  async getProducts(): Promise<Product[]> {
    const response = await api.get<Product[]>('/products');
    return response.data;
  },

  // Get product by ID
  async getProduct(id: string): Promise<Product> {
    const response = await api.get<Product>(`/product/${id}`);
    return response.data;
  },

  // Create new product
  async createProduct(productData: ProductFormData): Promise<{ success: boolean; message: string; product_id?: string }> {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Update product
  async updateProduct(id: string, productData: Partial<ProductFormData>): Promise<{ success: boolean; message: string }> {
    const response = await api.put(`/product/${id}`, productData);
    return response.data;
  },

  // Delete product
  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/product/${id}`);
    return response.data;
  },

  // Get statistics
  async getStatistics(): Promise<{
    metadata: ProductStats;
    brand_industry_counts: BrandIndustryCounts;
  }> {
    const response = await api.get('/statistics');
    return response.data;
  },

  // Get available images
  async getImages(): Promise<Array<{
    filename: string;
    path: string;
    size: number;
  }>> {
    const response = await api.get('/images');
    return response.data;
  },

  // Upload image
  async uploadImage(file: File): Promise<{
    success: boolean;
    message: string;
    filename?: string;
    filepath?: string;
  }> {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await api.post('/upload_image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
};

export default api;
