import { useState, useEffect } from 'react';
import axios from 'axios';
import { Input } from 'semantic-ui-react';
import { CotizacionListSearch } from '../CotizacionListSearch';
import { FaTimesCircle } from 'react-icons/fa';
import styles from './SearchCotizacion.module.css';

export function SearchCotizacion(props) {

  const {reload, onReload, onResults, onOpenCloseSearch, onToastSuccess} = props

  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cotizaciones, setCotizaciones] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      if (query.trim() === '') {
        setCotizaciones([])
        return
      }

      setLoading(true)
      setError('')

      try {
        const res = await axios.get(`/api/cotizaciones/cotizaciones?search=${query}`)
        setCotizaciones(res.data)
      } catch (err) {
        setError('No se encontraron cotizaciones')
        setCotizaciones([])
      } finally {
        setLoading(false)
      }
    };

    fetchData()
  }, [query])

  return (
    <div className={styles.main}>

      <div className={styles.input}>
        <Input
          type="text"
          placeholder="Buscar cotización..."
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
        {cotizaciones.length > 0 && (
          <div className={styles.resultsContainer}>
            <CotizacionListSearch cotizaciones={cotizaciones} reload={reload} onReload={onReload} onToastSuccess={onToastSuccess} onOpenCloseSearch={onOpenCloseSearch} />
          </div>
        )}
      </div>
    </div>
  )
}
