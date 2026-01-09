import { useState, useEffect } from 'react';
import axios from 'axios';
import { Input } from 'semantic-ui-react';
import { OrdenservListSearch } from '../OrdenservListSearch';
import { FaTimesCircle } from 'react-icons/fa';
import styles from './SearchOrdenserv.module.css';

export function SearchOrdenserv(props) {

  const {reload, onReload, onResults, onOpenCloseSearch, onToastSuccessMod} = props

  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ordservs, setOrdendeservicio] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      if (query.trim() === '') {
        setOrdendeservicio([])
        return
      }

      setLoading(true)
      setError('')

      try {
        const res = await axios.get(`/api/ordenserv/ordenserv?search=${query}`)
        setOrdendeservicio(res.data)
      } catch (err) {
        setError('No se encontraron órdenes de servicio')
        setOrdendeservicio([])
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
          placeholder="Buscar orden de servicio..."
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
        {ordservs.length > 0 && (
          <div className={styles.resultsContainer}>
            <OrdenservListSearch ordservs={ordservs} reload={reload} onReload={onReload} onToastSuccessMod={onToastSuccessMod} onOpenCloseSearch={onOpenCloseSearch} />
          </div>
        )}
      </div>
    </div>
  )
}
