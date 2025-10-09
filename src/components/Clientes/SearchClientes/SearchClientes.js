import { useState, useEffect } from 'react';
import axios from 'axios';
import { Input } from 'semantic-ui-react';
import { ClientesListSearch } from '../ClientesListSearch';
import { FaTimesCircle } from 'react-icons/fa';
import styles from './SearchClientes.module.css';

export function SearchClientes(props) {

  const {isAdmin, isSuperUser, reload, onReload, onResults, onOpenCloseSearch, onToastSuccess} = props

  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clientes, setClientes] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      if (query.trim() === '') {
        setClientes([])
        return
      }

      setLoading(true)
      setError('')

      try {
        const res = await axios.get(`/api/clientes/clientes?search=${query}`)
        setClientes(res.data)
      } catch (err) {
        setError('No se encontraron clientes')
        setClientes([])
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
          placeholder="Buscar cliente..."
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
        {clientes.length > 0 && (
          <div className={styles.resultsContainer}>
            <ClientesListSearch isAdmin={isAdmin} isSuperUser={isSuperUser} clientes={clientes} reload={reload} onReload={onReload} onToastSuccess={onToastSuccess} onOpenCloseSearch={onOpenCloseSearch} />
          </div>
        )}
      </div>
    </div>
  )
}
