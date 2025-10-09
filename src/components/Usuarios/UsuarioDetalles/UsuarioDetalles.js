import { Confirm, EditPass, IconClose, IconDel, IconEdit, IconKey } from '@/components/Layouts'
import { BasicModal } from '@/layouts'
import { useState } from 'react'
import { UsuarioEditForm } from '../UsuarioEditForm'
import styles from './UsuarioDetalles.module.css'
import { getValueOrDefault, getValueOrDel } from '@/helpers'
import { useSelector } from 'react-redux'
import { selectUsuario } from '@/store/usuarios/usuarioSelectors'

export function UsuarioDetalles(props) {

  const { user, logout, isAdmin, isSuperUser, reload, onReload, onCloseDetalles, onToastSuccess, onToastSuccessDel } = props
  
  const usuario = useSelector(selectUsuario)
  
  const negocioId = user?.negocio_id
  
  const [showEdit, setShowEdit] = useState(false)

  const onOpenCloseEdit = () => setShowEdit((prevState) => !prevState)

  const [showEditPass, setShowEditPass] = useState(false)

  const onOpenCloseEditPass = () => setShowEditPass((prevState) => !prevState)

  const [showConfirmDel, setShowConfirmDel] = useState(false)

  const onOpenCloseConfirmDel = () => setShowConfirmDel((prevState) => !prevState)

  const handleDeleteUsuario = async () => {
    if (usuario?.id) {
      try {
        await axios.delete(`/api/usuarios/usuarios?id=${usuario?.id}`)
        onReload()
        onToastSuccessDel()
        onCloseDetalles()
      } catch (error) {
        console.error('Error al eliminar la usuario:', error)
      }
    } else {
      console.error('Uusario o ID no disponible')
    }
  }

  let isActive = ''

  if (usuario?.isactive === 1) {
    isActive = 'Activo'
  } else {
    isActive = 'Inactivo'
  }

  return (

    <>

      <IconClose onOpenClose={onCloseDetalles} />

      <div className={styles.section}>
        <div className={styles.box1}>
          <div className={styles.box1_1}>
            <div>
              <h1>Nombre</h1>
              <h2>{getValueOrDefault(usuario?.nombre)}</h2>
            </div>
            <div>
              <h1>Usuario</h1>
              <h2>{getValueOrDefault(usuario?.usuario)}</h2>
            </div>
            <div>
              <h1>Correo</h1>
              <h2>{getValueOrDefault(usuario?.email)}</h2>
            </div>
            <div>
              <h1>Negocio</h1>
              <h2>{getValueOrDel(usuario?.negocio_nombre, !usuario?.negocio_id)}</h2>
            </div>
          </div>
          <div className={styles.box1_2}>
            <div>
              <h1>Folio</h1>
              <h2>{getValueOrDefault(usuario?.folio)}</h2>
            </div>
            <div>
              <h1>Cel</h1>
              <h2>{getValueOrDefault(usuario?.cel)}</h2>
            </div>
            <div>
              <h1>Nivel</h1>
              <h2>{getValueOrDefault(usuario?.nivel)}</h2>
            </div>
            <div>
              <h1>Estatus</h1>
              <h2>{isActive}</h2>
            </div>
          </div>
        </div>

        {(isAdmin || isSuperUser) &&

          <>

            <IconKey onOpenCloseEditPass={onOpenCloseEditPass} />

            <IconEdit onOpenEdit={onOpenCloseEdit} />

            <IconDel onOpenDel={onOpenCloseConfirmDel} />

          </>

        }

      </div>

      <BasicModal title='Modificar usuario' show={showEdit} onClose={onOpenCloseEdit}>
        <UsuarioEditForm user={user} logout={logout} isAdmin={isAdmin} reload={reload} onReload={onReload} onToastSuccess={onToastSuccess} onOpenCloseEdit={onOpenCloseEdit}  />
      </BasicModal>

      <BasicModal title='Modificar contraseña' show={showEditPass} onClose={onOpenCloseEditPass}>
        <EditPass onOpenCloseEditPass={onOpenCloseEditPass} onToastSuccess={onToastSuccess} />
      </BasicModal>

      <Confirm
        open={showConfirmDel}
        onConfirm={handleDeleteUsuario}
        onCancel={onOpenCloseConfirmDel}
        content='¿ Estas seguro de eliminar el usuario ?'
      />

    </>

  )
}
