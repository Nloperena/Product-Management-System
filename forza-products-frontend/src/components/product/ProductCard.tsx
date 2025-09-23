import React from 'react';
import type { Product } from '../../types/product.ts';
import { ApiService } from '../../services/api';
import { useProductStore } from '../../store/productStore';
import { Check, Plus, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onView }) => {
  const { selectedProducts, toggleProductSelection } = useProductStore();
  const productId = product.product_id || product.id || '';
  const isSelected = selectedProducts.includes(productId);

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleProductSelection(productId);
  };

  const handleView = () => {
    onView(product);
  };

  const getBrandColor = (brand: string) => {
    switch (brand) {
      case 'forza_bond':
        return 'bg-blue-100 text-blue-800';
      case 'forza_seal':
        return 'bg-green-100 text-green-800';
      case 'forza_tape':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  return (
    <div
      className={`card cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 ${
        isSelected ? 'ring-2 ring-forza-blue' : ''
      }`}
      onClick={handleView}
    >
      {/* Product Image */}
      <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
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

      {/* Product Info */}
      <div className="space-y-2">
        {/* Brand Badge */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBrandColor(product.brand)}`}>
            {getBrandDisplayName(product.brand)}
          </span>
          <button
            onClick={handleSelect}
            className={`p-1 rounded-full transition-colors ${
              isSelected
                ? 'bg-forza-blue text-white'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            {isSelected ? (
              <Check className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Product Name */}
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {product.name}
        </h3>

        {/* Product ID */}
        <p className="text-sm text-gray-500 font-mono">
          {productId}
        </p>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Industry */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 capitalize">
            {product.industry.replace('_', ' ')}
          </span>
          <button
            onClick={handleView}
            className="flex items-center text-xs text-forza-blue hover:text-forza-blue-dark"
          >
            <Eye className="h-3 w-3 mr-1" />
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};
