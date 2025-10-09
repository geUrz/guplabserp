import styles from './SearchUsuarios.module.css';
import { useState, useEffect } from 'react';
import { Input } from 'semantic-ui-react';
import { UsuariosListSearch } from '../UsuariosListSearch';
import { FaTimesCircle } from 'react-icons/fa';
import { ErrorAccesso } from '@/components/Layouts';
import { BasicModal } from '@/layouts';
import { useDispatch, useSelector } from 'react-redux';
import { clearSearchResults, searchUsuarios } from '@/store/usuarios/usuarioSlice';
import { selectUsuarios } from '@/store/usuarios/usuarioSelectors';

export function SearchUsuarios(props) {

  const { user, logout, reload, onReload, onResults, isAdmin, isSuperUser, onOpenCloseSearch, onToastSuccess } = props

  const [apiError, setApiError] = useState(null)
  const [errorModalOpen, setErrorModalOpen] = useState(false)

  const onOpenCloseErrorModal = () => setErrorModalOpen((prev) => !prev)

  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const usuarios = useSelector(selectUsuarios)

  const dispatch = useDispatch()

  useEffect(() => {
    const fetchData = async () => {
      if (query.trim().length < 1) {
        setError('')
        dispatch(clearSearchResults())
        return;
      }

      setLoading(true)
      setError('')

      try {
        await dispatch(searchUsuarios(query, user))
      } catch (error) {
        console.error(error)
        setApiError(error.response?.data?.error || 'Error al cargar usuarios')
        setErrorModalOpen(true)
        setError('No se encontraron usuarios')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [query, dispatch, user])

  return (

    <>

      <div className={styles.main}>

        <div className={styles.input}>
          <Input
            type="text"
            placeholder="Buscar usuario..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.searchInput}
            loading={loading}
          />
          <div className={styles.iconSearch} onClick={onOpenCloseSearch}>
            <FaTimesCircle />
          </div>
        </div>

        <div className={styles.visitaLista}>
          {error && <p>{error}</p>}
          {usuarios.length > 0 && (
            <div className={styles.resultsContainer}>
              <UsuariosListSearch user={user} logout={logout} reload={reload} onReload={onReload} isAdmin={isAdmin} isSuperUser={isSuperUser} query={query} onToastSuccess={onToastSuccess} onOpenCloseSearch={onOpenCloseSearch} />
            </div>
          )}
        </div>
      </div>

      <BasicModal title="Error de acceso" show={errorModalOpen} onClose={onOpenCloseErrorModal}>
        <ErrorAccesso apiError={apiError} onOpenCloseErrorModal={onOpenCloseErrorModal} />
      </BasicModal>

    </>

  )
}
