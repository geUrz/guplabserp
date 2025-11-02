import { map } from 'lodash'
import { Loading } from '@/components/Layouts'
import styles from './ReciboConceptos.module.css'
import { formatPrice, formatQuantity, formatTipo, formatTotal } from '@/helpers/formatPrice'
import { useDispatch, useSelector } from 'react-redux'
import { selectConceptos, selectReciboLoading } from '@/store/recibos/reciboSelectors'

export function ReciboConceptos(props) {

  const { onOpenCloseEditConcep } = props

  const loading = useSelector(selectReciboLoading)

  const conceptos = useSelector(selectConceptos)
  
  return (
    <>
      {loading ?
        <Loading size={30} loading={2} />
        :
        <div className={styles.main}>
          {map(conceptos, (concepto) => (
            <div key={`${concepto.recibo_id}-${concepto.id}`} className={styles.rowMap} onClick={() => onOpenCloseEditConcep(concepto)}>
              <h1>{formatTipo(concepto.tipo)}</h1>
              <h1>{concepto.concepto}</h1>
              <h1>{formatPrice(concepto.precio)}</h1>
              <h1>{formatQuantity(concepto.cantidad)}</h1>
              <h1>{formatTotal(concepto.precio, concepto.cantidad)}</h1>
            </div>
          ))}
        </div>
      }
    </>
  )
}
