export const formatBrandName = (brand: string): string => {
  return brand
    .replace('forza_', '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const formatIndustryName = (industry: string): string => {
  return industry
    .replace(/_industry/g, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const getImageUrl = (imagePath?: string): string => {
  if (!imagePath) return '/placeholder-product.svg';
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  if (imagePath.startsWith('/')) {
    return imagePath;
  }
  
  return `/product-images/${imagePath}`;
};

export const getBrandColor = (brand: string): string => {
  const colors = {
    forza_bond: 'bg-blue-500',
    forza_seal: 'bg-green-500',
    forza_tape: 'bg-purple-500',
  };
  
  return colors[brand as keyof typeof colors] || 'bg-gray-500';
};

export const getBrandTextColor = (brand: string): string => {
  const colors = {
    forza_bond: 'text-blue-600',
    forza_seal: 'text-green-600',
    forza_tape: 'text-purple-600',
  };
  
  return colors[brand as keyof typeof colors] || 'text-gray-600';
};
