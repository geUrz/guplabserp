import { FaPlus } from 'react-icons/fa'
import styles from './AddCliente.module.css'

export function AddCliente(props) {

  const {onOpenCloseClienteForm} = props

  return (

    <>

      <div className={styles.addCliente}>
        <h1>Crear cliente</h1>
        <FaPlus onClick={onOpenCloseClienteForm} />
      </div>

    </>

  )
}
