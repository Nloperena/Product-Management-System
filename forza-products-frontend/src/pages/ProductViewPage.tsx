import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ApiService } from '../services/api';
import { useProductStore } from '../store/productStore';
import { Accordion, AccordionItem } from '../components/ui/Accordion';
import type { Product } from '../types/product';
import { ArrowLeft, Edit, Package, Building, Zap, FileText, Ruler, CheckCircle, AlertCircle, ExternalLink, Image as ImageIcon, Globe } from 'lucide-react';

export const ProductViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const { setScrollPosition } = useProductStore();

  // Fetch products to find the one we want to view
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: ApiService.getProducts,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (products && id) {
      const foundProduct = products.find(p => p.product_id === id);
      setProduct(foundProduct || null);
    }
  }, [products, id]);

  // Navigation handlers that save scroll position
  const handleBackToDashboard = () => {
    setScrollPosition(0); // Reset scroll position when navigating back
    navigate('/');
  };

  const handleEditProduct = () => {
    if (product) {
      setScrollPosition(0); // Reset scroll position when navigating to edit
      navigate(`/product/${product.product_id}/edit`);
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

  const formatIndustry = (industry: string) => {
    return industry.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forza-blue"></div>
      </div>
    );
  }

  if (error || !product) {
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

  const benefits = formatArrayData(product.benefits);
  const applications = formatArrayData(product.applications);
  const technical = formatTechnicalData(product.technical);
  const packaging = formatArrayData(product.packaging);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
      {/* Decorative backdrop */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-[32rem] w-[32rem] rounded-full bg-blue-400/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-purple-400/20 blur-3xl" />
        <div className="absolute inset-0 mix-blend-overlay opacity-[0.06] [background-image:radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]" />
      </div>

      {/* Page shell */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb + actions */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-600">
            <button
              onClick={handleBackToDashboard}
              className="rounded px-2 py-1 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forza-blue transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1 inline" />
              Dashboard
            </button>
            <span className="text-slate-400">/</span>
            <span className="font-medium text-slate-900 line-clamp-1">{product.name}</span>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEditProduct}
              className="hidden sm:inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit Product
            </button>
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-forza-blue text-white rounded-lg hover:bg-forza-blue-dark transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              View Product Page
            </a>
          </div>
        </div>

        {/* Hero */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-12">
          <section className="xl:col-span-2 space-y-8">
            <div className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-xl rounded-xl">
              <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="relative z-10 p-8">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-start gap-5">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/15 backdrop-blur">
                      <Package className="h-8 w-8" />
                    </div>
                    <div>
                      <h1 className="text-3xl/tight font-bold sm:text-4xl">{product.name}</h1>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-white/90">
                        <span className="inline-flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {getBrandName(product.brand)}
                        </span>
                        <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium border border-white/30 bg-white/10">
                          ID: {product.product_id}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          {product.published ? (
                            <CheckCircle className="h-4 w-4 text-emerald-300" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-300" />
                          )}
                          {product.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col gap-2">
                    <button
                      onClick={handleEditProduct}
                      className="bg-white/15 hover:bg-white/25 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      Edit Product
                    </button>
                    {product.url && (
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/15 hover:bg-white/25 px-4 py-2 rounded-lg transition-colors text-sm font-medium text-center"
                      >
                        View Page
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="backdrop-blur bg-white/70 shadow-lg rounded-xl border border-white/20">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    📝 Description
                  </h2>
                </div>
                <div className="px-6 pb-6">
                  <p className="leading-relaxed text-slate-700">{product.description}</p>
                </div>
              </div>
            )}

            {/* Benefits as animated tiles */}
            {benefits.length > 0 && (
              <div className="backdrop-blur bg-white/70 shadow-lg rounded-xl border border-white/20">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                    ⚡ Key Benefits 
                    <span className="ml-2 text-sm font-normal text-slate-500">({benefits.length} features)</span>
                  </h2>
                </div>
                <div className="px-6 pb-6">
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {benefits.map((benefit, index) => (
                      <li
                        key={index}
                        className="group relative rounded-xl border border-yellow-200/70 bg-gradient-to-br from-yellow-50 to-amber-50 p-4 transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                      >
                        <div className="absolute -right-2 -top-2 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700 ring-1 ring-yellow-200/70">
                          {index + 1}
                        </div>
                        <span className="font-medium text-slate-800 leading-relaxed">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Usage as accordion */}
            {applications.length > 0 && (
              <div className="backdrop-blur bg-white/70 shadow-lg rounded-xl border border-white/20">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                    📄 Usage Instructions 
                    <span className="ml-2 text-sm font-normal text-slate-500">({applications.length} steps)</span>
                  </h2>
                </div>
                <div className="px-6 pb-6">
                  <Accordion type="single">
                    {applications.map((application, index) => (
                      <AccordionItem
                        key={index}
                        title={`Step ${index + 1}`}
                      >
                        <p className="text-slate-700 leading-relaxed">{application}</p>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            )}

            {/* Technical Information */}
            {Object.keys(technical).length > 0 && (
              <div className="backdrop-blur bg-white/70 shadow-lg rounded-xl border border-white/20">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                    🔬 Technical Specifications
                  </h2>
                </div>
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(technical).map(([key, value]) => (
                      <div key={key} className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200/70 hover:shadow-md transition-all duration-200">
                        <dt className="text-sm font-bold text-purple-900 mb-2">
                          {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </dt>
                        <dd className="text-slate-700 font-medium">{String(value)}</dd>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Sidebar */}
          <aside className="space-y-8">
            <div className="overflow-hidden shadow-lg rounded-xl bg-white/70 backdrop-blur border border-white/20">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Product Image</h3>
              </div>
              <div className="px-6 pb-6">
                <figure className="aspect-square overflow-hidden rounded-lg bg-slate-100">
                  <img
                    src={ApiService.getProductImageUrl(product.image || '')}
                    alt={`${product.name} packaging (SKU ${product.product_id})`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-product.svg';
                    }}
                  />
                </figure>
              </div>
            </div>

            <div className="shadow-lg rounded-xl bg-white/70 backdrop-blur border border-white/20">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Product Details</h3>
              </div>
              <div className="px-6 pb-6">
                <dl className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-600">Product ID</dt>
                    <dd className="font-mono text-slate-900">{product.product_id}</dd>
                  </div>
                  <div className="h-px bg-slate-200" />
                  
                  {product.full_name && (
                    <>
                      <div>
                        <dt className="text-slate-600">Full Name</dt>
                        <dd className="mt-1 font-medium text-slate-900">{product.full_name}</dd>
                      </div>
                      <div className="h-px bg-slate-200" />
                    </>
                  )}
                  
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-600">Brand</dt>
                    <dd className="font-medium text-slate-900">{getBrandName(product.brand)}</dd>
                  </div>
                  <div className="h-px bg-slate-200" />
                  
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-600">Industry</dt>
                    <dd className="font-medium text-slate-900">{formatIndustry(product.industry)}</dd>
                  </div>
                  <div className="h-px bg-slate-200" />
                  
                  {product.chemistry && (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <dt className="text-slate-600">Chemistry</dt>
                        <dd className="font-medium text-slate-900">{product.chemistry.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</dd>
                      </div>
                      <div className="h-px bg-slate-200" />
                    </>
                  )}
                  
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-600">Status</dt>
                    <dd>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.published 
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' 
                          : 'bg-orange-100 text-orange-800 hover:bg-orange-100'
                      }`}>
                        {product.published ? 'Published' : 'Draft'}
                      </span>
                    </dd>
                  </div>
                </dl>
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
                      <ImageIcon className="h-4 w-4" />
                      <span className="text-sm font-mono">{product.image}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-gradient-to-tr from-blue-50 to-purple-50 border-blue-200 shadow-lg rounded-xl border">
              <div className="p-6">
                <h4 className="text-sm font-semibold text-slate-900 mb-4">Statistics</h4>
              </div>
              <div className="px-6 pb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border border-blue-100 bg-white p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{benefits.length}</div>
                    <div className="text-xs text-slate-600">Benefits</div>
                  </div>
                  <div className="rounded-lg border border-purple-100 bg-white p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{applications.length}</div>
                    <div className="text-xs text-slate-600">Steps</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  {product.url && (
                    <a 
                      href={product.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-700 hover:underline"
                    >
                      Product Page ↗
                    </a>
                  )}
                  <button 
                    onClick={() => navigator.clipboard.writeText(product.product_id)}
                    className="h-8 px-2 text-sm hover:bg-slate-100 rounded transition-colors"
                  >
                    Copy SKU
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            sku: product.product_id,
            brand: { "@type": "Brand", name: getBrandName(product.brand) },
            category: formatIndustry(product.industry),
            image: [ApiService.getProductImageUrl(product.image || '')],
            description: product.description,
            url: product.url || `${window.location.origin}/product/${product.product_id}`,
          }),
        }}
      />

      {/* Print helpers */}
      <style>{`
        @media print {
          nav, .no-print { display:none !important; }
          .shadow-lg, .shadow-xl { box-shadow: none !important; }
          body { color: #111; }
        }
      `}</style>
    </main>
  );
};
