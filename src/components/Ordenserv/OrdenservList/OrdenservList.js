import { ListEmpty, Loading } from '@/components/Layouts'
import { map, size } from 'lodash'
import { FaFileAlt } from 'react-icons/fa'
import { BasicModal } from '@/layouts'
import { OrdenservDetalles } from '../OrdenservDetalles'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getValueOrDefault } from '@/helpers'
import 'react-datepicker/dist/react-datepicker.css'
import styles from './OrdenservList.module.css'
import { useDispatch, useSelector } from 'react-redux'
import { selectOrdenServLoading, selectOrdenServs } from '@/store/ordenserv/ordenservSelectors'
import { setOrdenserv } from '@/store/ordenserv/ordenservSlice'

export function OrdenservList(props) {

  const { user, reload, onReload, ordservs, onToastSuccess, onToastSuccessDel } = props

  const [showDetalles, setShowDetalles] = useState(false)

  const dispatch = useDispatch()
  const ordenservs = useSelector(selectOrdenServs)
  const loading = useSelector(selectOrdenServLoading)
  console.log(ordenservs);
  
  const onOpenDetalles = (recibo) => {
    dispatch(setOrdenserv(recibo))
    setShowDetalles(true)
  }

  const onCloseDetalles = () => {
    dispatch(setOrdenserv(null))
    setShowDetalles(false)
  }

  return (

    <>

      {loading ? (
        <Loading size={45} loading={1} />
      ) : (
        size(ordenservs) === 0 ? (
          <ListEmpty />
        ) : (
          <div className={styles.main}>
            {map(ordenservs, (ordenserv) => (
              <div key={ordenserv.id} className={styles.section} onClick={() => onOpenDetalles(ordenserv)}>
                <div>
                  <div className={styles.column1}>
                    <FaFileAlt />
                  </div>
                  <div className={styles.column2}>
                    <div >
                      <h1>Orden de servicio</h1>
                      <h2>{getValueOrDefault(ordenserv.ordenserv)}</h2>
                    </div>
                    <div >
                      <h1>Cliente</h1>
                      <h2>{getValueOrDefault(ordenserv.cliente_nombre)}</h2>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      <BasicModal title='detalles de la orden de servicio' show={showDetalles} onClose={onCloseDetalles}>
        <OrdenservDetalles
          user={user}
          reload={reload}
          onReload={onReload}
          onCloseDetalles={onCloseDetalles}
          onToastSuccess={onToastSuccess}
          onToastSuccessDel={onToastSuccessDel}
        />
      </BasicModal>

    </>

  )
}
