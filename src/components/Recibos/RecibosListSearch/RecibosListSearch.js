import styles from './RecibosListSearch.module.css'
import { map, size } from 'lodash'
import { ListEmpty, Loading } from '@/components/Layouts'
import { FaFileInvoice } from 'react-icons/fa'
import { BasicModal } from '@/layouts'
import { useEffect, useState } from 'react'
import { ReciboDetalles } from '../ReciboDetalles'
import { getValueOrDefault } from '@/helpers'
import { useDispatch, useSelector } from 'react-redux'
import { selectReciboLoading, selectSearchResults } from '@/store/recibos/reciboSelectors'
import { clearSearchResults, searchRecibos, setRecibo } from '@/store/recibos/reciboSlice'

export function RecibosListSearch(props) {

  const { user, logout, reload, onReload, isAdmin, isSuperUser, query, onToastSuccess } = props

  const [showDetalles, setShowDetalles] = useState(false)

  const dispatch = useDispatch()
  const recibos = useSelector(selectSearchResults)
  const loading = useSelector(selectReciboLoading)
  
  const onOpenDetalles = (recibo) => {
    dispatch(setRecibo(recibo))
    setShowDetalles(true)
  }

  const onCloseDetalles = () => {
    dispatch(setRecibo(null))
    setShowDetalles(false)
  }

  useEffect(() => {
    if (query.trim().length > 0) {
      dispatch(searchRecibos(query))
    }
  }, [query, dispatch])

  useEffect(() => {
    return () => {
      dispatch(clearSearchResults())
    }
  }, [dispatch])

  return (

    <>

      {loading ? (
        <Loading size={45} loading={1} />
      ) : (
        size(recibos) === 0 ? (
          <ListEmpty />
        ) : (
          <div className={styles.main}>
            {map(recibos, (recibo) => (
             <div key={recibo.id} className={styles.section} onClick={() => onOpenDetalles(recibo)}>
             <div>
               <div className={styles.column1}>
                 <FaFileInvoice />
               </div>
               <div className={styles.column2}>
                 <div>
                   <h1>Recibo</h1>
                   <h2>{getValueOrDefault(recibo.recibo)}</h2>
                 </div>
                 <div>
                   <h1>Cliente</h1>
                   <h2>{getValueOrDefault(recibo.cliente_nombre)}</h2>
                 </div>
               </div>
             </div>
           </div>
            ))}
          </div>
        )
      )}

      <BasicModal title='detalles de la cotización' show={showDetalles} onClose={onOpenDetalles}>
        <ReciboDetalles
          user={user}
          logout={logout}
          reload={reload}
          onReload={onReload}
          isAdmin={isAdmin}
          isSuperUser={isSuperUser}
          onCloseDetalles={onCloseDetalles}
          onToastSuccess={onToastSuccess}
        />
      </BasicModal>

    </>

  )
}
