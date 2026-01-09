import { map } from 'lodash'
import { Loading } from '@/components/Layouts'
import { FaUsers } from 'react-icons/fa'
import { BasicModal } from '@/layouts'
import { useEffect, useState } from 'react'
import { getValueOrDefault } from '@/helpers'
import { ClienteDetalles } from '../ClienteDetalles'
import styles from './ClientesListSearch.module.css'
import { useDispatch } from 'react-redux'
import { setCliente } from '@/store/clientes/clienteSlice'

export function ClientesListSearch(props) {

  const { isAdmin, isSuperUser, reload, onReload, clientes, onToastSuccess, onToastSuccessDel } = props

  const dispatch = useDispatch()

  const [showDetalles, setShowDetalles] = useState(false)
  const [clientesSeleccionado, setClienteSeleccionado] = useState(null)
  const [showLoading, setShowLoading] = useState(true)
  
    const onOpenDetalles = (cliente) => {
      dispatch(setCliente(cliente))
      setShowDetalles(true)
    }
  
    const onCloseDetalles = () => {
      dispatch(setCliente(null))
      setShowDetalles(false)
    }

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  return (

    <>

      {showLoading ?
        <Loading size={45} loading={1} /> :
        <div className={styles.main}>
          {map(clientes, (cliente) => (
            <div key={cliente.id} className={styles.section} onClick={() => onOpenDetalles(cliente)}>
              <div>
                <div className={styles.column1}>
                  <FaUsers />
                </div>
                <div className={styles.column2}>
                  <div >
                    <h1>Cliente</h1>
                    <h2>{getValueOrDefault(cliente.nombre)}</h2>
                  </div>
                  <div >
                    <h1>Contacto</h1>
                    <h2>{getValueOrDefault(cliente.contacto)}</h2>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      }

      <BasicModal title='detalles del cliente' show={showDetalles} onClose={onCloseDetalles}>
        {clientesSeleccionado && (
          <ClienteDetalles
            isAdmin={isAdmin} 
            isSuperUser={isSuperUser}
            reload={reload}
            onReload={onReload}
            cliente={clientesSeleccionado}
            onCloseDetalles={onCloseDetalles}
            onToastSuccess={onToastSuccess}
            onToastSuccessDel={onToastSuccessDel}
          />
        )}
      </BasicModal>

    </>

  )
}
