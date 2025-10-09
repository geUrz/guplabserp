export const formatCurrency = (value) => {
  const numericValue = Number(value) || 0;
  return numericValue.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
};
