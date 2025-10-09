// Básicos
export const selectRecibo = (state) => state.recibo.recibo
export const selectRecibos = (state) => state.recibo.recibos
export const selectSearchResults = (state) => state.recibo.searchResults
export const selectReciboLoading = (state) => state.recibo.loading
export const selectReciboError = (state) => state.recibo.error

// Conceptos / Abonos / Anticipos
export const selectConceptos = (state) => state.recibo.recibo?.conceptos || []

// IVA
export const selectIVA = (state) => state.recibo.recibo?.iva ?? 0
export const selectIVATotal = (state) => state.recibo.recibo?.iva_total ?? 0

export const selectNegocioId = (state) => state.recibo.NegocioId


