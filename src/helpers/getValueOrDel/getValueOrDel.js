export function getValueOrDel(value, isDeleted, defaultValue = '<vacío>') {
  if (!value) return defaultValue;
  return isDeleted ? `${value} (eliminado)` : value;
}
