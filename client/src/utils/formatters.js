export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '--';
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD'
  }).format(amount);
};

export const formatPercentage = (value) => {
  if (value === null || value === undefined) return '--';
  return `${Number(value).toFixed(1)}%`;
};

export const formatRating = (value) => {
  if (value === null || value === undefined) return '--';
  return Number(value).toFixed(1);
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
