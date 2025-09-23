import type { Product, ProductStats } from '../types/product.ts';

const API_BASE_URL = '';

export class ApiService {
  private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('🌐 API Request:', url);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      console.log('📡 API Response:', {
        url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 API Data:', {
        url,
        dataType: Array.isArray(data) ? 'array' : typeof data,
        length: Array.isArray(data) ? data.length : 'N/A'
      });

      return data;
    } catch (error) {
      console.error('❌ API Request failed:', {
        url,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  static async getProducts(): Promise<Product[]> {
    try {
      console.log('🔍 getProducts: Starting request');
      const data = await this.request<Product[]>('/api/products');
      console.log('✅ getProducts: Success, got', Array.isArray(data) ? data.length : 'non-array', 'items');
      
      // Ensure we return an array
      if (!Array.isArray(data)) {
        console.warn('⚠️ getProducts: API returned non-array data, converting to empty array');
        return [];
      }
      
      return data;
    } catch (error) {
      console.error('❌ getProducts: Failed with error', error);
      throw error;
    }
  }

  static async getProduct(id: string): Promise<Product> {
    return this.request<Product>(`/api/products/${id}`);
  }

  static async searchProducts(query: string): Promise<Product[]> {
    return this.request<Product[]>(`/api/products/search?q=${encodeURIComponent(query)}`);
  }

  static async getProductStats(): Promise<ProductStats> {
    return this.request<ProductStats>('/api/stats');
  }

  static async getImages(): Promise<string[]> {
    return this.request<string[]>('/api/images');
  }

  static getProductImageUrl(imagePath: string): string {
    if (!imagePath) {
      console.log('🖼️ getProductImageUrl: No image path provided, using placeholder');
      return '/placeholder-product.svg';
    }
    
    let finalUrl = '';
    
    // If the path already starts with /product-images/, return as is
    if (imagePath.startsWith('/product-images/')) {
      finalUrl = imagePath;
    }
    // If it starts with product-images/ (without leading slash), add the slash
    else if (imagePath.startsWith('product-images/')) {
      finalUrl = `/${imagePath}`;
    }
    // Otherwise, assume it's just a filename and add the full path
    else {
      finalUrl = `/product-images/${imagePath}`;
    }
    
    console.log('🖼️ getProductImageUrl:', { input: imagePath, output: finalUrl });
    return finalUrl;
  }
}
