import React, { useState, useMemo } from 'react';
import { useProductStore } from '../../store/productStore';
import { Search, Grid, List, BarChart3, Target, Layers, Zap } from 'lucide-react';
import type { Product } from '../../types/product';

interface ProductExplorerProps {
  onProductSelect: (product: Product) => void;
}

type ViewMode = 'cards' | 'table' | 'analytics' | 'comparison';
type GroupBy = 'none' | 'brand' | 'industry' | 'chemistry';

export const ProductExplorer: React.FC<ProductExplorerProps> = ({ onProductSelect }) => {
  const { products, filteredProducts, searchQuery, setSearchQuery, filters, setFilters } = useProductStore();
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  // Smart filtering suggestions based on current search
  const getSmartSuggestions = () => {
    if (!searchQuery) return [];
    
    const suggestions: Array<{type: string, value: string, count: number}> = [];
    const query = searchQuery.toLowerCase();
    
    // Chemistry suggestions
    const chemistries = [...new Set(products.map(p => p.chemistry).filter(Boolean))];
    chemistries.forEach(chem => {
      if (chem && chem.toLowerCase().includes(query)) {
        suggestions.push({ type: 'chemistry', value: chem, count: products.filter(p => p.chemistry === chem).length });
      }
    });
    
    // Application suggestions
    products.forEach(product => {
      if (typeof product.applications === 'string' && product.applications.toLowerCase().includes(query)) {
        suggestions.push({ type: 'application', value: product.name, count: 1 });
      }
    });
    
    return suggestions.slice(0, 5);
  };

  // Group products for better organization
  const groupedProducts = useMemo(() => {
    if (groupBy === 'none') return { 'All Products': filteredProducts };
    
    return filteredProducts.reduce((groups, product) => {
      let key = '';
      switch (groupBy) {
        case 'brand':
          key = product.brand === 'forza_bond' ? 'ForzaBOND®' : 
                product.brand === 'forza_seal' ? 'ForzaSEAL®' : 'ForzaTAPE®';
          break;
        case 'industry':
          key = product.industry.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
          break;
        case 'chemistry':
          key = product.chemistry || 'Other';
          break;
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(product);
      return groups;
    }, {} as Record<string, Product[]>);
  }, [filteredProducts, groupBy]);

  // Quick filter buttons
  const quickFilters = [
    { label: 'High Temp', filter: () => setSearchQuery('temperature resistance') },
    { label: 'Marine Grade', filter: () => setFilters({ industry: 'marine_industry' }) },
    { label: 'Structural', filter: () => setSearchQuery('structural bonding') },
    { label: 'Fast Cure', filter: () => setSearchQuery('fast cure') },
  ];

  const handleProductToggle = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Search Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Main Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by product name, chemistry, application, or benefits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forza-blue focus:border-transparent"
              />
            </div>
            
            {/* Smart Suggestions */}
            {searchQuery && getSmartSuggestions().length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {getSmartSuggestions().map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSearchQuery(suggestion.value)}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors"
                  >
                    {suggestion.value} ({suggestion.count})
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((qf, idx) => (
              <button
                key={idx}
                onClick={qf.filter}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
              >
                {qf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.brand && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Brand: {filters.brand}
              <button onClick={() => setFilters({ brand: '' })} className="ml-2 text-blue-600 hover:text-blue-800">×</button>
            </span>
          )}
          {filters.industry && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
              Industry: {filters.industry.replace('_', ' ')}
              <button onClick={() => setFilters({ industry: '' })} className="ml-2 text-green-600 hover:text-green-800">×</button>
            </span>
          )}
          {filters.chemistry && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
              Chemistry: {filters.chemistry}
              <button onClick={() => setFilters({ chemistry: '' })} className="ml-2 text-purple-600 hover:text-purple-800">×</button>
            </span>
          )}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {filteredProducts.length} of {products.length} products
          </span>
          
          {selectedProducts.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-blue-600 font-medium">
                {selectedProducts.size} selected
              </span>
              <button 
                onClick={() => console.log('Compare products:', Array.from(selectedProducts))}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Compare
              </button>
              <button 
                onClick={() => setSelectedProducts(new Set())}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Group By */}
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupBy)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="none">No Grouping</option>
            <option value="brand">Group by Brand</option>
            <option value="industry">Group by Industry</option>
            <option value="chemistry">Group by Chemistry</option>
          </select>

          {/* View Mode */}
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 ${viewMode === 'cards' ? 'bg-forza-blue text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 ${viewMode === 'table' ? 'bg-forza-blue text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`p-2 ${viewMode === 'analytics' ? 'bg-forza-blue text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {Object.entries(groupedProducts).map(([groupName, groupProducts]) => (
          <div key={groupName} className="space-y-4">
            {groupBy !== 'none' && (
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900">{groupName}</h3>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                  {groupProducts.length} products
                </span>
              </div>
            )}

            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {groupProducts.map((product) => (
                  <EnhancedProductCard
                    key={product.product_id}
                    product={product}
                    isSelected={selectedProducts.has(product.product_id)}
                    onToggleSelect={() => handleProductToggle(product.product_id)}
                    onView={() => onProductSelect(product)}
                  />
                ))}
              </div>
            )}

            {viewMode === 'table' && (
              <ProductTable 
                products={groupProducts}
                selectedProducts={selectedProducts}
                onToggleSelect={handleProductToggle}
                onProductSelect={onProductSelect}
              />
            )}

            {viewMode === 'analytics' && (
              <ProductAnalytics products={groupProducts} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced Product Card Component
const EnhancedProductCard: React.FC<{
  product: Product;
  isSelected: boolean;
  onToggleSelect: () => void;
  onView: () => void;
}> = ({ product, isSelected, onToggleSelect, onView }) => {
  const getBrandColor = (brand: string) => {
    switch (brand) {
      case 'forza_bond': return 'bg-blue-500';
      case 'forza_seal': return 'bg-green-500';
      case 'forza_tape': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getKeyBenefits = () => {
    if (typeof product.benefits === 'string') {
      return product.benefits.split(' ').slice(0, 3).join(' ') + '...';
    }
    if (Array.isArray(product.benefits)) {
      return product.benefits.slice(0, 2).join(', ');
    }
    return '';
  };

  return (
    <div className={`card cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
      isSelected ? 'ring-2 ring-forza-blue bg-blue-50' : ''
    }`}>
      {/* Header with selection and brand */}
      <div className="flex justify-between items-start mb-3">
        <div className={`w-3 h-3 rounded-full ${getBrandColor(product.brand)}`}></div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
            isSelected ? 'bg-forza-blue border-forza-blue text-white' : 'border-gray-300'
          }`}
        >
          {isSelected && '✓'}
        </button>
      </div>

      {/* Product Info */}
      <div onClick={onView} className="space-y-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 font-mono">{product.product_id}</p>
        </div>

        {/* Key Benefits */}
        {getKeyBenefits() && (
          <p className="text-xs text-gray-600 line-clamp-2">
            <span className="font-medium text-green-600">Benefits:</span> {getKeyBenefits()}
          </p>
        )}

        {/* Chemistry & Industry Tags */}
        <div className="flex flex-wrap gap-1">
          {product.chemistry && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
              {product.chemistry.replace('_', ' ')}
            </span>
          )}
          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
            {product.industry.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="flex space-x-2">
            <Target className="h-3 w-3 text-gray-400" />
            <Layers className="h-3 w-3 text-gray-400" />
            <Zap className="h-3 w-3 text-gray-400" />
          </div>
          <span className="text-xs text-forza-blue font-medium">View Details →</span>
        </div>
      </div>
    </div>
  );
};

