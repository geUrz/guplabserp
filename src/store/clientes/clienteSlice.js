import { createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const initialState = {
  clientes: [],        
  cliente: null,    
  searchResults: [],
  loading: false,
  error: null
}

const clientesSlice = createSlice({
  name: 'clientes',
  initialState,
  reducers: {
    setClientes: (state, action) => {
      state.clientes = action.payload
    },
    setCliente: (state, action) => {
      state.cliente = action.payload
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
    updateCliente: (state, action) => {
      const updated = action.payload;
    
      // Actualiza el cliente seleccionado
      if (state.cliente && state.cliente.id === updated.id) {
        state.cliente = { ...state.cliente, ...updated }
      }
    
      // Actualiza la lista de clientes
      state.clientes = state.clientes.map((n) =>
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
  setClientes,
  setCliente,
  setSearchResults, 
  clearSearchResults,
  setLoading,
  setError,
  updateCliente
} = clientesSlice.actions

export default clientesSlice.reducer

export const fetchClientes = (negocio_id) => async (dispatch) => {
  try {
    dispatch(setLoading(true))
    const res = await axios.get(`/api/clientes/clientes?negocio_id=${negocio_id}`)
    dispatch(setClientes(res.data))
  } catch (error) {
    dispatch(setError(error.response?.data?.error || 'Error al cargar clientes'))
  } finally {
    dispatch(setLoading(false))
  }
}

export const fetchClienteById = (id) => async (dispatch) => {
  try {
    dispatch(setLoading(true))
    const res = await axios.get(`/api/clientes/clientes?id=${id}`)
    dispatch(setCliente(res.data))
  } catch (error) {
    dispatch(setError(error.response?.data?.error || 'Error al cargar cliente'))
  } finally {
    dispatch(setLoading(false))
  }
}

export const searchClientes = (search) => async (dispatch) => {
  try {
    const res = await axios.get('/api/clientes/clientes', {
      params: { search },
    })
    dispatch(setSearchResults(res.data))
  } catch (err) {
    dispatch(setError('No se encontraron clientes'))
  }
}

/* export const fetchClientes = (user) => async (dispatch) => {
  try {
    dispatch(setLoading(true))

    const isAdmin = user?.nivel === 'admin'
    const negocio_id = user?.negocio_id

    const url = isAdmin
      ? '/api/clientes/clientes' 
      : `/api/clientes/clientes?negocio_id=${negocio_id}`

    const res = await axios.get(url)
    dispatch(setClientes(res.data))
  } catch (error) {
    dispatch(setError(error.response?.data?.error || 'Error al cargar clientes'))
  } finally {
    dispatch(setLoading(false))
  }
} */

