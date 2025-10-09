import { FaCheckCircle } from 'react-icons/fa'
import styles from './ToastSuccess.module.css'
import { useEffect } from 'react';

export function ToastSuccess(props) {

  const { onClose } = props

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose]);

  return (

    <div className={styles.section}>
      <div className={styles.toast}>
        <FaCheckCircle />
      </div>
    </div>

  )
}
