import { useEffect, useState } from 'react'
import { size, map } from 'lodash'
import styles from './UsuariosLista.module.css'
import { ListEmpty, Loading } from '@/components/Layouts'
import { FaUser } from 'react-icons/fa'
import { BasicModal } from '@/layouts'
import { UsuarioDetalles } from '../UsuarioDetalles'
import { useDispatch, useSelector } from 'react-redux'
import { selectUsuarios } from '@/store/usuarios/usuarioSelectors'
import { setUsuario } from '@/store/usuarios/usuarioSlice'
import { getValueOrDefault } from '@/helpers'

export function UsuariosLista(props) {

  const { user, logout, loading, isAdmin, isSuperUser, reload, onReload, onToastSuccess, onToastSuccessDel } = props

  const dispatch = useDispatch()
  const usuarios = useSelector(selectUsuarios)

  const [showDetalles, setShowDetalles] = useState(false)
  const [showLoading, setShowLoading] = useState(true)

  const onOpenDetalles = (usuario) => {
    dispatch(setUsuario(usuario))
    setShowDetalles(true)
  }

  const onCloseDetalles = () => {
    dispatch(setUsuario(null))
    setShowDetalles(false)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  return (

    <>

      {!usuarios ? (
        <Loading size={45} loading={1} />
      ) : (
        size(usuarios) === 0 ? (
          <ListEmpty />
        ) : (
          <div className={styles.main}>
            {map(usuarios, (usuario) => (
              <div key={usuario.id} className={styles.section} onClick={() => onOpenDetalles(usuario)}>
                <div>
                  <div className={styles.column1}>
                    <FaUser />
                  </div>
                  <div className={styles.column2}>
                    <div >
                      <h1>Nombre</h1>
                      <h2>{getValueOrDefault(usuario.nombre)}</h2>
                    </div>
                    <div >
                      <h1>Usuario</h1>
                      <h2>{getValueOrDefault(usuario.usuario)}</h2>
                    </div>
                  </div>
                </div>
              </div>
            )
            )}
          </div>
        )
      )}

      <BasicModal title='detalles del usuario' show={showDetalles} onClose={onCloseDetalles}>
        <UsuarioDetalles user={user} logout={logout} loading={loading} isAdmin={isAdmin} isSuperUser={isSuperUser} reload={reload} onReload={onReload} onCloseDetalles={onCloseDetalles} onToastSuccess={onToastSuccess} onToastSuccessDel={onToastSuccessDel} />
      </BasicModal>

    </>

  )
}
