import type { Product } from '../types/product';
import { ApiService } from '../services/api';

// Helper function to convert image to base64
const imageToBase64 = async (imageUrl: string): Promise<string> => {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.warn('⚠️ Image fetch failed:', imageUrl);
      return '';
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('⚠️ Image conversion failed:', imageUrl, error);
    return '';
  }
};

export const exportToCSV = async (products: Product[], filename: string = 'forza-products-export.csv') => {
  console.log('📄 CSV Export: Starting export of', products.length, 'products');

  // Define the headers for the CSV
  const headers = [
    'Product Name',
    'Category', 
    'Industry',
    'Chemistry',
    'Applications',
    'Benefits',
    'Technical Information',
    'Sizing',
    'Description',
    'Product Image (Base64)'
  ];

  // Process products with images
  console.log('🖼️ Processing images for', products.length, 'products...');
  const csvRows = await Promise.all(products.map(async (product, index) => {
    // Helper function to format technical data as readable key-value pairs
    const formatTechnicalData = (technical: any): string => {
      if (!technical) return '';
      if (typeof technical === 'string') return technical;
      
      // Handle array of technical property objects
      if (Array.isArray(technical)) {
        const pairs = technical.map(item => {
          if (typeof item === 'object' && item !== null) {
            // Handle TechnicalProperty objects with property, value, unit
            if (item.property && item.value) {
              const unit = item.unit ? ` ${item.unit}` : '';
              return `${item.property}: ${item.value}${unit}`;
            }
            // Handle generic objects
            return Object.entries(item).map(([key, value]) => {
              const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              return `${formattedKey}: ${value}`;
            }).join('; ');
          }
          return String(item);
        });
        return pairs.join('; ');
      }
      
      // Handle single object
      if (typeof technical === 'object' && technical !== null) {
        const pairs = Object.entries(technical).map(([key, value]) => {
          const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          return `${formattedKey}: ${value}`;
        });
        return pairs.join('; ');
      }
      
      return String(technical);
    };

    // Helper function to format sizing data as readable key-value pairs
    const formatSizingData = (sizing: any): string => {
      if (!sizing) return '';
      if (typeof sizing === 'string') return sizing;
      if (typeof sizing === 'object' && !Array.isArray(sizing)) {
        // Convert object to readable key-value pairs
        const pairs = Object.entries(sizing).map(([key, value]) => {
          const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          return `${formattedKey}: ${value}`;
        });
        return pairs.join('; ');
      }
      return String(sizing);
    };

    // Helper function to format benefits and applications consistently
    const formatListData = (data: any): string => {
      if (!data) return '';
      if (typeof data === 'string') {
        // Split by common delimiters and clean up
        return data.split(/[,\n;]/).map(item => item.trim()).filter(item => item.length > 0).join('; ');
      }
      if (Array.isArray(data)) {
        return data.filter(item => item && item.trim().length > 0).join('; ');
      }
      return String(data);
    };

    // Helper function to safely stringify arrays or objects
    const stringify = (value: any): string => {
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
      if (Array.isArray(value)) return `"${value.join('; ').replace(/"/g, '""')}"`;
      if (typeof value === 'object') {
        try {
          // Check if it's already a formatted string from our formatting functions
          if (typeof value === 'string') {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        } catch {
          return `"${String(value).replace(/"/g, '""')}"`;
        }
      }
      return `"${String(value).replace(/"/g, '""')}"`;
    };

    // Helper function to get brand display name
    const getBrandDisplayName = (brand: string) => {
      switch (brand) {
        case 'forza_bond': return 'ForzaBOND®';
        case 'forza_seal': return 'ForzaSEAL®';
        case 'forza_tape': return 'ForzaTAPE®';
        default: return brand;
      }
    };

    // Process image
    let imageBase64 = '';
    if (product.image) {
      const imageUrl = ApiService.getProductImageUrl(product.image);
      console.log(`🖼️ Processing image ${index + 1}/${products.length}: ${imageUrl}`);
      imageBase64 = await imageToBase64(imageUrl);
      if (imageBase64) {
        console.log(`✅ Image ${index + 1} converted successfully`);
      } else {
        console.warn(`⚠️ Image ${index + 1} conversion failed`);
      }
    }

    // Debug technical data
    if (product.technical) {
      console.log(`🔧 Technical data for ${product.name}:`, {
        type: typeof product.technical,
        isArray: Array.isArray(product.technical),
        value: product.technical
      });
    }

    return [
      stringify(product.name || ''),
      stringify(getBrandDisplayName(product.brand || '')),
      stringify((product.industry || '').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())),
      stringify(product.chemistry || ''),
      stringify(formatListData(product.applications)),
      stringify(formatListData(product.benefits)),
      stringify(formatTechnicalData(product.technical)),
      stringify(formatSizingData(product.sizing)),
      stringify(product.description || ''),
      stringify(imageBase64)
    ].join(',');
  }));

  // Combine headers and data
  const csvContent = [headers.join(','), ...csvRows].join('\n');

  // Create and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('✅ CSV Export: Successfully exported', products.length, 'products to', filename);
  } else {
    console.error('❌ CSV Export: Browser does not support file download');
  }
};

export const generateExportFilename = (filters: any, totalCount: number): string => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
  let filterDescription = '';
  
  const activeFilters = [];
  if (filters.brand) activeFilters.push(filters.brand);
  if (filters.industry) activeFilters.push(filters.industry.replace('_', '-'));
  if (filters.chemistry) activeFilters.push(filters.chemistry.replace('_', '-'));
  if (filters.published !== 'all') activeFilters.push(filters.published);
  
  if (activeFilters.length > 0) {
    filterDescription = '-' + activeFilters.join('-');
  }
  
  return `forza-products${filterDescription}-${totalCount}items-${timestamp}.csv`;
};
