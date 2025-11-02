import styles from './ClientesLista.module.css'
import { useState } from 'react'
import { ListEmpty, Loading } from '@/components/Layouts'
import { map, size } from 'lodash'
import { FaUsers } from 'react-icons/fa'
import { BasicModal } from '@/layouts'
import { ClienteDetalles } from '../ClienteDetalles'
import { getValueOrDefault } from '@/helpers'
import { useDispatch, useSelector } from 'react-redux'
import { selectClientes, selectClientesLoading } from '@/store/clientes/clienteSelectors'
import { setCliente } from '@/store/clientes/clienteSlice'

export function ClientesLista(props) {

  const { isAdmin, isSuperUser, reload, onReload, onToastSuccess, onToastSuccessDel } = props

  const dispatch = useDispatch()
  const clientes = useSelector(selectClientes)
  const loading = useSelector(selectClientesLoading)

  const [showDetalles, setShowDetalles] = useState(false)

  const onOpenDetalles = (cliente) => {
    dispatch(setCliente(cliente))
    setShowDetalles(true)
  }

  const onCloseDetalles = () => {
    dispatch(setCliente(null))
    setShowDetalles(false)
  }

  return (

    <>

      {loading ? (
        <Loading size={45} loading={1} />
      ) : (
        size(clientes) === 0 ? (
          <ListEmpty />
        ) : (
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
        )
      )}

      <BasicModal title='detalles del cliente' show={showDetalles} onClose={onCloseDetalles}>
        <ClienteDetalles isAdmin={isAdmin} isSuperUser={isSuperUser} reload={reload} onReload={onReload} onCloseDetalles={onCloseDetalles} onToastSuccess={onToastSuccess} onToastSuccessDel={onToastSuccessDel} />
      </BasicModal>

    </>

  )
}
