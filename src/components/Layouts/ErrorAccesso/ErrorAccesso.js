import { FaInfoCircle } from 'react-icons/fa'
import { IconClose } from '../IconClose'
import styles from './ErrorAccesso.module.css'
import { useAuth } from '@/contexts'
import { useEffect } from 'react'

export function ErrorAccesso(props) {

  const { apiError } = props

  const { logout } = useAuth()

  useEffect(() => {
    const timer = setTimeout(() => {
      logout();
    }, 5000);

    return () => clearTimeout(timer);
  }, [logout])

  return (

    <div className={styles.error}>
      <FaInfoCircle />
      <h1>{apiError}</h1>
      <h2>No tienes los permisos necesarios para accesar.</h2>
    </div>

  )
}
