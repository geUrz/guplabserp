import { configureStore } from '@reduxjs/toolkit'
import usuarioReducer from './usuarios/usuarioSlice'
import reciboReducer from './recibos/reciboSlice'
import clientesReducer from './clientes/clienteSlice'
import negocioReducer from './negocios/negocioSlice'

export const store = configureStore({
  reducer: {
    usuarios: usuarioReducer,
    recibo: reciboReducer,
    clientes: clientesReducer,
    negocios: negocioReducer
  },
})
