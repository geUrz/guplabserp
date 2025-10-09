export function formatTipo(tipo) {
  return tipo === '.' ? '' : tipo;
}

export function formatPrice(value) {
  // Si es null, NaN o 0, mostramos vacío
  if (value == null || isNaN(value) || value === 0) {
    return '';  
  }

  // Usamos toLocaleString para formatear el número con comas y aseguramos los dos decimales
  return `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatQuantity(value) {
  // Si cantidad es null o 0, mostramos vacío
  if (value == null || isNaN(value) || value === 0) {
    return '';  
  }
  return Number(value); // Devolvemos número sin formato de moneda
}

export function formatTotal(price, quantity) {
  // Si alguno es null o 0, mostramos vacío
  if (price == null || quantity == null || price === 0 || quantity === 0) {
    return '';
  }

  const total = Number(price) * Number(quantity);

  // Usamos toLocaleString para formatear el total con comas y dos decimales
  return total ? `$${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '';
}

export const formatCurrencyInput = (value) => {
  const number = Number(value) || '$';
  return number.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  });
}

export const parseCurrencyInput = (input) => {
  const cleaned = input.replace(/\D/g, "");
  if (cleaned === "") return 0;
  return parseInt(cleaned, 10);
}
