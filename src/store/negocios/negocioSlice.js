import { createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const initialState = {
  negocio: null,
  negocios: [],
  searchResults: [],
  loading: false,
  error: null
}

export const negocioSlice = createSlice({
  name: 'negocios',
  initialState,
  reducers: {
    setNegocio: (state, action) => {
      state.negocio = action.payload
    },
    setNegocios: (state, action) => {
      state.negocios = action.payload
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
    updateNegocio: (state, action) => {
      const updated = action.payload;
    
      // Actualiza el negocio seleccionado
      if (state.negocio && state.negocio.id === updated.id) {
        state.negocio = { ...state.negocio, ...updated };
      }
    
      // Actualiza la lista de negocios
      state.negocios = state.negocios.map((n) =>
        n.id === updated.id ? { ...n, ...updated } : n
      )
    
      // También actualiza los resultados de búsqueda
      state.searchResults = state.searchResults.map((n) =>
        n.id === updated.id ? { ...n, ...updated } : n
      )
    }        
  }
})

export const { setNegocio, setNegocios, setSearchResults, clearSearchResults, setLoading, setError, updateNegocio } = negocioSlice.actions
export default negocioSlice.reducer

export const fetchNegocios = () => async (dispatch) => {
  try {
    dispatch(setLoading(true))
    const res = await axios.get('/api/negocios/negocios')
    dispatch(setNegocios(res.data))
  } catch (error) {
    dispatch(setError(error.response?.data?.error || 'Error al cargar negocios'))
  } finally {
    dispatch(setLoading(false))
  }
}

export const fetchNegocioById = (id) => async (dispatch) => {
  try {
    dispatch(setLoading(true))
    const res = await axios.get(`/api/negocios/negocios?id=${id}`)
    dispatch(setNegocio(res.data))
  } catch (error) {
    dispatch(setError(error.response?.data?.error || 'Error al cargar negocio'))
  } finally {
    dispatch(setLoading(false))
  }
}

export const searchNegocios = (search) => async (dispatch) => {
  try {
    const res = await axios.get('/api/negocios/negocios', {
      params: { search },
    })
    dispatch(setSearchResults(res.data))
  } catch (err) {
    dispatch(setError('No se encontraron negocios'))
  }
}




