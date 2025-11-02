import { map, size } from 'lodash'
import { ListEmpty, Loading } from '@/components/Layouts'
import { FaBuilding } from 'react-icons/fa'
import { BasicModal } from '@/layouts'
import { useEffect, useState } from 'react'
import { NegocioDetalles } from '../NegocioDetalles'
import styles from './NegociosListSearch.module.css'
import { getValueOrDefault } from '@/helpers'
import { useDispatch, useSelector } from 'react-redux'
import { clearSearchResults, searchNegocios, setNegocio } from '@/store/negocios/negocioSlice'
import { selectNegociosLoading, selectSearchResults } from '@/store/negocios/negocioSelectors'

export function NegociosListSearch(props) {

  const { reload, onReload, query, onToastSuccess } = props

  const dispatch = useDispatch()
  const negocios = useSelector(selectSearchResults)
  const loading = useSelector(selectNegociosLoading)

  const [showDetalles, setShowDetalles] = useState(false)

  const onOpenDetalles = (negocio) => {
      dispatch(setNegocio(negocio))
      setShowDetalles(true)
    }
  
    const onCloseDetalles = () => {
      dispatch(setNegocio(null))
      setShowDetalles(false)
    }

    useEffect(() => {
      if (query.trim().length > 0) {
        dispatch(searchNegocios(query)) 
      }
    }, [query, dispatch])
  
    useEffect(() => {
      return () => {
        dispatch(clearSearchResults()) 
      }
    }, [dispatch])
    
  return (

    <>

      {loading ? (
        <Loading size={45} loading={1} />
      ) : (
        size(negocios) === 0 ? (
          <ListEmpty />
        ) : (
          <div className={styles.main}>
            {map(negocios, (negocio) => (
              <div key={negocio.id} className={styles.section} onClick={() => onOpenDetalles(negocio)}>
                <div>
                  <div className={styles.column1}>
                    <FaBuilding />
                  </div>
                  <div className={styles.column2}>
                    <div >
                      <h1>Negocio</h1>
                      <h2>{getValueOrDefault(negocio.negocio)}</h2>
                    </div>
                    <div >
                      <h1>Cel</h1>
                      <h2>{getValueOrDefault(negocio.cel)}</h2>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      <BasicModal title='detalles del negocio' show={showDetalles} onClose={onCloseDetalles}>
          <NegocioDetalles
            reload={reload}
            onReload={onReload}
            onCloseDetalles={onCloseDetalles}
            onToastSuccess={onToastSuccess}
          />
      </BasicModal>

    </>

  )
}
