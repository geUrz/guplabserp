import styles from './RowHeadModal.module.css'

export function RowHeadModal(props) {

  const {rowMain=false} = props

  return (

    <>

      {rowMain ? (
        <div className={styles.mainRow}>
          <h1>Tipo</h1>
          <h1>Concepto</h1>
          <h1>Precio</h1>
          <h1>Qty</h1>
          <h1>Total</h1>
        </div>
      ) : (
        <div className={styles.mainRow}>
          <h1>Tipo</h1>
          <h1>Concepto</h1>
          <h1>Precio</h1>
          <h1>Qty</h1>
          
        </div>
      )}

    </>

  )
}
