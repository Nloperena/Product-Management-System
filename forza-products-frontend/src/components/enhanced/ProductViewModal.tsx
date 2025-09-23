import React, { useEffect } from 'react';
import type { Product } from '../../types/product';
import { ApiService } from '../../services/api';
import { X, ExternalLink, Package, Building, Zap, Tag, FileText, Ruler, CheckCircle, AlertCircle, Eye, Globe, Image } from 'lucide-react';

interface ProductViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductViewModal: React.FC<ProductViewModalProps> = ({ product, isOpen, onClose }) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!product || !isOpen) return null;

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

  const formatIndustry = (industry: string) => {
    return industry.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatArrayData = (data: any) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        return data.split(/[;,\n]/).map(item => item.trim()).filter(Boolean);
      }
    }
    return [];
  };

  const formatTechnicalData = (data: any) => {
    if (!data) return {};
    if (typeof data === 'object' && !Array.isArray(data)) return data;
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return { 'Technical Information': data };
      }
    }
    return {};
  };

  const benefits = formatArrayData(product.benefits);
  const applications = formatArrayData(product.applications);
  const technical = formatTechnicalData(product.technical);
  const packaging = formatArrayData(product.packaging);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl max-w-6xl max-h-[90vh] w-full overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="text-white p-6 relative"
          style={{ background: `linear-gradient(135deg, ${getBrandColor(product.brand)}, ${getBrandColor(product.brand)}dd)` }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <Package className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
              <div className="flex items-center space-x-4 text-white text-opacity-90">
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>{getBrandName(product.brand)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4" />
                  <span>{formatIndustry(product.industry)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {product.published ? (
                    <CheckCircle className="h-4 w-4 text-green-300" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-300" />
                  )}
                  <span>{product.published ? 'Published' : 'Draft'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-white text-opacity-90">
              <span className="font-mono text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
                ID: {product.product_id}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {product.url && (
                <a
                  href={product.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="text-sm">View Product Page</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-h-[calc(90vh-180px)] overflow-y-auto bg-gray-50">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="xl:col-span-2 space-y-8">
              {/* Description */}
              {product.description && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Benefits */}
              {benefits.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                      <Zap className="h-5 w-5 text-yellow-600" />
                    </div>
                    Benefits
                    <span className="ml-2 text-sm font-normal text-gray-500">({benefits.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex-shrink-0 w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <span className="text-gray-700 font-medium">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Applications */}
              {applications.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    Applications
                    <span className="ml-2 text-sm font-normal text-gray-500">({applications.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {applications.map((application, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <span className="text-gray-700 font-medium">{application}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Information */}
              {Object.keys(technical).length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <Ruler className="h-5 w-5 text-purple-600" />
                    </div>
                    Technical Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(technical).map(([key, value]) => (
                      <div key={key} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <dt className="text-sm font-semibold text-purple-900 mb-1">{key}</dt>
                        <dd className="text-gray-700">{String(value)}</dd>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Details & Image */}
            <div className="space-y-8">
              {/* Product Image */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="p-2 bg-gray-100 rounded-lg mr-3">
                    <Image className="h-5 w-5 text-gray-600" />
                  </div>
                  Product Image
                </h3>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
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
              </div>

              {/* Product Details */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  Product Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <dt className="text-sm font-semibold text-gray-700 mb-1">Product ID</dt>
                    <dd className="text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">{product.product_id}</dd>
                  </div>
                  
                  {product.full_name && (
                    <div>
                      <dt className="text-sm font-semibold text-gray-700 mb-1">Full Name</dt>
                      <dd className="text-gray-900">{product.full_name}</dd>
                    </div>
                  )}

                  <div>
                    <dt className="text-sm font-semibold text-gray-700 mb-1">Brand</dt>
                    <dd className="text-gray-900">{getBrandName(product.brand)}</dd>
                  </div>

                  <div>
                    <dt className="text-sm font-semibold text-gray-700 mb-1">Industry</dt>
                    <dd className="text-gray-900">{formatIndustry(product.industry)}</dd>
                  </div>

                  {product.chemistry && (
                    <div>
                      <dt className="text-sm font-semibold text-gray-700 mb-1">Chemistry</dt>
                      <dd className="text-gray-900">{product.chemistry}</dd>
                    </div>
                  )}

                  <div>
                    <dt className="text-sm font-semibold text-gray-700 mb-1">Status</dt>
                    <dd className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.published 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {product.published ? 'Published' : 'Draft'}
                    </dd>
                  </div>
                </div>
              </div>

              {/* Links */}
              {(product.url || product.image) && (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg mr-3">
                      <Globe className="h-5 w-5 text-purple-600" />
                    </div>
                    Links & Resources
                  </h3>
                  <div className="space-y-3">
                    {product.url && (
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-forza-blue hover:text-forza-blue-dark transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="text-sm">Product Page</span>
                      </a>
                    )}
                    
                    {product.image && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Image className="h-4 w-4" />
                        <span className="text-sm font-mono">{product.image}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Statistics */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="p-1 bg-blue-100 rounded mr-2">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                  Statistics
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600">{benefits.length}</div>
                    <div className="text-xs text-gray-600">Benefits</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-100">
                    <div className="text-2xl font-bold text-purple-600">{applications.length}</div>
                    <div className="text-xs text-gray-600">Applications</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-300 hover:border-gray-400 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
