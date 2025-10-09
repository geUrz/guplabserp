export function getValueOrWhite(value, defaultValue = '') {
  return (value !== undefined && value !== null && value !== '') ? value : defaultValue;
}
