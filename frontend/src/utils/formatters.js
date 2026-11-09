/**
 * OmniMarket AI - Formatting Utilities
 */

export const formatCurrency = (amount, currency = 'BDT') => {
  if (typeof amount !== 'number') return `${amount} ${currency}`;
  return `${amount.toLocaleString()} ${currency}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
