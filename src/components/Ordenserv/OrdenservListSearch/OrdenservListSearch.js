import { map } from 'lodash'
import { Loading } from '@/components/Layouts'
import { FaFileAlt } from 'react-icons/fa'
import { BasicModal } from '@/layouts'
import { useEffect, useState } from 'react'
import { getValueOrDefault } from '@/helpers'
import { OrdenservDetalles } from '../OrdenservDetalles'
import styles from './OrdenservListSearch.module.css'

export function OrdenservListSearch(props) {

  const { reload, onReload, ordservs, onToastSuccess, onToastSuccessDel } = props

  const [showDetalles, setShowDetalles] = useState(false)
  const [reporteSeleccionado, setOrdendeservicioSeleccionado] = useState(null)
  const [showLoading, setShowLoading] = useState(true)

  const onOpenDetalles = (ordserv) => {
    setOrdendeservicioSeleccionado(ordserv)
    setShowDetalles(true)
  }

  const onCloseDetalles = () => {
    setOrdendeservicioSeleccionado(null)
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
          {map(ordservs, (ordserv) => (
            <div key={ordserv.id} className={styles.section} onClick={() => onOpenDetalles(ordserv)}>
              <div>
                <div className={styles.column1}>
                  <FaFileAlt />
                </div>
                <div className={styles.column2}>
                  <div >
                    <h1>Orden de servicio</h1>
                    <h2>{getValueOrDefault(ordserv.ordendeservicio)}</h2>
                  </div>
                  <div >
                    <h1>Cliente</h1>
                    <h2>{getValueOrDefault(ordserv.cliente_nombre)}</h2>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      }

      <BasicModal title='detalles de la orden de servicio' show={showDetalles} onClose={onCloseDetalles}>
        {reporteSeleccionado && (
          <OrdenservDetalles
            reload={reload}
            onReload={onReload}
            ordserv={reporteSeleccionado}
            onCloseDetalles={onCloseDetalles}
            onToastSuccess={onToastSuccess}
            onToastSuccessDel={onToastSuccessDel}
          />
        )}
      </BasicModal>

    </>

  )
}
