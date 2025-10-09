import { createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const initialState = {
  usuario: null,       
  usuarios: [],  
  searchResults: [],      
  loading: false,
  error: null
}

const usuarioSlice = createSlice({
  name: 'usuarios',
  initialState,
  reducers: {
    setUsuarios: (state, action) => {
      state.usuarios = action.payload
    },
    setUsuario: (state, action) => {
      state.usuario = action.payload
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    updateUsuario: (state, action) => {
      const updated = action.payload;
    
      // Actualiza el usuario seleccionado
      if (state.usuario && state.usuario.id === updated.id) {
        state.usuario = { ...state.usuario, ...updated };
      }
    
      // Actualiza la lista de usuarios
      state.usuarios = state.usuarios.map((n) =>
        n.id === updated.id ? { ...n, ...updated } : n
      )
    
      // También actualiza los resultados de búsqueda
      state.searchResults = state.searchResults.map((n) =>
        n.id === updated.id ? { ...n, ...updated } : n
      )
    } 
    
  }
})

export const {
  setUsuarios,
  setUsuario,
  setSearchResults, 
  clearSearchResults,
  setLoading,
  setError,
  updateUsuario
} = usuarioSlice.actions

export default usuarioSlice.reducer

export const fetchUsuarios = (user) => async (dispatch) => {
  try {
    dispatch(setLoading(true))

    const isAdmin = user?.nivel === 'admin'
    const negocio_id = user?.negocio_id

    const url = isAdmin
      ? '/api/usuarios/usuarios' 
      : `/api/usuarios/usuarios?negocio_id=${negocio_id}`

    const res = await axios.get(url)
    dispatch(setUsuarios(res.data))
  } catch (error) {
    dispatch(setError(error.response?.data?.error || 'Error al cargar usuarios'))
  } finally {
    dispatch(setLoading(false))
  }
} 

/* export const fetchUsuarios = (negocio_id) => async (dispatch) => {
  try {
    dispatch(setLoading(true))
    const res = await axios.get(`/api/usuarios/usuarios?negocio_id=${negocio_id}`)
    dispatch(setUsuarios(res.data))
  } catch (error) {
    dispatch(setError(error.response?.data?.error || 'Error al cargar usuarios'))
  } finally {
    dispatch(setLoading(false))
  }
}  */

export const fetchUsuarioById = (id) => async (dispatch) => {
  try {
    dispatch(setLoading(true))
    const res = await axios.get(`/api/usuarios/usuarios?id=${id}`)
    dispatch(setUsuario(res.data))
  } catch (error) {
    dispatch(setError(error.response?.data?.error || 'Error al cargar usuario'))
  } finally {
    dispatch(setLoading(false))
  }
}

export const searchUsuarios = (search, user) => async (dispatch) => {
  try {
    const isAdmin = user?.nivel === 'admin'
    const negocio_id = user?.negocio_id

    const res = await axios.get('/api/usuarios/usuarios', {
      params: {
        search,
        ...(isAdmin ? {} : { negocio_id }),
      },
    });

    dispatch(setSearchResults(res.data))
  } catch (err) {
    console.error(err)
    dispatch(setError('No se encontraron usuarios'))
  }
}



