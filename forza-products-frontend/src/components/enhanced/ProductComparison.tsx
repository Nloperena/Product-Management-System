import React from 'react';
import { X, CheckCircle, XCircle, Minus, ExternalLink } from 'lucide-react';
import type { Product } from '../../types/product';
import { ApiService } from '../../services/api';

interface ProductComparisonProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveProduct: (productId: string) => void;
}

export const ProductComparison: React.FC<ProductComparisonProps> = ({
  products,
  isOpen,
  onClose,
  onRemoveProduct
}) => {
  if (!isOpen || products.length === 0) return null;

  const getBrandInfo = (brand: string) => {
    switch (brand) {
      case 'forza_bond':
        return { name: 'ForzaBOND®', color: 'bg-blue-500' };
      case 'forza_seal':
        return { name: 'ForzaSEAL®', color: 'bg-green-500' };
      case 'forza_tape':
        return { name: 'ForzaTAPE®', color: 'bg-purple-500' };
      default:
        return { name: brand, color: 'bg-gray-500' };
    }
  };

  const formatBenefits = (benefits: string | string[] | undefined) => {
    if (!benefits) return [];
    if (typeof benefits === 'string') {
      return benefits.split(/[,\n]/).map(b => b.trim()).filter(b => b.length > 0);
    }
    return Array.isArray(benefits) ? benefits : [];
  };

  // Get all unique benefits across products for comparison
  const allBenefits = Array.from(new Set(
    products.flatMap(product => formatBenefits(product.benefits))
  )).sort();

  // Get all unique properties for technical comparison
  const allTechnicalProps = Array.from(new Set(
    products.flatMap(product => {
      if (typeof product.technical === 'object' && product.technical) {
        return Object.keys(product.technical);
      }
      return [];
    })
  )).sort();

  const getProductBenefits = (product: Product) => formatBenefits(product.benefits);

  const getTechnicalValue = (product: Product, prop: string) => {
    if (typeof product.technical === 'object' && product.technical) {
      return product.technical[prop] || '-';
    }
    return '-';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-7xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Product Comparison
                </h3>
                <p className="text-sm text-gray-500">
                  Comparing {products.length} products
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-6 max-h-96 overflow-auto">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="sticky left-0 bg-white px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Property
                    </th>
                    {products.map((product) => (
                      <th key={product.product_id} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-64">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <div className={`w-3 h-3 rounded-full ${getBrandInfo(product.brand).color}`}></div>
                              <span className="font-semibold text-gray-900 text-sm">
                                {product.name.length > 30 ? product.name.substring(0, 30) + '...' : product.name}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500">{product.product_id}</div>
                          </div>
                          <button
                            onClick={() => onRemoveProduct(product.product_id)}
                            className="text-red-400 hover:text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Product Images */}
                  <tr className="hover:bg-gray-50">
                    <td className="sticky left-0 bg-white px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                      Image
                    </td>
                    {products.map((product) => (
                      <td key={product.product_id} className="px-4 py-3">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={ApiService.getProductImageUrl(product.image || '')}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-product.svg';
                            }}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Brand */}
                  <tr className="hover:bg-gray-50">
                    <td className="sticky left-0 bg-white px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                      Brand
                    </td>
                    {products.map((product) => (
                      <td key={product.product_id} className="px-4 py-3 text-sm text-gray-900">
                        {getBrandInfo(product.brand).name}
                      </td>
                    ))}
                  </tr>

                  {/* Industry */}
                  <tr className="hover:bg-gray-50">
                    <td className="sticky left-0 bg-white px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                      Industry
                    </td>
                    {products.map((product) => (
                      <td key={product.product_id} className="px-4 py-3 text-sm text-gray-900">
                        {product.industry.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </td>
                    ))}
                  </tr>

                  {/* Chemistry */}
                  <tr className="hover:bg-gray-50">
                    <td className="sticky left-0 bg-white px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                      Chemistry
                    </td>
                    {products.map((product) => (
                      <td key={product.product_id} className="px-4 py-3 text-sm text-gray-900">
                        {product.chemistry ? product.chemistry.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : '-'}
                      </td>
                    ))}
                  </tr>

                  {/* Description */}
                  <tr className="hover:bg-gray-50">
                    <td className="sticky left-0 bg-white px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                      Description
                    </td>
                    {products.map((product) => (
                      <td key={product.product_id} className="px-4 py-3 text-sm text-gray-700">
                        <div className="max-w-xs">
                          {product.description ? (
                            product.description.length > 100 ? 
                              product.description.substring(0, 100) + '...' : 
                              product.description
                          ) : '-'}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Benefits Comparison */}
                  {allBenefits.slice(0, 10).map((benefit) => (
                    <tr key={benefit} className="hover:bg-gray-50">
                      <td className="sticky left-0 bg-white px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                        <div className="max-w-48 truncate" title={benefit}>
                          {benefit}
                        </div>
                      </td>
                      {products.map((product) => {
                        const productBenefits = getProductBenefits(product);
                        const hasBenefit = productBenefits.some(b => b.toLowerCase().includes(benefit.toLowerCase()));
                        return (
                          <td key={product.product_id} className="px-4 py-3 text-center">
                            {hasBenefit ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-300 mx-auto" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* Technical Specifications */}
                  {allTechnicalProps.slice(0, 8).map((prop) => (
                    <tr key={prop} className="hover:bg-gray-50">
                      <td className="sticky left-0 bg-white px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                        {prop.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </td>
                      {products.map((product) => (
                        <td key={product.product_id} className="px-4 py-3 text-sm text-gray-900">
                          {getTechnicalValue(product, prop)}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {/* Sizing */}
                  <tr className="hover:bg-gray-50">
                    <td className="sticky left-0 bg-white px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                      Available Sizes
                    </td>
                    {products.map((product) => (
                      <td key={product.product_id} className="px-4 py-3 text-sm text-gray-900">
                        <div className="max-w-xs">
                          {product.sizing ? (
                            typeof product.sizing === 'string' ? 
                              product.sizing.length > 50 ? 
                                product.sizing.substring(0, 50) + '...' : 
                                product.sizing
                              : JSON.stringify(product.sizing)
                          ) : '-'}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Product Links */}
                  <tr className="hover:bg-gray-50">
                    <td className="sticky left-0 bg-white px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                      Product Page
                    </td>
                    {products.map((product) => (
                      <td key={product.product_id} className="px-4 py-3">
                        {product.url ? (
                          <a
                            href={product.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-forza-blue hover:text-forza-blue-dark text-sm"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View
                          </a>
                        ) : (
                          <Minus className="h-4 w-4 text-gray-400" />
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Scroll horizontally to view all products and properties
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Print Comparison
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-forza-blue text-white rounded-md text-sm font-medium hover:bg-forza-blue-dark"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

