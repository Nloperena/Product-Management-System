import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Edit, Package } from 'lucide-react';
import type { Product } from '../../types/product';
import { Card, CardContent, CardFooter } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { formatDate, truncateText } from '../../utils/formatting';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const placeholderImage = '/placeholder-product.svg';

  return (
    <Card className="h-full flex flex-col">
      <div className="relative">
        <img
          src={product.image || placeholderImage}
          alt={product.name}
          className="h-48 w-full object-cover rounded-t-lg"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = placeholderImage;
          }}
        />
        <div className="absolute top-2 right-2">
          <Badge variant={product.published ? 'success' : 'secondary'}>
            {product.published ? 'Published' : 'Draft'}
          </Badge>
        </div>
      </div>

      <CardContent className="flex-1 p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-gray-900 truncate">
              {product.name}
            </h3>
            <span className="text-sm text-gray-500">
              {product.product_id}
            </span>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Badge variant="default">{product.brand}</Badge>
            <Badge variant="secondary">{product.industry}</Badge>
          </div>

          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {truncateText(product.description, 100)}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Package className="h-3 w-3" />
              <span>{product.benefits_count} benefits</span>
            </div>
            <span>Updated {formatDate(product.last_edited)}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 space-x-2">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link to={`/products/${product.id}`}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link to={`/products/${product.id}/edit`}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
