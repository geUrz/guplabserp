import { map } from 'lodash'
import { Loading } from '@/components/Layouts'
import styles from './CotizacionConceptos.module.css'
import { formatPrice, formatQuantity, formatTipo, formatTotal } from '@/helpers/formatPrice'

export function CotizacionConceptos(props) {

  const { conceptos, onOpenCloseEditConcep } = props

  return (
    <>
      {!conceptos ?
        <Loading size={30} loading={2} />
        :
        <div className={styles.main}>
          {map(conceptos, (concepto) => (
            <div key={concepto.id} className={styles.rowMap} onClick={() => onOpenCloseEditConcep(concepto)}>
              <h1>{formatTipo(concepto.tipo)}</h1>
              <h1>{concepto.concepto}</h1>
              
              {concepto.tipo !== '.' ?
                <>
                  <h1>{formatPrice(concepto.precio)}</h1>
                  <h1>{formatQuantity(concepto.cantidad)}</h1>
                  <h1>{formatTotal(concepto.precio, concepto.cantidad)}</h1>
                </> :
                <>
                  <h1></h1>
                  <h1></h1>
                  <h1></h1>
                </>
              }

            </div>
          ))}
        </div>
      }
    </>
  )
}
