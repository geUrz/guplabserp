// src/store/usuarios/clienteSelectors.js
import { createSelector } from '@reduxjs/toolkit'

// Selecciona la lista completa
export const selectUsuarios = (state) => state.usuarios.usuarios

// Selecciona un usuario individual
export const selectUsuario = (state) => state.usuarios.usuario
export const selectSearchResults = (state) => state.usuarios.searchResults

// Opcional: estados útiles
export const selectUsuariosLoading = (state) => state.usuarios.loading
export const selectUsuariosError = (state) => state.usuarios.error

// Ejemplo: derivar solo los usuarios activos
export const selectUsuariosActivos = createSelector(
  [selectUsuarios],
  (usuarios) => usuarios.filter(usuario => usuario.activo)
)
