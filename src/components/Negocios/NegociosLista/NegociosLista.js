import { useState } from 'react'
import { ListEmpty, Loading } from '@/components/Layouts'
import { map, size } from 'lodash'
import { FaBuilding } from 'react-icons/fa'
import { BasicModal } from '@/layouts'
import { NegocioDetalles } from '../NegocioDetalles'
import { getValueOrDefault } from '@/helpers'
import styles from './NegociosLista.module.css'
import { useDispatch, useSelector } from 'react-redux'
import { selectNegocios, selectNegociosLoading } from '@/store/negocios/negocioSelectors'
import { setNegocio } from '@/store/negocios/negocioSlice'

export function NegociosLista(props) {

  const { reload, onReload, isAdmin, isPremium, onToastSuccess, onToastSuccessDel } = props

  const dispatch = useDispatch()
  const negocios = useSelector(selectNegocios)
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
        <NegocioDetalles reload={reload} onReload={onReload} isAdmin={isAdmin} isPremium={isPremium} onCloseDetalles={onCloseDetalles} onToastSuccess={onToastSuccess} onToastSuccessDel={onToastSuccessDel} />
      </BasicModal>

    </>

  )
}
