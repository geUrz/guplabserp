import { useEffect, useState } from 'react'
import { map, size } from 'lodash'
import axios from 'axios'
import { ListEmpty, Loading, ToastSuccess } from '@/components/Layouts'
import { FaFileContract } from 'react-icons/fa'
import { getValueOrDefault } from '@/helpers'
import { BasicModal } from '@/layouts'
import { CotizacionDetalles } from '../CotizacionDetalles'
import styles from './CotizacionLista.module.css'

export function CotizacionLista(props) {

  const { reload, onReload, cotizaciones, onToastSuccess, onToastSuccessDel } = props

  const [show, setShow] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  
  const [cotizacionSeleccionado, setCotizacionSeleccionado] = useState(null)
  const [toastSuccess, setToastSuccess] = useState(false)
  const [toastSuccessConfirm, setToastSuccessConfirm] = useState(false)
  const [toastSuccessDelete, setToastSuccessDelete] = useState(false)

  const onShowConfirm = () => setShowConfirm((prevState) => !prevState)

  const onOpenClose = async (cotizacion) => {

    if (!cotizacion || !cotizacion.id) {
      setShow(false)
      return;
    }

    try {
      const response = await axios.get(`/api/cotizaciones/conceptos?cotizacion_id=${cotizacion.id}`)
      cotizacion.conceptos = response.data
      setCotizacionSeleccionado(cotizacion)
      setShow((prevState) => !prevState)
    } catch (error) {
      console.error('Error al obtener los conceptos:', error)
      setShow(false)
    }
  }

  const onDeleteConcept = async (conceptoId) => {
    try {
      const response = await axios.delete(`/api/cotizaciones/conceptos`, {
        params: { concepto_id: conceptoId },
      })
      if (response.status === 200) {
        setCotizacionSeleccionado((prevState) => ({
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
    setCotizacionSeleccionado((prevState) => ({
      ...prevState,
      conceptos: [...prevState.conceptos, concept],
    }))
    onReload()
  }

  return (

    <>

      {toastSuccess && <ToastSuccess contain='Concepto creado exitosamente' onClose={() => setToastSuccess(false)} />}

      {toastSuccessConfirm && <ToastSuccess contain='Cotizacion eliminada exitosamente' onClose={() => setToastSuccessConfirm(false)} />}

      {toastSuccessDelete && <ToastSuccess contain='Concepto eliminado exitosamente' onClose={() => setToastSuccessConfirm(false)} />}

      {!cotizaciones ? (
        <Loading size={45} loading={1} />
      ) : (
        size(cotizaciones) === 0 ? (
          <ListEmpty />
        ) : (
          <div className={styles.main}>
            {map(cotizaciones, (cotizacion) => (
             <div key={cotizacion.id} className={styles.section} onClick={() => onOpenClose(cotizacion)}>
             <div>
               <div className={styles.column1}>
                 <FaFileContract />
               </div>
               <div className={styles.column2}>
                 <div>
                   <h1>Cotización</h1>
                   <h2>{getValueOrDefault(cotizacion.cotizacion)}</h2>
                 </div>
                 <div>
                   <h1>Cliente</h1>
                   <h2>{getValueOrDefault(cotizacion.cliente_nombre)}</h2>
                 </div>
               </div>
             </div>
           </div>
            ))}
          </div>
        )
      )}

      <BasicModal title='detalles de la cotización' show={show} onClose={onOpenClose}>
        <CotizacionDetalles cotizacion={cotizacionSeleccionado} cotizacionId={cotizacionSeleccionado} reload={reload} onReload={onReload} onShowConfirm={onShowConfirm} onOpenClose={onOpenClose} onToastSuccess={onToastSuccess}  onToastSuccessDel={onToastSuccessDel} onAddConcept={onAddConcept} onDeleteConcept={onDeleteConcept} cotizacionSeleccionado={setCotizacionSeleccionado} />
      </BasicModal>

    </>

  )
}
