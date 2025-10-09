import styles from './SearchNegocios.module.css';
import { useState, useEffect } from 'react';
import { Input } from 'semantic-ui-react';
import { NegociosListSearch } from '../NegociosListSearch';
import { FaTimesCircle } from 'react-icons/fa';
import { BasicModal } from '@/layouts';
import { ErrorAccesso } from '@/components/Layouts';
import { searchNegocios } from '@/store/negocios/negocioSlice';
import { useDispatch, useSelector } from 'react-redux';
import { selectNegocios } from '@/store/negocios/negocioSelectors';

export function SearchNegocios(props) {

  const { reload, onReload, onResults, onOpenCloseSearch, onToastSuccess } = props

  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [apiError, setApiError] = useState(null)
  const [errorModalOpen, setErrorModalOpen] = useState(false)

  const onOpenCloseErrorModal = () => setErrorModalOpen((prev) => !prev)

  const negocios = useSelector(selectNegocios)

  const dispatch = useDispatch()

  useEffect(() => {
    const fetchData = async () => {
      if (query.trim().length < 1) {
        setError('')
        return;
      }

      setLoading(true)
      setError('')

      try {
        await dispatch(searchNegocios(query))
      } catch (error) {
        console.error(error)
        setApiError(error.response?.data?.error || 'Error al cargar negocios')
        setErrorModalOpen(true)
        setError('No se encontraron negocios')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [query, dispatch])

  return (

    <>

      <div className={styles.main}>

        <div className={styles.input}>
          <Input
            type="text"
            placeholder="Buscar negocio..."
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
          {negocios.length > 0 && (
            <div className={styles.resultsContainer}>
              <NegociosListSearch reload={reload} onReload={onReload} query={query} onToastSuccess={onToastSuccess} onOpenCloseSearch={onOpenCloseSearch} />
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
