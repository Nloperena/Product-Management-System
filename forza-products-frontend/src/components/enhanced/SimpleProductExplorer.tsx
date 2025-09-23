import React, { useState } from 'react';
import { useProductStore } from '../../store/productStore';
import { Search, Grid, List, Download } from 'lucide-react';
import type { Product } from '../../types/product';
import { ApiService } from '../../services/api';
import { exportToCSV, generateExportFilename } from '../../utils/csvExport';

interface SimpleProductExplorerProps {
  onProductSelect: (product: Product) => void;
}

export const SimpleProductExplorer: React.FC<SimpleProductExplorerProps> = ({ onProductSelect }) => {
  const { products, filteredProducts, searchQuery, setSearchQuery, filters, setFilters } = useProductStore();
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isExporting, setIsExporting] = useState(false);

  const getBrandColor = (brand: string) => {
    switch (brand) {
      case 'forza_bond': return '#3b82f6';
      case 'forza_seal': return '#22c55e';
      case 'forza_tape': return '#a855f7';
      default: return '#6b7280';
    }
  };

  const getBrandName = (brand: string) => {
    switch (brand) {
      case 'forza_bond': return 'ForzaBOND®';
      case 'forza_seal': return 'ForzaSEAL®';
      case 'forza_tape': return 'ForzaTAPE®';
      default: return brand;
    }
  };

  // Get unique values for filters
  const brands = [...new Set(products.map(p => p.brand))];
  const industries = [...new Set(products.map(p => p.industry))];
  const chemistries = [...new Set(products.map(p => p.chemistry).filter(Boolean))];

  const clearFilters = () => {
    setFilters({
      search: '',
      brand: '',
      industry: '',
      chemistry: '',
      applications: [],
      published: 'all',
    });
    setSearchQuery('');
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      // Filter products based on published status
      let productsToExport = filteredProducts;
      
      // If published filter is active, ensure we only export the correct status
      if (filters.published === 'published') {
        productsToExport = filteredProducts.filter(product => 
          product.published !== false // Published products (true or undefined)
        );
      } else if (filters.published === 'unpublished') {
        productsToExport = filteredProducts.filter(product => 
          product.published === false // Only explicitly unpublished products
        );
      }
      
      console.log('📊 Export: Filtered', filteredProducts.length, 'products to', productsToExport.length, 'for export');
      console.log('📊 Export: Published filter:', filters.published);
      
      const filename = generateExportFilename(filters, productsToExport.length);
      await exportToCSV(productsToExport, filename);
    } catch (error) {
      console.error('❌ Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Search and Filters */}
      <div style={{ 
        background: 'white', 
        borderRadius: '0.75rem', 
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
        border: '1px solid #e5e7eb', 
        padding: '1.5rem' 
      }}>
        {/* Search Bar */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ 
              position: 'absolute', 
              left: '0.75rem', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#9ca3af' 
            }}>
              <Search style={{ width: '1.25rem', height: '1.25rem' }} />
            </div>
            <input
              type="text"
              placeholder="Search products by name, chemistry, or application..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '2.5rem',
                paddingRight: '1rem',
                paddingTop: '0.75rem',
                paddingBottom: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1e40af';
                e.target.style.boxShadow = '0 0 0 3px rgba(30, 64, 175, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Filters */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Brand
            </label>
            <select
              value={filters.brand}
              onChange={(e) => setFilters({ brand: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                backgroundColor: 'white',
                outline: 'none'
              }}
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {getBrandName(brand)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Industry
            </label>
            <select
              value={filters.industry}
              onChange={(e) => setFilters({ industry: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                backgroundColor: 'white',
                outline: 'none'
              }}
            >
              <option value="">All Industries</option>
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Chemistry
            </label>
            <select
              value={filters.chemistry}
              onChange={(e) => setFilters({ chemistry: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                backgroundColor: 'white',
                outline: 'none'
              }}
            >
              <option value="">All Chemistries</option>
              {chemistries.map((chemistry) => (
                <option key={chemistry} value={chemistry}>
                  {chemistry?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Publication Status
            </label>
            <select
              value={filters.published}
              onChange={(e) => setFilters({ published: e.target.value as 'all' | 'published' | 'unpublished' })}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                backgroundColor: 'white',
                outline: 'none'
              }}
            >
              <option value="all">All Products</option>
              <option value="published">Published Only</option>
              <option value="unpublished">Unpublished Only</option>
            </select>
          </div>
        </div>

        {/* Active Filters and Clear */}
        {(filters.brand || filters.industry || filters.chemistry || filters.published !== 'all' || searchQuery) && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {filters.brand && (
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  padding: '0.25rem 0.75rem', 
                  backgroundColor: '#dbeafe', 
                  color: '#1e40af', 
                  borderRadius: '9999px', 
                  fontSize: '0.75rem' 
                }}>
                  Brand: {getBrandName(filters.brand)}
                  <button 
                    onClick={() => setFilters({ brand: '' })}
                    style={{ marginLeft: '0.5rem', color: '#1e40af', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.industry && (
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  padding: '0.25rem 0.75rem', 
                  backgroundColor: '#dcfce7', 
                  color: '#166534', 
                  borderRadius: '9999px', 
                  fontSize: '0.75rem' 
                }}>
                  Industry: {filters.industry.replace('_', ' ')}
                  <button 
                    onClick={() => setFilters({ industry: '' })}
                    style={{ marginLeft: '0.5rem', color: '#166534', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.chemistry && (
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  padding: '0.25rem 0.75rem', 
                  backgroundColor: '#f3e8ff', 
                  color: '#7c3aed', 
                  borderRadius: '9999px', 
                  fontSize: '0.75rem' 
                }}>
                  Chemistry: {filters.chemistry}
                  <button 
                    onClick={() => setFilters({ chemistry: '' })}
                    style={{ marginLeft: '0.5rem', color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.published !== 'all' && (
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  padding: '0.25rem 0.75rem', 
                  backgroundColor: '#fef3c7', 
                  color: '#92400e', 
                  borderRadius: '9999px', 
                  fontSize: '0.75rem' 
                }}>
                  Status: {filters.published === 'published' ? 'Published' : 'Unpublished'}
                  <button 
                    onClick={() => setFilters({ published: 'all' })}
                    style={{ marginLeft: '0.5rem', color: '#92400e', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={clearFilters}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Clear All
              </button>
              <button
                onClick={handleExportCSV}
                disabled={isExporting}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: isExporting ? '#6b7280' : '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  cursor: isExporting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: isExporting ? 0.7 : 1,
                }}
                title={`Export ${
                  filters.published === 'published' 
                    ? filteredProducts.filter(p => p.published !== false).length 
                    : filters.published === 'unpublished'
                    ? filteredProducts.filter(p => p.published === false).length
                    : filteredProducts.length
                } products to CSV`}
              >
                <Download style={{ width: '1rem', height: '1rem' }} />
                {isExporting ? 'Exporting...' : `Export CSV (${
                  filters.published === 'published' 
                    ? filteredProducts.filter(p => p.published !== false).length 
                    : filters.published === 'unpublished'
                    ? filteredProducts.filter(p => p.published === false).length
                    : filteredProducts.length
                })`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: 0 }}>
            Products ({filteredProducts.length})
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
            {filteredProducts.length} of {products.length} products
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: isExporting ? '#6b7280' : '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              cursor: isExporting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: isExporting ? 0.7 : 1,
            }}
            title={`Export ${
              filters.published === 'published' 
                ? filteredProducts.filter(p => p.published !== false).length 
                : filters.published === 'unpublished'
                ? filteredProducts.filter(p => p.published === false).length
                : filteredProducts.length
            } products to CSV`}
          >
            <Download style={{ width: '1rem', height: '1rem' }} />
            {isExporting ? 'Exporting...' : `Export (${
              filters.published === 'published' 
                ? filteredProducts.filter(p => p.published !== false).length 
                : filters.published === 'unpublished'
                ? filteredProducts.filter(p => p.published === false).length
                : filteredProducts.length
            })`}
          </button>
          
          <div style={{ display: 'flex', border: '1px solid #d1d5db', borderRadius: '0.5rem' }}>
            <button
              onClick={() => setViewMode('cards')}
              style={{
                padding: '0.5rem',
                backgroundColor: viewMode === 'cards' ? '#1e40af' : 'transparent',
                color: viewMode === 'cards' ? 'white' : '#6b7280',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <Grid style={{ width: '1rem', height: '1rem' }} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '0.5rem',
                backgroundColor: viewMode === 'table' ? '#1e40af' : 'transparent',
                color: viewMode === 'table' ? 'white' : '#6b7280',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <List style={{ width: '1rem', height: '1rem' }} />
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {viewMode === 'cards' && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {filteredProducts.map((product) => (
            <SimpleProductCard
              key={product.product_id}
              product={product}
              onView={onProductSelect}
              brandColor={getBrandColor(product.brand)}
              brandName={getBrandName(product.brand)}
            />
          ))}
        </div>
      )}

      {/* Products Table */}
      {viewMode === 'table' && (
        <div style={{ 
          background: 'white', 
          borderRadius: '0.5rem', 
          border: '1px solid #e5e7eb', 
          overflow: 'hidden' 
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                    Product
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                    Brand
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                    Industry
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                    Chemistry
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                    Status
                  </th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#6b7280', textTransform: 'uppercase' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody style={{ backgroundColor: 'white' }}>
                {filteredProducts.map((product, index) => (
                  <tr key={product.product_id} style={{ borderTop: index > 0 ? '1px solid #e5e7eb' : 'none' }}>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
                          {product.name}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {product.product_id}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', color: '#111827' }}>
                      {getBrandName(product.brand)}
                    </td>
                    <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', color: '#111827' }}>
                      {product.industry.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </td>
                    <td style={{ padding: '1rem 0.75rem', fontSize: '0.875rem', color: '#111827' }}>
                      {product.chemistry || '-'}
                    </td>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        backgroundColor: (product.published !== false) ? '#dcfce7' : '#fef2f2', 
                        color: (product.published !== false) ? '#166534' : '#dc2626', 
                        fontSize: '0.75rem', 
                        borderRadius: '0.25rem',
                        fontWeight: '500'
                      }}>
                        {(product.published !== false) ? '✓ Published' : '⚠ Unpublished'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.75rem' }}>
                      <button
                        onClick={() => onProductSelect(product)}
                        style={{
                          color: '#1e40af',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
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
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem', 
          background: 'white', 
          borderRadius: '0.5rem', 
          border: '1px solid #e5e7eb' 
        }}>
          <div style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827', marginBottom: '0.5rem' }}>
            No products found
          </div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}
    </div>
  );
};

// Simple Product Card Component
const SimpleProductCard: React.FC<{
  product: Product;
  onView: (product: Product) => void;
  brandColor: string;
  brandName: string;
}> = ({ product, onView, brandColor, brandName }) => {
  const getKeyBenefits = () => {
    if (typeof product.benefits === 'string') {
      return product.benefits.substring(0, 100) + (product.benefits.length > 100 ? '...' : '');
    }
    if (Array.isArray(product.benefits)) {
      return product.benefits.slice(0, 2).join(', ');
    }
    return '';
  };

  return (
    <div 
      style={{ 
        background: 'white', 
        borderRadius: '0.75rem', 
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 
        border: '1px solid #e5e7eb', 
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onClick={() => onView(product)}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Brand Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ 
          width: '0.75rem', 
          height: '0.75rem', 
          backgroundColor: brandColor, 
          borderRadius: '50%', 
          marginRight: '0.5rem' 
        }} />
        <span style={{ 
          fontSize: '0.75rem', 
          fontWeight: '500', 
          color: '#6b7280' 
        }}>
          {brandName}
        </span>
      </div>

      {/* Product Image */}
      <div style={{ 
        width: '100%', 
        height: '12rem', 
        backgroundColor: '#f3f4f6', 
        borderRadius: '0.5rem', 
        overflow: 'hidden', 
        marginBottom: '1rem' 
      }}>
        <img
          src={ApiService.getProductImageUrl(product.image || '')}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            console.log('🖼️ Image failed to load:', target.src, 'for product:', product.name);
            target.src = '/placeholder-product.svg';
          }}
        />
      </div>

      {/* Product Info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div>
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            color: '#111827', 
            margin: '0 0 0.25rem 0',
            lineHeight: '1.4'
          }}>
            {product.name.length > 60 ? product.name.substring(0, 60) + '...' : product.name}
          </h3>
          <p style={{ 
            fontSize: '0.75rem', 
            color: '#6b7280', 
            fontFamily: 'monospace',
            margin: 0
          }}>
            {product.product_id}
          </p>
        </div>

        {/* Description */}
        {product.description && (
          <p style={{ 
            fontSize: '0.875rem', 
            color: '#4b5563', 
            margin: 0,
            lineHeight: '1.4'
          }}>
            {product.description.length > 80 ? product.description.substring(0, 80) + '...' : product.description}
          </p>
        )}

        {/* Key Benefits */}
        {getKeyBenefits() && (
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '500', color: '#16a34a' }}>Benefits: </span>
            <span style={{ fontSize: '0.75rem', color: '#4b5563' }}>{getKeyBenefits()}</span>
          </div>
        )}

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {product.chemistry && (
            <span style={{ 
              padding: '0.25rem 0.5rem', 
              backgroundColor: '#f3e8ff', 
              color: '#7c3aed', 
              fontSize: '0.75rem', 
              borderRadius: '0.25rem' 
            }}>
              {product.chemistry.replace('_', ' ')}
            </span>
          )}
          <span style={{ 
            padding: '0.25rem 0.5rem', 
            backgroundColor: '#f3f4f6', 
            color: '#374151', 
            fontSize: '0.75rem', 
            borderRadius: '0.25rem' 
          }}>
            {product.industry.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </span>
          <span style={{ 
            padding: '0.25rem 0.5rem', 
            backgroundColor: (product.published !== false) ? '#dcfce7' : '#fef2f2', 
            color: (product.published !== false) ? '#166534' : '#dc2626', 
            fontSize: '0.75rem', 
            borderRadius: '0.25rem',
            fontWeight: '500'
          }}>
            {(product.published !== false) ? '✓ Published' : '⚠ Unpublished'}
          </span>
        </div>

        {/* View Details */}
        <div style={{ 
          paddingTop: '0.75rem', 
          borderTop: '1px solid #f3f4f6',
          textAlign: 'right'
        }}>
          <span style={{ 
            fontSize: '0.75rem', 
            color: '#1e40af', 
            fontWeight: '500' 
          }}>
            View Details →
          </span>
        </div>
      </div>
    </div>
  );
};
