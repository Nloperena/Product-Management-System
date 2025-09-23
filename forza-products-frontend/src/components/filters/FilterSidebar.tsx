import React from 'react';
import { useProductStore } from '../../store/productStore';
import { X } from 'lucide-react';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({ isOpen, onClose }) => {
  const { filters, setFilters, products } = useProductStore();

  // Get unique values for filter options
  const brands = [...new Set(products.map(p => p.brand))];
  const industries = [...new Set(products.map(p => p.industry))];
  const chemistries = [...new Set(products.map(p => p.chemistry).filter(Boolean))];

  const getBrandDisplayName = (brand: string) => {
    switch (brand) {
      case 'forza_bond':
        return 'ForzaBOND®';
      case 'forza_seal':
        return 'ForzaSEAL®';
      case 'forza_tape':
        return 'ForzaTAPE®';
      default:
        return brand;
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      brand: '',
      industry: '',
      chemistry: '',
      applications: [],
    });
  };

  const hasActiveFilters = filters.brand || filters.industry || filters.chemistry || filters.applications.length > 0;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:translate-x-0 lg:static lg:shadow-none lg:border-r lg:border-gray-200`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            <div className="flex items-center space-x-2">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-forza-blue hover:text-forza-blue-dark"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={onClose}
                className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <select
                value={filters.brand}
                onChange={(e) => setFilters({ brand: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forza-blue focus:border-transparent"
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {getBrandDisplayName(brand)}
                  </option>
                ))}
              </select>
            </div>

            {/* Industry Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                value={filters.industry}
                onChange={(e) => setFilters({ industry: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forza-blue focus:border-transparent"
              >
                <option value="">All Industries</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {/* Chemistry Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chemistry
              </label>
              <select
                value={filters.chemistry}
                onChange={(e) => setFilters({ chemistry: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forza-blue focus:border-transparent"
              >
                <option value="">All Chemistries</option>
                {chemistries.map((chemistry) => (
                  <option key={chemistry} value={chemistry}>
                    {chemistry?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || chemistry}
                  </option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {products.length} products
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
