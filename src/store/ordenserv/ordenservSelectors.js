// Selecciona la lista completa
export const selectOrdenServs = (state) => state.ordenservs.ordenservs

// Selecciona un cliente individual
export const selectOrdenServ = (state) => state.ordenservs.ordenserv
export const selectSearchResults = (state) => state.ordenservs.searchResults

// Opcional: estados útiles
export const selectOrdenServLoading = (state) => state.ordenservs.loading
export const selectOrdenServError = (state) => state.ordenservs.error
