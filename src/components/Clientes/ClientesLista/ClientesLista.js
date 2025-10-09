import { useEffect, useState } from 'react'
import { ListEmpty, Loading } from '@/components/Layouts'
import { map, size } from 'lodash'
import { FaUsers } from 'react-icons/fa'
import { BasicModal } from '@/layouts'
import { ClienteDetalles } from '../ClienteDetalles'
import { getValueOrDefault } from '@/helpers'
import styles from './ClientesLista.module.css'

export function ClientesLista(props) {

  const { isAdmin, isSuperUser, reload, onReload, clientes, onToastSuccess, onToastSuccessDel } = props

  const [showDetalles, setShowDetalles] = useState(false)
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
  const [showLoading, setShowLoading] = useState(true)

  const onOpenDetalles = (cliente) => {
    setClienteSeleccionado(cliente)
    setShowDetalles(true)
  }

  const onCloseDetalles = () => {
    setClienteSeleccionado(null)
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

      {showLoading ? (
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
        <ClienteDetalles isAdmin={isAdmin} isSuperUser={isSuperUser} reload={reload} onReload={onReload} cliente={clienteSeleccionado} onCloseDetalles={onCloseDetalles} onToastSuccess={onToastSuccess} onToastSuccessDel={onToastSuccessDel} />
      </BasicModal>

    </>

  )
}
