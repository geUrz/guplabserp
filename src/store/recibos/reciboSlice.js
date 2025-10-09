// src/store/reciboSlice.js
import { createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const initialState = {
  recibo: null,
  recibos: [],
  searchResults: [],
  negocioId: null,
  loading: false,
  error: null
}

export const reciboSlice = createSlice({
  name: 'recibo',
  initialState,
  reducers: {
    setRecibo: (state, action) => {
      state.recibo = action.payload
    },
    setRecibosData: (state, action) => {
      const {
        recibos,
        negocioId
      } = action.payload

      state.recibos = recibos || []
      state.negocioId = negocioId ?? null
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
    updateRecibo: (state, action) => {
      const updated = action.payload;
    
      // Actualiza el recibo seleccionado
      if (state.recibo && state.recibo.id === updated.id) {
        state.recibo = { ...state.recibo, ...updated }
      }
    
      // Actualiza la lista de recibos
      state.recibos = state.recibos.map((n) =>
        n.id === updated.id ? { ...n, ...updated } : n
      )
    
      // También actualiza los resultados de búsqueda
      state.searchResults = state.searchResults.map((n) =>
        n.id === updated.id ? { ...n, ...updated } : n
      )
    },
    updateConcepto: (state, action) => {
      const concepto = action.payload
      const nuevosConceptos = state.recibo.conceptos.map((c) =>
        c.id === concepto.id ? { ...concepto } : c
      )
      state.recibo = { ...state.recibo, conceptos: nuevosConceptos }
    },
    updateIVA: (state, action) => {
      const { iva, iva_total } = action.payload
      state.recibo = { ...state.recibo, iva, iva_total }
    }
  }
})

export const {
  setRecibo,
  setRecibosData,
  setSearchResults, 
  clearSearchResults,
  setLoading,
  setError,
  updateRecibo,
  updateConcepto,
  updateIVA
} = reciboSlice.actions

export default reciboSlice.reducer

export const fetchRecibos = (user) => async (dispatch) => {
  try {
    dispatch(setLoading(true))

    const isAdmin = user?.nivel === 'admin'
    const negocio_id = user?.negocio_id

    const url = isAdmin
      ? '/api/recibos/recibos' 
      : `/api/recibos/recibos?negocio_id=${negocio_id}`

    const res = await axios.get(url)
    dispatch(setRecibosData(res.data))
  } catch (error) {
    dispatch(setError(error.response?.data?.error || 'Error al cargar recibos'))
  } finally {
    dispatch(setLoading(false))
  }
} 

/* export const fetchRecibos = (negocio_id) => async (dispatch) => {
  try {
    dispatch(setLoading(true))
    const res = await axios.get(`/api/recibos/recibos?negocio_id=${negocio_id}`)
    dispatch(setRecibos(res.data))
  } catch (error) {
    dispatch(setError(error.response?.data?.error || 'Error al cargar recibos'))
  } finally {
    dispatch(setLoading(false))
  }
} */

export const fetchReciboById = (id) => async (dispatch) => {
  try {
    dispatch(setLoading(true))
    const res = await axios.get(`/api/recibos/recibos?id=${id}`)
    dispatch(setRecibo(res.data))
  } catch (error) {
    dispatch(setError(error.response?.data?.error || 'Error al cargar recibo'))
  } finally {
    dispatch(setLoading(false))
  }
}

export const searchRecibos = (search, user) => async (dispatch) => {
  try {
    const isAdmin = user?.nivel === 'admin'
    const negocio_id = user?.negocio_id

    const res = await axios.get('/api/recibos/recibos', {
      params: {
        search,
        ...(isAdmin ? {} : { negocio_id }),
      },
    });

    dispatch(setSearchResults(res.data))
  } catch (err) {
    console.error(err)
    dispatch(setError('No se encontraron recibos'))
  }
}




