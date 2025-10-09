import { useEffect, useState } from 'react'
import { Loading } from '../Loading'
import { map, size } from 'lodash'
import { ListEmpty } from '../ListEmpty'
import { BasicModal } from '@/layouts'
import styles from './ListMap.module.css'
import { getValueOrDefault } from '@/helpers'

export function ListMap(props) {

  const {reload, onReload, loading, modules, title, icon, header1, header2, column1, column2, ModuleDetalles, onToastSuccessMod, onToastSuccessDel} = props

  const [showDetalles, setShowDetalles] = useState(false)
  const [seleccionado, setSeleccionada] = useState(null)

  const onOpenDetalles = (module) => {
    setSeleccionada(module)
    setShowDetalles(true)
  }

  const onCloseDetalles = () => {
    setSeleccionada(null)
    setShowDetalles(false)
  }

  const [showLoading, setShowLoading] = useState(true)

  useEffect(() => {
      const timer = setTimeout(() => {
        setShowLoading(false)
      }, 200) 
  
      return () => clearTimeout(timer)
    }, [])
  
    if (loading) {
      return <Loading size={45} loading={0} />
    }

  return (

    <>

      {showLoading ? (
        <Loading size={45} loading={1} />
      ) : (
        size(modules) === 0 ? (
          <ListEmpty />
        ) : (
          <div className={styles.main}>
            {map(modules, (module) => (
              <div key={module.id} className={styles.section} onClick={() => onOpenDetalles(module)}>
                <div>
                  <div className={styles.column1}>
                    {icon}
                  </div>
                  <div className={styles.column2}>
                    <div >
                      <h1>{header1}</h1>
                      <h2>{getValueOrDefault(module.column1)}</h2>
                    </div>
                    <div >
                      <h1>{header2}</h1>
                      <h2>{getValueOrDefault(module.column2)}</h2>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      <BasicModal title={`${title}`} show={showDetalles} onClose={onCloseDetalles}>
          <ModuleDetalles
            reload={reload}
            onReload={onReload}
            reporte={seleccionado}
            onCloseDetalles={onCloseDetalles}
            onToastSuccessMod={onToastSuccessMod}
            onToastSuccessDel={onToastSuccessDel}
          />
      </BasicModal>

    </>

  )
}
