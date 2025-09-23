import React, { useEffect } from 'react';
import type { Product } from '../../types/product';
import { ApiService } from '../../services/api';
import { X, ExternalLink, Package, Building, Zap, Tag, FileText, Ruler, CheckCircle, AlertCircle } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen?: boolean;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, isOpen, onClose }) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
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
      // Try to parse as JSON array first
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // If not JSON, split by common delimiters
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
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          maxWidth: '80rem',
          maxHeight: '90vh',
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${getBrandColor(product.brand)}, ${getBrandColor(product.brand)}dd)`,
          color: 'white',
          padding: '2rem',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '2.5rem',
              height: '2.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
          >
            <X style={{ width: '1.5rem', height: '1.5rem' }} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '1rem'
            }}>
              <Package style={{ width: '1.5rem', height: '1.5rem' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, lineHeight: '1.2' }}>
                {product.name}
              </h2>
              <p style={{ fontSize: '0.875rem', margin: '0.25rem 0 0 0', opacity: 0.9 }}>
                {product.product_id || product.id}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.375rem 0.75rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              {getBrandName(product.brand)}
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.375rem 0.75rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '9999px',
              fontSize: '0.875rem'
            }}>
              <Building style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
              {formatIndustry(product.industry)}
            </span>
            {product.chemistry && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.375rem 0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '9999px',
                fontSize: '0.875rem'
              }}>
                <Zap style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
                {product.chemistry.replace('_', ' ')}
              </span>
            )}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.375rem 0.75rem',
              backgroundColor: product.published !== false ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              {product.published !== false ? (
                <CheckCircle style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
              ) : (
                <AlertCircle style={{ width: '1rem', height: '1rem', marginRight: '0.25rem' }} />
              )}
              {product.published !== false ? 'Published' : 'Unpublished'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxHeight: 'calc(90vh - 12rem)', overflowY: 'auto', padding: '2rem' }}>
          <div style={{ display: 'grid', gap: '2rem' }}>
            {/* Product Image and Basic Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', alignItems: 'start' }}>
              {/* Image */}
              <div style={{
                backgroundColor: '#f9fafb',
                borderRadius: '0.75rem',
                overflow: 'hidden',
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img
                  src={ApiService.getProductImageUrl(product.image || '')}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-product.svg';
                  }}
                />
              </div>

              {/* Basic Information */}
              <div>
                {product.description && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.75rem', display: 'flex', alignItems: 'center' }}>
                      <FileText style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', color: getBrandColor(product.brand) }} />
                      Description
                    </h3>
                    <p style={{ color: '#4b5563', lineHeight: '1.6', margin: 0 }}>
                      {product.description}
                    </p>
                  </div>
                )}

                {product.url && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '0.75rem 1.5rem',
                        backgroundColor: getBrandColor(product.brand),
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        gap: '0.5rem'
                      }}
                    >
                      <ExternalLink style={{ width: '1rem', height: '1rem' }} />
                      View Product Page
                    </a>
                  </div>
                )}

                {product.benefits_count && (
                  <div style={{
                    backgroundColor: '#f0f9ff',
                    border: '1px solid #0ea5e9',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#0ea5e9' }}>
                      {product.benefits_count}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#0369a1' }}>
                      Total Benefits
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Benefits Section */}
            {benefits.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                  <CheckCircle style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', color: '#16a34a' }} />
                  Key Benefits ({benefits.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.75rem' }}>
                  {benefits.map((benefit, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      padding: '0.75rem',
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '0.5rem'
                    }}>
                      <div style={{
                        width: '0.5rem',
                        height: '0.5rem',
                        backgroundColor: '#16a34a',
                        borderRadius: '50%',
                        marginTop: '0.375rem',
                        marginRight: '0.75rem',
                        flexShrink: 0
                      }} />
                      <span style={{ fontSize: '0.875rem', color: '#15803d', lineHeight: '1.5' }}>
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Applications Section */}
            {applications.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                  <Tag style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', color: '#7c3aed' }} />
                  Applications & Usage ({applications.length})
                </h3>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {applications.map((application, index) => (
                    <div key={index} style={{
                      padding: '1rem',
                      backgroundColor: '#faf5ff',
                      border: '1px solid #e9d5ff',
                      borderRadius: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '1.5rem',
                          height: '1.5rem',
                          backgroundColor: '#7c3aed',
                          color: 'white',
                          borderRadius: '50%',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          marginRight: '0.75rem',
                          flexShrink: 0
                        }}>
                          {index + 1}
                        </span>
                        <span style={{ fontSize: '0.875rem', color: '#6b21a8', lineHeight: '1.5' }}>
                          {application}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Information */}
            {Object.keys(technical).length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                  <Zap style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', color: '#ea580c' }} />
                  Technical Specifications
                </h3>
                <div style={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  overflow: 'hidden'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      {Object.entries(technical).map(([key, value], index) => (
                        <tr key={key} style={{
                          borderBottom: index < Object.entries(technical).length - 1 ? '1px solid #f3f4f6' : 'none'
                        }}>
                          <td style={{
                            padding: '1rem',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            color: '#374151',
                            backgroundColor: '#f9fafb',
                            width: '30%'
                          }}>
                            {key}
                          </td>
                          <td style={{
                            padding: '1rem',
                            fontSize: '0.875rem',
                            color: '#111827'
                          }}>
                            {String(value)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Sizing Information */}
            {product.sizing && (
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                  <Ruler style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', color: '#0ea5e9' }} />
                  Sizing Information
                </h3>
                <div style={{
                  padding: '1.5rem',
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #0ea5e9',
                  borderRadius: '0.75rem'
                }}>
                  <div style={{ fontSize: '0.875rem', color: '#0369a1', lineHeight: '1.6' }}>
                    {typeof product.sizing === 'string' ? product.sizing : JSON.stringify(product.sizing, null, 2)}
                  </div>
                </div>
              </div>
            )}

            {/* Packaging Information */}
            {packaging.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                  <Package style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', color: '#16a34a' }} />
                  Available Packaging
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {packaging.map((pkg, index) => (
                    <span key={index} style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      color: '#15803d',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      {pkg}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};