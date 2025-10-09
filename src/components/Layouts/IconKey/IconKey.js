import { FaKey } from 'react-icons/fa'
import styles from './IconKey.module.css'

export function IconKey(props) {

  const {onOpenCloseEditPass} = props

  return (
    
    <div className={styles.main}>
      <div className={styles.section}>
        <div onClick={onOpenCloseEditPass}>
          <FaKey />
        </div>
      </div>
    </div>

  )
}
