// src/store/reciboSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Estado inicial
const initialState = {
  recibo: null,
  recibos: [],
  conceptos: [],
  searchResults: [],
  negocioId: null,
  loading: false,
  error: null,
}

// Acción para guardar la nota en el backend y en Redux
export const saveReciboNotaAsync = createAsyncThunk(
  'recibo/saveNotaAsync',
  async ({ id, notaValue }, { dispatch }) => {
    try {
      // Realiza la solicitud PUT para actualizar la nota
      const response = await axios.put('/api/recibos/nota', {
        id,
        notaValue,
      })

      // Aquí ya hemos actualizado la base de datos, ahora actualizamos Redux
      dispatch(updateRecibo({ id, nota: notaValue }))

      // Devuelve la respuesta para que podamos manejarla si es necesario
      return response.data;
    } catch (error) {
      throw Error(error.response?.data?.error || 'Error al guardar la nota')
    }
  }
)

export const reciboSlice = createSlice({
  name: 'recibo',
  initialState,
  reducers: {
    // Reducers para actualizar los datos en Redux
    setRecibo: (state, action) => {
      state.recibo = action.payload;
    },
    setRecibos: (state, action) => {
      state.recibos = action.payload;
    },
    setRecibosData: (state, action) => {
      const { recibos, negocioId } = action.payload;
      state.recibos = recibos || [];
      state.negocioId = negocioId ?? null;
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    updateRecibo: (state, action) => {
      const updated = action.payload; // Recibo actualizado, incluyendo todos los campos

      // Verifica si el recibo actual es el mismo que el actualizado
      if (state.recibo?.id === updated.id) {
        // Actualiza el recibo completo (incluye IVA, nota y demás campos)
        state.recibo = {
          ...state.recibo,
          ...updated, // Aquí se actualizan todos los campos del recibo
        };
      }

      // Actualiza la lista de recibos
      state.recibos = state.recibos.map((recibo) =>
        recibo.id === updated.id ? { ...recibo, ...updated } : recibo
      );

      // También actualiza los resultados de búsqueda
      state.searchResults = state.searchResults.map((n) =>
        n.id === updated.id ? { ...n, ...updated } : n
      );
    },
    addConcepto: (state, action) => {
      const concepto = action.payload;
      if (!state.recibo) return;

      // Actualizar el estado del recibo con el nuevo concepto
      state.recibo = {
        ...state.recibo,
        conceptos: [...(state.recibo.conceptos || []), concepto],
      };

      // Recalcular totales
      dispatch(calculateTotales());  // Asegúrate de llamar a un action para recalcular los totales
    },

    updateConcepto: (state, action) => {
      const concepto = action.payload;

      // Actualiza los conceptos dentro del recibo
      const nuevosConceptos = state.recibo.conceptos.map((c) =>
        c.id === concepto.id ? { ...concepto } : c
      );

      // Asegúrate de actualizar el recibo completo, no solo los conceptos
      state.recibo = { ...state.recibo, conceptos: nuevosConceptos };

      // Actualiza también la lista de recibos y resultados de búsqueda
      state.recibos = state.recibos.map((recibo) =>
        recibo.id === state.recibo.id ? { ...recibo, conceptos: nuevosConceptos } : recibo
      );

      state.searchResults = state.searchResults.map((n) =>
        n.id === state.recibo.id ? { ...n, conceptos: nuevosConceptos } : n
      );
    },
    deleteConcepto: (state, action) => {
      const conceptoId = action.payload;
      if (!state.recibo) return;
      state.recibo = {
        ...state.recibo,
        conceptos: state.recibo.conceptos.filter((c) => c.id !== conceptoId),
      }
    },
    updateIVA: (state, action) => {
      const { iva, iva_enabled, iva_total } = action.payload;

      // Verifica si conceptos existe y no es vacío
      const conceptos = state.recibo.conceptos || [];  // Si es undefined, lo convierte en un arreglo vacío
      const subtotal = conceptos.reduce((acc, curr) => acc + curr.precio * curr.cantidad, 0);

      const ivaCalculated = subtotal * (iva / 100);
      const total = subtotal + ivaCalculated;

      // Actualizar el estado del recibo
      state.recibo = { ...state.recibo, iva, iva_enabled, iva_total: ivaCalculated, total };
    },
  updateDiscount: (state, action) => {
      const discount = action.payload;
      if (state.recibo) {
        state.recibo.discount = discount
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(saveReciboNotaAsync.fulfilled, (state, action) => {
        // Acciones adicionales si es necesario, pero el estado ya está actualizado
      })
      .addCase(saveReciboNotaAsync.rejected, (state, action) => {
        // Manejo de error si la acción falla
        state.error = action.error.message;
      })
  },
})

export const {
  setRecibo,
  setRecibos,
  setRecibosData,
  setSearchResults,
  clearSearchResults,
  setLoading,
  setError,
  updateRecibo,
  updateConcepto,
  addConcepto,
  deleteConcepto,
  updateIVA,
  updateDiscount,
} = reciboSlice.actions;

export default reciboSlice.reducer;

// Acciones para obtener datos del backend
export const fetchRecibos = (user) => async (dispatch) => {
  try {
    dispatch(setLoading(true))

    const isAdmin = user?.nivel === 'admin';
    const negocio_id = user?.negocio_id;

    const url = isAdmin
      ? '/api/recibos/recibos'
      : `/api/recibos/recibos?negocio_id=${negocio_id}`;

    const res = await axios.get(url)
    dispatch(setRecibos(res.data))
  } catch (error) {
    dispatch(setError(error.response?.data?.error || 'Error al cargar recibos'))
  } finally {
    dispatch(setLoading(false))
  }
}

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

// Buscar recibos según criterio de búsqueda
export const searchRecibos = (search, user) => async (dispatch) => {
  try {
    const isAdmin = user?.nivel === 'admin';
    const negocio_id = user?.negocio_id;

    const res = await axios.get('/api/recibos/recibos', {
      params: {
        search,
        ...(isAdmin ? {} : { negocio_id }),
      },
    })

    dispatch(setSearchResults(res.data))
  } catch (err) {
    console.error(err)
    dispatch(setError('No se encontraron recibos'))
  }
}

// Agregar un nuevo concepto al recibo
export const addConceptoAsync = (concepto) => async (dispatch) => {
  try {
    dispatch(setLoading(true))
    const res = await axios.post(`/api/recibos/conceptos`, concepto)
    dispatch(addConcepto(res.data)) // agrega al store el concepto recién creado
  } catch (error) {
    dispatch(setError(error.response?.data?.error || 'Error al agregar concepto'))
  } finally {
    dispatch(setLoading(false))
  }
}

// Actualizar un concepto en backend y Redux
export const editConceptoAsync = (concepto) => async (dispatch) => {
  try {
    dispatch(setLoading(true))
    await axios.put(`/api/recibos/conceptos?id=${concepto.id}`, concepto)
    dispatch(updateConcepto(concepto))
  } catch (error) {
    dispatch(setError(error.response?.data?.error || 'Error al editar concepto'))
  } finally {
    dispatch(setLoading(false))
  }
}

// Eliminar un concepto del backend y del store
export const deleteConceptoAsync = (id) => async (dispatch) => {
  try {
    dispatch(setLoading(true))
    await axios.delete(`/api/recibos/conceptos?concepto_id=${id}`)
    dispatch(deleteConcepto(id))
  } catch (error) {
    dispatch(setError(error.response?.data?.error || 'Error al eliminar concepto'))
  } finally {
    dispatch(setLoading(false))
  }
}

export const calculateTotales = () => (dispatch, getState) => {
  const state = getState();  // Acceder al estado de Redux
  const conceptos = state.recibo.recibo?.conceptos || [];  // Obtener los conceptos del recibo
  const iva = state.recibo.ivaValue;  // Obtener el porcentaje de IVA desde Redux

  // Calcular el subtotal sumando la cantidad * precio de cada concepto
  const subtotal = conceptos.reduce((acc, curr) => acc + curr.precio * curr.cantidad, 0);

  // Calcular el IVA
  const ivaCalculated = subtotal * (iva / 100);

  // Calcular el total
  const total = subtotal + ivaCalculated;

  // Despachamos la acción para actualizar IVA y el total
  dispatch(updateIVA({ iva: iva, iva_total: ivaCalculated }));

  // Actualizamos el total en el recibo
  dispatch(updateRecibo({ id: state.recibo.recibo.id, total }));
};
