import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import { useProductStore } from '../store/productStore';
import type { Product } from '../types/product';
import { ArrowLeft, Save, Trash2, Plus, Package, Building, Zap, Tag, FileText, AlertTriangle, ExternalLink } from 'lucide-react';

interface ProductEditPageProps {
  isNew?: boolean;
}

export const ProductEditPage: React.FC<ProductEditPageProps> = ({ isNew = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setScrollPosition } = useProductStore();

  const [formData, setFormData] = useState<Product>({
    product_id: '',
    name: '',
    full_name: '',
    description: '',
    brand: 'forza_bond',
    industry: '',
    chemistry: '',
    url: '',
    image: '',
    benefits: [],
    applications: [],
    technical: {},
    sizing: {},
    packaging: [],
    published: true,
    benefits_count: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch products to find the one we want to edit
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: ApiService.getProducts,
    staleTime: 5 * 60 * 1000,
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async (product: Product) => {
      await ApiService.updateProduct(product.product_id, product);
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setScrollPosition(0);
      navigate(`/product/${formData.product_id}`);
    },
    onError: (error) => {
      console.error('Failed to update product:', error);
    },
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (product: Product) => {
      await ApiService.createProduct(product);
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setScrollPosition(0);
      navigate(`/product/${formData.product_id}`);
    },
    onError: (error) => {
      console.error('Failed to create product:', error);
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      await ApiService.deleteProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setScrollPosition(0);
      navigate('/');
    },
    onError: (error) => {
      console.error('Failed to delete product:', error);
    },
  });

  // Navigation handlers that save scroll position
  const handleBackToDashboard = () => {
    setScrollPosition(0); // Reset scroll position when navigating back
    navigate('/');
  };

  const handleBackToProduct = () => {
    setScrollPosition(0); // Reset scroll position when navigating to product view
    navigate(`/product/${formData.product_id}`);
  };

  useEffect(() => {
    if (products && id && !isNew) {
      const foundProduct = products.find(p => p.product_id === id);
      if (foundProduct) {
        setFormData({
          product_id: foundProduct.product_id || '',
          name: foundProduct.name || '',
          full_name: foundProduct.full_name || '',
          description: foundProduct.description || '',
          brand: foundProduct.brand || 'forza_bond',
          industry: foundProduct.industry || '',
          chemistry: foundProduct.chemistry || '',
          url: foundProduct.url || '',
          image: foundProduct.image || '',
          benefits: Array.isArray(foundProduct.benefits) ? foundProduct.benefits : [],
          applications: Array.isArray(foundProduct.applications) ? foundProduct.applications : [],
          technical: foundProduct.technical || {},
          sizing: foundProduct.sizing || {},
          packaging: Array.isArray(foundProduct.packaging) ? foundProduct.packaging : [],
          published: foundProduct.published !== undefined ? foundProduct.published : true,
          benefits_count: foundProduct.benefits_count || 0
        });
      }
    }
  }, [products, id, isNew]);

  const handleInputChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleArrayChange = (field: 'benefits' | 'applications' | 'packaging', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'benefits' | 'applications' | 'packaging') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), '']
    }));
  };

  const removeArrayItem = (field: 'benefits' | 'applications' | 'packaging', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.product_id.trim()) {
      newErrors.product_id = 'Product ID is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.brand) {
      newErrors.brand = 'Brand is required';
    }
    if (!formData.industry.trim()) {
      newErrors.industry = 'Industry is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const updatedProduct = {
        ...formData,
        benefits_count: formData.benefits.length
      };

      if (isNew) {
        await createProductMutation.mutateAsync(updatedProduct);
      } else {
        await updateProductMutation.mutateAsync(updatedProduct);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setErrors({ general: 'Failed to save product. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!formData.product_id) return;

    setIsDeleting(true);
    try {
      await deleteProductMutation.mutateAsync(formData.product_id);
    } catch (error) {
      console.error('Error deleting product:', error);
      setErrors({ general: 'Failed to delete product. Please try again.' });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forza-blue"></div>
      </div>
    );
  }

  if (error || (!isNew && !products?.find(p => p.product_id === id))) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Product not found</h3>
          <p className="mt-1 text-sm text-gray-500">
            The product you're looking for doesn't exist.
          </p>
          <button
            onClick={handleBackToDashboard}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-forza-blue hover:bg-forza-blue-dark"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <button
              onClick={handleBackToDashboard}
              className="text-gray-500 hover:text-gray-700 flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Dashboard
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">
              {isNew ? 'New Product' : formData.name || 'Edit Product'}
            </span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div 
          className="rounded-xl p-8 text-white mb-8 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${getBrandColor(formData.brand)}, ${getBrandColor(formData.brand)}dd)` }}
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Package className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {isNew ? 'Create New Product' : 'Edit Product'}
                  </h1>
                  <p className="text-white text-opacity-90">
                    {isNew ? 'Add a new product to the catalog' : `Editing ${formData.name || 'Product'}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Error Message */}
          {errors.general && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-lg flex items-center space-x-3 text-red-700 shadow-sm">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{errors.general}</span>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  Basic Information
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Product ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.product_id}
                      onChange={(e) => handleInputChange('product_id', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-forza-blue focus:border-transparent transition-all duration-200 ${
                        errors.product_id ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="e.g., 81-0389"
                    />
                    {errors.product_id && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        {errors.product_id}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-forza-blue focus:border-transparent transition-all duration-200 ${
                        errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="e.g., HIGH PERFORMANCE NEOPRENE CONTACT ADHESIVE"
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forza-blue focus:border-transparent transition-all duration-200 hover:border-gray-400"
                      placeholder="Complete product name with brand"
                    />
                    <p className="mt-1 text-xs text-gray-500">Include the complete product name with brand</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forza-blue focus:border-transparent transition-all duration-200 hover:border-gray-400 resize-none"
                      placeholder="Describe the product, its key features, and benefits..."
                    />
                    <p className="mt-1 text-xs text-gray-500">Provide a detailed description of the product</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <Building className="h-5 w-5 text-green-600" />
                  </div>
                  Classification
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Brand <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-forza-blue focus:border-transparent transition-all duration-200 ${
                        errors.brand ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <option value="forza_bond">ForzaBOND®</option>
                      <option value="forza_seal">ForzaSEAL®</option>
                      <option value="forza_tape">ForzaTAPE®</option>
                    </select>
                    {errors.brand && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        {errors.brand}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Industry <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-forza-blue focus:border-transparent transition-all duration-200 ${
                        errors.industry ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      placeholder="e.g., industrial_industry"
                    />
                    {errors.industry && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        {errors.industry}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">Specify the target industry for this product</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Chemistry
                    </label>
                    <input
                      type="text"
                      value={formData.chemistry || ''}
                      onChange={(e) => handleInputChange('chemistry', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forza-blue focus:border-transparent transition-all duration-200 hover:border-gray-400"
                      placeholder="e.g., Neoprene Contact Adhesive"
                    />
                    <p className="mt-1 text-xs text-gray-500">Chemical composition or adhesive type</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Links & Status */}
            <div className="space-y-8">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <ExternalLink className="h-5 w-5 text-purple-600" />
                  </div>
                  Links & Media
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Product URL
                    </label>
                    <input
                      type="url"
                      value={formData.url || ''}
                      onChange={(e) => handleInputChange('url', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forza-blue focus:border-transparent transition-all duration-200 hover:border-gray-400"
                      placeholder="https://forzabuilt.com/product/..."
                    />
                    <p className="mt-1 text-xs text-gray-500">Link to the product page on your website</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Image Path
                    </label>
                    <input
                      type="text"
                      value={formData.image || ''}
                      onChange={(e) => handleInputChange('image', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forza-blue focus:border-transparent transition-all duration-200 hover:border-gray-400"
                      placeholder="/product-images/product-id.png"
                    />
                    <p className="mt-1 text-xs text-gray-500">Path to the product image file</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg mr-3">
                    <Tag className="h-5 w-5 text-orange-600" />
                  </div>
                  Status & Settings
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="published"
                      checked={formData.published}
                      onChange={(e) => handleInputChange('published', e.target.checked)}
                      className="mt-1 h-5 w-5 text-forza-blue focus:ring-forza-blue border-gray-300 rounded"
                    />
                    <div>
                      <label htmlFor="published" className="text-sm font-semibold text-gray-700">
                        Published
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Make this product visible to customers</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="p-1 bg-blue-100 rounded mr-2">
                        <Package className="h-4 w-4 text-blue-600" />
                      </div>
                      Product Statistics
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg border border-blue-100">
                        <div className="text-2xl font-bold text-blue-600">{formData.benefits.length}</div>
                        <div className="text-xs text-gray-600">Benefits</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-blue-100">
                        <div className="text-2xl font-bold text-purple-600">{formData.applications.length}</div>
                        <div className="text-xs text-gray-600">Applications</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                <Zap className="h-5 w-5 text-yellow-600" />
              </div>
              Benefits
              <span className="ml-2 text-sm font-normal text-gray-500">({formData.benefits.length})</span>
            </h3>
            
            <div className="space-y-4">
              {formData.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => handleArrayChange('benefits', index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forza-blue focus:border-transparent transition-all duration-200 bg-white"
                    placeholder={`Benefit ${index + 1} - What makes this product special?`}
                  />
                  <button
                    onClick={() => removeArrayItem('benefits', index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    title="Remove benefit"
                  >
                    <Plus className="h-4 w-4 rotate-45" />
                  </button>
                </div>
              ))}
              
              <button
                onClick={() => addArrayItem('benefits')}
                className="flex items-center space-x-3 w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-forza-blue hover:text-forza-blue transition-all duration-200 hover:bg-blue-50"
              >
                <div className="p-1 bg-gray-100 rounded">
                  <Plus className="h-4 w-4" />
                </div>
                <span className="font-medium">Add New Benefit</span>
              </button>
            </div>
          </div>

          {/* Applications Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              Applications
              <span className="ml-2 text-sm font-normal text-gray-500">({formData.applications.length})</span>
            </h3>
            
            <div className="space-y-4">
              {formData.applications.map((application, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={application}
                    onChange={(e) => handleArrayChange('applications', index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-forza-blue focus:border-transparent transition-all duration-200 bg-white"
                    placeholder={`Application ${index + 1} - Where can this product be used?`}
                  />
                  <button
                    onClick={() => removeArrayItem('applications', index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    title="Remove application"
                  >
                    <Plus className="h-4 w-4 rotate-45" />
                  </button>
                </div>
              ))}
              
              <button
                onClick={() => addArrayItem('applications')}
                className="flex items-center space-x-3 w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-forza-blue hover:text-forza-blue transition-all duration-200 hover:bg-blue-50"
              >
                <div className="p-1 bg-gray-100 rounded">
                  <Plus className="h-4 w-4" />
                </div>
                <span className="font-medium">Add New Application</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
          <div className="flex items-center space-x-4">
            {!isNew && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300"
                disabled={isSaving || isDeleting}
              >
                <Trash2 className="h-4 w-4" />
                <span className="font-medium">Delete Product</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleBackToDashboard}
              className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-300 hover:border-gray-400 font-medium"
              disabled={isSaving || isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || isDeleting}
              className="flex items-center space-x-2 px-6 py-2 bg-forza-blue text-white rounded-lg hover:bg-forza-blue-dark transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl font-medium"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>{isNew ? 'Create Product' : 'Save Changes'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-200">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Product</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-gray-700">
                  Are you sure you want to delete <strong className="text-gray-900">{formData.name}</strong>?
                </p>
                <p className="text-sm text-red-600 mt-1">
                  This will permanently remove the product from your catalog.
                </p>
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-300 hover:border-gray-400 font-medium"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center space-x-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 disabled:opacity-50 font-medium shadow-lg hover:shadow-xl"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Product</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
