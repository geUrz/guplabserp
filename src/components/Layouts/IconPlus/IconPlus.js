import { FaPlus } from 'react-icons/fa'
import styles from './IconPlus.module.css'

export function IconPlus(props) {

  const {onOpenCloseConcep} = props

  return (

    <>

      <div className={styles.iconPlus}>
        <div onClick={onOpenCloseConcep}>
          <FaPlus />
        </div>
      </div>

    </>

  )
}
