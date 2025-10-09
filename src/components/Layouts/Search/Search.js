import { FaSearch } from 'react-icons/fa'
import styles from './search.module.css'

export function Search(props) {

  const {
    title,
    modo,
    search,
    onOpenCloseSearch,
    user,
    reload,
    onReload,
    resultados,
    isAdmin, 
    isSuperUser,
    setResultados,
    SearchComponent,
    SearchListComponent,
    onToastSuccess
  } = props

  return (

    <>
      {!search ? (
        <div className={styles.iconSearchMain}>
          <div className={styles.iconSearch} onClick={onOpenCloseSearch}>
            <h1>Buscar {title}</h1>
            <FaSearch />
          </div>
        </div>
      ) : (
        <div className={styles.searchMain}>
          <SearchComponent
            user={user}
            modo={modo}
            onResults={setResultados}
            reload={reload}
            onReload={onReload}
            isAdmin={isAdmin} 
            isSuperUser={isSuperUser}
            onToastSuccess={onToastSuccess}
            onOpenCloseSearch={onOpenCloseSearch}
          />
          {resultados.length > 0 && (
            <SearchListComponent visitas={resultados} reload={reload} onReload={onReload} />
          )}
        </div>
      )}
    </>

  )
}
