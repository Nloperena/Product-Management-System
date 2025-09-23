import React, { useState, useEffect } from 'react';
import { useProductStore } from '../../store/productStore';
import { ApiService } from '../../services/api';

export const DebugPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [apiError, setApiError] = useState<string>('');
  
  const { products, filteredProducts, searchQuery, filters } = useProductStore();

  useEffect(() => {
    // Test API connection on mount
    const testApi = async () => {
      try {
        console.log('🔍 Debug: Testing API connection...');
        await ApiService.getProducts();
        setApiStatus('connected');
        console.log('✅ Debug: API connection successful');
      } catch (error) {
        setApiStatus('error');
        setApiError(error instanceof Error ? error.message : 'Unknown error');
        console.error('❌ Debug: API connection failed', error);
      }
    };

    testApi();
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-1 rounded text-sm z-50"
        style={{ fontSize: '12px' }}
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm text-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Debug Panel</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <strong>API Status:</strong>{' '}
          <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
            apiStatus === 'connected' ? 'bg-green-500' : 
            apiStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
          }`}></span>
          {apiStatus}
          {apiError && <div className="text-red-300 text-xs mt-1">{apiError}</div>}
        </div>
        
        <div>
          <strong>Products:</strong> {products.length} total, {filteredProducts.length} filtered
        </div>
        
        <div>
          <strong>Search:</strong> "{searchQuery}"
        </div>
        
        <div>
          <strong>Filters:</strong>
          <div className="text-xs mt-1">
            Brand: {filters.brand || 'none'}<br/>
            Industry: {filters.industry || 'none'}<br/>
            Chemistry: {filters.chemistry || 'none'}
          </div>
        </div>
        
        <div>
          <strong>Current URL:</strong> {window.location.href}
        </div>
        
        <button
          onClick={() => {
            console.log('🔍 Debug: Current store state', {
              products: products.length,
              filteredProducts: filteredProducts.length,
              searchQuery,
              filters
            });
          }}
          className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
        >
          Log State
        </button>
      </div>
    </div>
  );
};

