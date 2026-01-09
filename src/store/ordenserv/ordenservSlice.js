import { createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const initialState = {
  ordenservs: [],        
  ordenserv: null,    
  searchResults: [],
  loading: false,
  error: null
}

const ordenservsSlice = createSlice({
  name: 'ordenservs',
  initialState,
  reducers: {
    setOrdenservs: (state, action) => {
      state.ordenservs = action.payload
    },
    setOrdenserv: (state, action) => {
      state.ordenserv = action.payload
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
    updateOrdenserv: (state, action) => {
      const updated = action.payload;
    
      // Actualiza el ordenserv seleccionado
      if (state.ordenserv && state.ordenserv.id === updated.id) {
        state.ordenserv = { ...state.ordenserv, ...updated }
      }
    
      // Actualiza la lista de ordenservs
      state.ordenservs = state.ordenservs.map((n) =>
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
  setOrdenservs,
  setOrdenserv,
  setSearchResults, 
  clearSearchResults,
  setLoading,
  setError,
  updateOrdenserv
} = ordenservsSlice.actions

export default ordenservsSlice.reducer

export const fetchOrdenserv = (user) => async (dispatch) => {
  try {
    dispatch(setLoading(true))

    const isAdmin = user?.nivel === 'admin'
    const negocio_id = user?.negocio_id

    const url = isAdmin
      ? '/api/ordenserv/ordenserv' 
      : `/api/ordenserv/ordenserv?negocio_id=${negocio_id}`

    const res = await axios.get(url)
    dispatch(setOrdenservs(res.data))
  } catch (error) {
    dispatch(setError(error.response?.data?.error || 'Error al cargar ordenservs'))
  } finally {
    dispatch(setLoading(false))
  }
} 

/* export const fetchOrdenserv = (negocio_id) => async (dispatch) => {
  try {
    dispatch(setLoading(true))
    const res = await axios.get(`/api/ordenservs/ordenservs?negocio_id=${negocio_id}`)
    dispatch(setOrdenservs(res.data))
  } catch (error) {
    dispatch(setError(error.response?.data?.error || 'Error al cargar ordenservs'))
  } finally {
    dispatch(setLoading(false))
  }
} */

export const fetchOrdenservById = (id) => async (dispatch) => {
  try {
    dispatch(setLoading(true))
    const res = await axios.get(`/api/ordenserv/ordenserv?id=${id}`)
    dispatch(setOrdenserv(res.data))
  } catch (error) {
    dispatch(setError(error.response?.data?.error || 'Error al cargar ordenserv'))
  } finally {
    dispatch(setLoading(false))
  }
}

export const searchOrdenserv = (search) => async (dispatch) => {
  try {
    const res = await axios.get('/api/ordenserv/ordenserv', {
      params: { search },
    })
    dispatch(setSearchResults(res.data))
  } catch (err) {
    dispatch(setError('No se encontraron ordenservs'))
  }
}



