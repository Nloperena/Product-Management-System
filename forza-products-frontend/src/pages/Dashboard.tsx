import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ApiService } from '../services/api';
import type { Product } from '../types/product.ts';
import { ProductCard } from '../components/product/ProductCard';
import { FilterSidebar } from '../components/filters/FilterSidebar';
import { DebugPanel } from '../components/debug/DebugPanel';
import { useProductStore } from '../store/productStore';
import { Filter, Grid, List, Package, Building, Wrench, Plus } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const navigate = useNavigate();

  const { 
    products, 
    filteredProducts, 
    searchQuery, 
    viewMode,
    scrollPosition,
    setProducts, 
    setSearchQuery,
    setViewMode,
    setScrollPosition,
    isLoading 
  } = useProductStore();

  // Fetch products
  const { data: productsData, error, isLoading: isQueryLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      console.log('🔄 React Query: Starting API call');
      try {
        const result = await ApiService.getProducts();
        console.log('✅ React Query: API call successful', result?.length, 'products');
        return result;
      } catch (err) {
        console.error('❌ React Query: API call failed', err);
        throw err;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      console.log('🔄 React Query: Retry attempt', failureCount, error);
      return failureCount < 2; // Only retry once
    },
  });


  useEffect(() => {
    console.log('🔄 Dashboard: Query state changed', {
      isQueryLoading,
      hasData: !!productsData,
      dataLength: productsData?.length,
      error: error?.message
    });
    
    if (productsData) {
      console.log('✅ Dashboard: Setting products', productsData.length, 'products');
      setProducts(productsData);
    }
    
    if (error) {
      console.error('❌ Dashboard: API Error', error);
    }
  }, [productsData, setProducts, isQueryLoading, error]);

  // Restore scroll position on mount
  useEffect(() => {
    if (scrollPosition > 0) {
      const timer = setTimeout(() => {
        window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [scrollPosition]);

  // Save scroll position on scroll
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);
    };

    const debouncedHandleScroll = (func: () => void, delay: number) => {
      let timeoutId: NodeJS.Timeout;
      return () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(func, delay);
      };
    };

    const debouncedScroll = debouncedHandleScroll(handleScroll, 100);
    window.addEventListener('scroll', debouncedScroll);
    
    return () => {
      window.removeEventListener('scroll', debouncedScroll);
    };
  }, [setScrollPosition]);

  // Navigation Handlers
  const handleCreateProduct = () => {
    navigate('/product/new');
  };

  const handleViewProduct = (product: Product) => {
    navigate(`/product/${product.product_id}`);
  };

  const handleEditProduct = (product: Product) => {
    navigate(`/product/${product.product_id}/edit`);
  };

  // Calculate stats
  const stats = {
    totalProducts: products.length,
    totalBrands: new Set(products.map(p => p.brand)).size,
    totalIndustries: new Set(products.map(p => p.industry)).size,
    recentProducts: products.slice(0, 6),
  };

  const getBrandStats = () => {
    const brandCounts = products.reduce((acc, product) => {
      acc[product.brand] = (acc[product.brand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const brandMapping = {
      'forza_bond': { name: 'ForzaBOND®', color: 'bg-blue-500' },
      'forza_seal': { name: 'ForzaSEAL®', color: 'bg-green-500' },
      'forza_tape': { name: 'ForzaTAPE®', color: 'bg-purple-500' },
      'forza_industrial': { name: 'Forza Industrial', color: 'bg-orange-500' },
      'forza_transportation': { name: 'Forza Transportation', color: 'bg-red-500' },
      'forza_uniform': { name: 'Forza Uniform', color: 'bg-indigo-500' },
    };

    return Object.entries(brandCounts).map(([brandKey, count]) => ({
      name: brandMapping[brandKey as keyof typeof brandMapping]?.name || brandKey,
      count,
      color: brandMapping[brandKey as keyof typeof brandMapping]?.color || 'bg-gray-500'
    })).filter(brand => brand.count > 0);
  };


  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Products</h2>
          <p className="text-gray-600">Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search and Controls */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search Bar */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-forza-blue focus:border-forza-blue"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Package className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleCreateProduct}
              className="flex items-center space-x-2 px-4 py-2 bg-forza-blue text-white rounded-lg hover:bg-forza-blue-dark transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Product</span>
            </button>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 lg:hidden"
            >
              <Filter className="h-5 w-5" />
            </button>
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-forza-blue text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-forza-blue text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="card">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Products</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Building className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Industries</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalIndustries}</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Wrench className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Brands</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalBrands}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Distribution */}
            <div className="card mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Products by Brand</h3>
              <div className="space-y-3">
                {getBrandStats().map((brand) => (
                  <div key={brand.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${brand.color} mr-3`} />
                      <span className="text-sm font-medium text-gray-700">{brand.name}</span>
                    </div>
                    <span className="text-sm text-gray-500">{brand.count} products</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Products ({filteredProducts.length})
                </h3>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forza-blue"></div>
                </div>
              ) : (
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.product_id || product.id || Math.random()}
                      product={product}
                      onView={handleViewProduct}
                      onEdit={handleEditProduct}
                    />
                  ))}
                </div>
              )}

              {filteredProducts.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Filter Sidebar */}
          <div className="hidden lg:block w-80">
            <FilterSidebar isOpen={true} onClose={() => {}} />
          </div>
        </div>

        {/* Mobile Filter Sidebar */}
        <FilterSidebar isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
        
        {/* Debug Panel */}
        <DebugPanel />
      </div>
    </>
  );
};
