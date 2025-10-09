import { FaEdit } from 'react-icons/fa'
import styles from './IconEdit.module.css'

export function IconEdit(props) {

  const {onOpenEdit} = props

  return (

    <div className={styles.iconEdit}>
      <div onClick={onOpenEdit}>
        <FaEdit />
      </div>
    </div>

  )
}