// Product Table Component
const ProductTable: React.FC<{
  products: Product[];
  selectedProducts: Set<string>;
  onToggleSelect: (id: string) => void;
  onProductSelect: (product: Product) => void;
}> = ({ products, selectedProducts, onToggleSelect, onProductSelect }) => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Product
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Brand
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Industry
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Chemistry
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.product_id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedProducts.has(product.product_id)}
                    onChange={() => onToggleSelect(product.product_id)}
                    className="mr-3 h-4 w-4 text-forza-blue focus:ring-forza-blue border-gray-300 rounded"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.product_id}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {product.brand.replace('forza_', 'Forza').replace('_', '')}®
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {product.industry.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {product.chemistry || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onProductSelect(product)}
                  className="text-forza-blue hover:text-forza-blue-dark"
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Product Analytics Component
const ProductAnalytics: React.FC<{ products: Product[] }> = ({ products }) => {
  const brandStats = products.reduce((acc, product) => {
    acc[product.brand] = (acc[product.brand] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chemistryStats = products.reduce((acc, product) => {
    const chem = product.chemistry || 'Other';
    acc[chem] = (acc[chem] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Brand Distribution */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-lg font-semibold mb-4">Brand Distribution</h4>
        <div className="space-y-3">
          {Object.entries(brandStats).map(([brand, count]) => (
            <div key={brand} className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {brand.replace('forza_', 'Forza').replace('_', '')}®
              </span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-forza-blue h-2 rounded-full"
                    style={{ width: `${(count / products.length) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chemistry Distribution */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-lg font-semibold mb-4">Chemistry Types</h4>
        <div className="space-y-3">
          {Object.entries(chemistryStats).slice(0, 5).map(([chemistry, count]) => (
            <div key={chemistry} className="flex items-center justify-between">
              <span className="text-sm font-medium">{chemistry.replace('_', ' ')}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${(count / products.length) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

