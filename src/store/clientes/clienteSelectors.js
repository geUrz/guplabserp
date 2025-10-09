// src/store/clientes/clienteSelectors.js
import { createSelector } from '@reduxjs/toolkit'

// Selecciona la lista completa
export const selectClientes = (state) => state.clientes.clientes

// Selecciona un cliente individual
export const selectCliente = (state) => state.clientes.cliente
export const selectSearchResults = (state) => state.clientes.searchResults

// Opcional: estados útiles
export const selectClientesLoading = (state) => state.clientes.loading
export const selectClientesError = (state) => state.clientes.error

// Ejemplo: derivar solo los clientes activos
export const selectClientesActivos = createSelector(
  [selectClientes],
  (clientes) => clientes.filter(cliente => cliente.activo)
)
