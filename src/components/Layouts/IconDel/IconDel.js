import { FaTrash } from 'react-icons/fa'
import styles from './IconDel.module.css'

export function IconDel(props) {

  const {onOpenDel} = props

  return (

    <div className={styles.iconDel}>
      <div><FaTrash onClick={() => onOpenDel(true)} /></div>
    </div>

  )
}
