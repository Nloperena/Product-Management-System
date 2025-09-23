import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import type { Product } from '../types/product';
import { SimpleProductExplorer } from '../components/enhanced/SimpleProductExplorer';
import { ProductDetailModal } from '../components/enhanced/ProductDetailModal';
import { ProductComparison } from '../components/enhanced/ProductComparison';
import { DebugPanel } from '../components/debug/DebugPanel';
import { useProductStore } from '../store/productStore';
import { TrendingUp, Users, Package, Building, Zap, Target } from 'lucide-react';

export const EnhancedDashboard: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [comparisonProducts, setComparisonProducts] = useState<Product[]>([]);

  const { 
    products, 
    setProducts, 
    isLoading,
    filteredProducts
  } = useProductStore();

  // Fetch products
  const { data: productsData, error, isLoading: isQueryLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      console.log('🔄 Enhanced Dashboard: Starting API call');
      try {
        const result = await ApiService.getProducts();
        console.log('✅ Enhanced Dashboard: API call successful', result?.length, 'products');
        return result;
      } catch (err) {
        console.error('❌ Enhanced Dashboard: API call failed', err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      console.log('🔄 Enhanced Dashboard: Retry attempt', failureCount, error);
      return failureCount < 2;
    },
  });

  useEffect(() => {
    console.log('🔄 Enhanced Dashboard: Query state changed', {
      isQueryLoading,
      hasData: !!productsData,
      dataLength: productsData?.length,
      error: error?.message
    });
    
    if (productsData) {
      console.log('✅ Enhanced Dashboard: Setting products', productsData.length, 'products');
      setProducts(productsData);
    }
    
    if (error) {
      console.error('❌ Enhanced Dashboard: API Error', error);
    }
  }, [productsData, setProducts, isQueryLoading, error]);

  // Calculate enhanced stats
  const stats = {
    totalProducts: products.length,
    activeProducts: products.filter(p => p.published).length,
    totalBrands: new Set(products.map(p => p.brand)).size,
    totalIndustries: new Set(products.map(p => p.industry)).size,
    totalChemistries: new Set(products.map(p => p.chemistry).filter(Boolean)).size,
    recentlyViewed: 0, // This would come from user activity
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  const handleCompareProducts = (productIds: string[]) => {
    const productsToCompare = products.filter(p => productIds.includes(p.product_id));
    setComparisonProducts(productsToCompare);
    setIsComparisonOpen(true);
  };

  const handleRemoveFromComparison = (productId: string) => {
    setComparisonProducts(prev => prev.filter(p => p.product_id !== productId));
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-100 rounded-full p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Products</h2>
          <p className="text-gray-600 mb-4">
            There was an error connecting to the product database. Please check your connection and try again.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-forza-blue text-white px-6 py-2 rounded-lg hover:bg-forza-blue-dark transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Enhanced Header */}
      <div style={{ background: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ backgroundColor: '#1e40af', padding: '0.5rem', borderRadius: '0.5rem' }}>
                <Package style={{ width: '1.5rem', height: '1.5rem', color: 'white' }} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#111827', margin: 0 }}>
                  Forza Products
                </h1>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                  Technical Product Database
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.875rem', color: '#4b5563' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <TrendingUp style={{ width: '1rem', height: '1rem' }} />
                  <span>{stats.activeProducts} Active</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Building style={{ width: '1rem', height: '1rem' }} />
                  <span>{stats.totalIndustries} Industries</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Zap style={{ width: '1rem', height: '1rem' }} />
                  <span>{stats.totalChemistries} Chemistries</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Stats Overview */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem', 
          marginBottom: '2rem' 
        }}>
          <div style={{ 
            background: 'white', 
            borderRadius: '0.75rem', 
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
            border: '1px solid #e5e7eb', 
            padding: '1.5rem' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ padding: '0.5rem', backgroundColor: '#dbeafe', borderRadius: '0.5rem' }}>
                <Package style={{ width: '1.5rem', height: '1.5rem', color: '#2563eb' }} />
              </div>
              <div style={{ marginLeft: '1rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', margin: 0 }}>Total Products</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: '0.25rem 0' }}>{stats.totalProducts}</p>
                <p style={{ fontSize: '0.75rem', color: '#16a34a', margin: 0 }}>
                  {stats.activeProducts} published
                </p>
              </div>
            </div>
          </div>

          <div style={{ 
            background: 'white', 
            borderRadius: '0.75rem', 
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
            border: '1px solid #e5e7eb', 
            padding: '1.5rem' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ padding: '0.5rem', backgroundColor: '#dcfce7', borderRadius: '0.5rem' }}>
                <Building style={{ width: '1.5rem', height: '1.5rem', color: '#16a34a' }} />
              </div>
              <div style={{ marginLeft: '1rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', margin: 0 }}>Industries Served</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: '0.25rem 0' }}>{stats.totalIndustries}</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                  Specialized solutions
                </p>
              </div>
            </div>
          </div>

          <div style={{ 
            background: 'white', 
            borderRadius: '0.75rem', 
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
            border: '1px solid #e5e7eb', 
            padding: '1.5rem' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ padding: '0.5rem', backgroundColor: '#f3e8ff', borderRadius: '0.5rem' }}>
                <Zap style={{ width: '1.5rem', height: '1.5rem', color: '#9333ea' }} />
              </div>
              <div style={{ marginLeft: '1rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', margin: 0 }}>Chemistry Types</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: '0.25rem 0' }}>{stats.totalChemistries}</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                  Advanced formulations
                </p>
              </div>
            </div>
          </div>

          <div style={{ 
            background: 'white', 
            borderRadius: '0.75rem', 
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
            border: '1px solid #e5e7eb', 
            padding: '1.5rem' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ padding: '0.5rem', backgroundColor: '#fed7aa', borderRadius: '0.5rem' }}>
                <Target style={{ width: '1.5rem', height: '1.5rem', color: '#ea580c' }} />
              </div>
              <div style={{ marginLeft: '1rem' }}>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', margin: 0 }}>Brand Portfolio</p>
                <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: '0.25rem 0' }}>{stats.totalBrands}</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0 }}>
                  BOND • SEAL • TAPE
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Explorer */}
        {isLoading || isQueryLoading ? (
          <div style={{ 
            background: 'white', 
            borderRadius: '0.75rem', 
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
            border: '1px solid #e5e7eb', 
            padding: '3rem',
            textAlign: 'center'
          }}>
            <div style={{ 
              width: '3rem', 
              height: '3rem', 
              border: '2px solid #e5e7eb',
              borderTopColor: '#1e40af',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem auto'
            }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827', marginBottom: '0.5rem' }}>
              Loading Products
            </h3>
            <p style={{ color: '#6b7280', margin: 0 }}>
              Fetching the latest product information...
            </p>
          </div>
        ) : (
          <SimpleProductExplorer onProductSelect={handleProductSelect} />
        )}

        {/* Quick Actions */}
        <div style={{ 
          marginTop: '2rem', 
          background: 'white', 
          borderRadius: '0.75rem', 
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
          border: '1px solid #e5e7eb', 
          padding: '1.5rem' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', margin: 0 }}>Quick Actions</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                Showing {filteredProducts.length} of {stats.totalProducts} products
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <button style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#2563eb',
                color: 'white',
                borderRadius: '0.5rem',
                border: 'none',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}>
                Export Product List
              </button>
              <button style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'white',
                color: '#374151',
                borderRadius: '0.5rem',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}>
                Request Samples
              </button>
              <button style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'white',
                color: '#374151',
                borderRadius: '0.5rem',
                border: '1px solid #d1d5db',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}>
                Technical Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedProduct(null);
        }}
      />

      <ProductComparison
        products={comparisonProducts}
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        onRemoveProduct={handleRemoveFromComparison}
      />

      {/* Debug Panel */}
      <DebugPanel />
    </div>
  );
};
