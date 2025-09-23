import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, ExternalLink, Package } from 'lucide-react';
import type { Product } from '../types/product';
import { productApi } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatDate } from '../utils/formatting';

const ProductViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('Product ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await productApi.getProduct(id);
        if (data) {
          setProduct(data);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'Product not found'}</p>
        <Button onClick={() => navigate('/products')} className="mt-4">
          Back to Products
        </Button>
      </div>
    );
  }

  const placeholderImage = '/placeholder-product.svg';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600 mt-1">Product ID: {product.product_id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={product.published ? 'success' : 'secondary'}>
            {product.published ? 'Published' : 'Draft'}
          </Badge>
          <Button asChild>
            <Link to={`/products/${product.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Brand</label>
                  <p className="text-gray-900">{product.brand}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Industry</label>
                  <p className="text-gray-900">{product.industry}</p>
                </div>
              </div>
              
              {product.chemistry && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Chemistry</label>
                  <p className="text-gray-900">{product.chemistry}</p>
                </div>
              )}

              {product.description && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="text-gray-900">{product.description}</p>
                </div>
              )}

              {product.url && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Product URL</label>
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                  >
                    <span>{product.url}</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Benefits */}
          {product.benefits && product.benefits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Benefits ({product.benefits.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {product.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Applications */}
          {product.applications && product.applications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Applications ({product.applications.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {product.applications.map((application, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>{application}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Technical Properties */}
          {product.technical && product.technical.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Technical Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {product.technical.map((tech, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <span className="font-medium text-gray-700">{tech.property}</span>
                      <span className="text-gray-900">{tech.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Product Image */}
          <Card>
            <CardContent className="p-0">
              <img
                src={product.image || placeholderImage}
                alt={product.name}
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = placeholderImage;
                }}
              />
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Benefits Count</span>
                <Badge variant="default">{product.benefits_count}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>
                <Badge variant={product.published ? 'success' : 'secondary'}>
                  {product.published ? 'Published' : 'Draft'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last Updated</span>
                <span className="text-sm">{formatDate(product.last_edited)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Packaging */}
          {product.packaging && product.packaging.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Packaging</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {product.packaging.map((pkg, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      {pkg}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductViewPage;
