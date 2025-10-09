import { useState } from 'react'
import { map, size } from 'lodash'
import axios from 'axios'
import { ListEmpty, Loading, ToastSuccess } from '@/components/Layouts'
import { FaFileInvoice } from 'react-icons/fa'
import { getValueOrDefault } from '@/helpers'
import { BasicModal } from '@/layouts'
import { ReciboDetalles } from '../ReciboDetalles'
import styles from './RecibosLista.module.css'
import { selectRecibo, selectRecibos } from '@/store/recibos/reciboSelectors'
import { useDispatch, useSelector } from 'react-redux'
import { setRecibo } from '@/store/recibos/reciboSlice'

export function RecibosLista(props) {

  const { reload, onReload, onToastSuccess, onToastSuccessDel } = props

  const [showDetalles, setShowDetalles] = useState(false)

  const dispatch = useDispatch()
  const recibo = useSelector(selectRecibo)
  const recibos = useSelector(selectRecibos)

  const onOpenDetalles = (recibo) => {
    dispatch(setRecibo(recibo))
    setShowDetalles(true)
  }  

  const onCloseDetalles = () => {
    dispatch(setRecibo(null))
    setShowDetalles(false)
  }

  const onDeleteConcept = async (conceptoId) => {
    try {
      const response = await axios.delete(`/api/recibos/conceptos`, {
        params: { concepto_id: conceptoId },
      })
      if (response.status === 200) {
        setReciboSeleccionado((prevState) => ({
          ...prevState,
          conceptos: prevState.conceptos.filter((concepto) => concepto.id !== conceptoId),
        }))
      } else {
        console.error('Error al eliminar el concepto: Respuesta del servidor no fue exitosa', response);
      }
    } catch (error) {
      console.error('Error al eliminar el concepto:', error.response || error.message || error);
    }
  }

  const onAddConcept = (concept) => {
    setReciboSeleccionado((prevState) => ({
      ...prevState,
      conceptos: [...prevState.conceptos, concept],
    }))
    onReload()
  }

  return (

    <>

      {!recibos ? (
        <Loading size={45} loading={1} />
      ) : (
        size(recibos) === 0 ? (
          <ListEmpty />
        ) : (
          <div className={styles.main}>
            {map(recibos, (recibo) => (
             <div key={recibo.id} className={styles.section} onClick={() => onOpenClose(recibo)}>
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
        <ReciboDetalles reload={reload} onReload={onReload} onOpenClose={onOpenDetalles} onToastSuccess={onToastSuccess} onToastSuccessDel={onToastSuccessDel} onAddConcept={onAddConcept} onDeleteConcept={onDeleteConcept} />
      </BasicModal>

    </>

  )
}
