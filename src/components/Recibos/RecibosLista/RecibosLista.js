import styles from './RecibosLista.module.css'
import { useState } from 'react'
import { map, size } from 'lodash'
import { ListEmpty, Loading } from '@/components/Layouts'
import { FaFileInvoice } from 'react-icons/fa'
import { getValueOrDefault } from '@/helpers'
import { BasicModal } from '@/layouts'
import { ReciboDetalles } from '../ReciboDetalles'
import { selectRecibo, selectReciboLoading, selectRecibos } from '@/store/recibos/reciboSelectors'
import { useDispatch, useSelector } from 'react-redux'
import { setRecibo } from '@/store/recibos/reciboSlice'

export function RecibosLista(props) {

  const { user, reload, onReload, onToastSuccess, onToastSuccessDel } = props

  const [showDetalles, setShowDetalles] = useState(false)

  const dispatch = useDispatch()
  const recibo = useSelector(selectRecibo)
  const recibos = useSelector(selectRecibos)
  const loading = useSelector(selectReciboLoading)
  
  const onOpenDetalles = (recibo) => {
    dispatch(setRecibo(recibo))
    setShowDetalles(true)
  }  

  const onCloseDetalles = () => {
    dispatch(setRecibo(null))
    setShowDetalles(false)
  }

  const onAddConcept = (nuevoConcepto) => {
  if (!recibo) return;
  dispatch(setRecibo({
    ...recibo,
    conceptos: [...(recibo.conceptos || []), nuevoConcepto]
  }));
}

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

      <BasicModal title='detalles del recibo' show={showDetalles} onClose={onCloseDetalles}>
        <ReciboDetalles user={user} reload={reload} onReload={onReload} onCloseDetalles={onCloseDetalles} onAddConcept={onAddConcept} onToastSuccess={onToastSuccess} onToastSuccessDel={onToastSuccessDel} />
      </BasicModal>

    </>

  )
}
