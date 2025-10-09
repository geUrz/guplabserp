import styles from './SearchRecibos.module.css';
import { useState, useEffect } from 'react';
import { Input } from 'semantic-ui-react';
import { FaTimesCircle } from 'react-icons/fa';
import { ErrorAccesso } from '@/components/Layouts';
import { BasicModal } from '@/layouts';
import { useDispatch, useSelector } from 'react-redux';
import { clearSearchResults, searchRecibos } from '@/store/recibos/reciboSlice';
import { selectRecibos } from '@/store/recibos/reciboSelectors';
import { RecibosListSearch } from '../RecibosListSearch';

export function SearchRecibos(props) {

  const { user, logout, reload, onReload, onResults, isAdmin, isSuperUser, onOpenCloseSearch, onToastSuccess } = props

  const [apiError, setApiError] = useState(null)
  const [errorModalOpen, setErrorModalOpen] = useState(false)

  const onOpenCloseErrorModal = () => setErrorModalOpen((prev) => !prev)

  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const recibos = useSelector(selectRecibos)

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
        await dispatch(searchRecibos(query, user))
      } catch (error) {
        console.error(error)
        setApiError(error.response?.data?.error || 'Error al cargar recibos')
        setErrorModalOpen(true)
        setError('No se encontraron recibos')
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
            placeholder="Buscar recibo..."
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
          {recibos.length > 0 && (
            <div className={styles.resultsContainer}>
              <RecibosListSearch user={user} logout={logout} reload={reload} onReload={onReload} isAdmin={isAdmin} isSuperUser={isSuperUser} query={query} onToastSuccess={onToastSuccess} onOpenCloseSearch={onOpenCloseSearch} />
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
