import styles from './ClienteDetalles.module.css'
import { IconClose, Confirm, IconEdit, IconDel } from '@/components/Layouts'
import { useState } from 'react'
import { BasicModal } from '@/layouts'
import { ClienteEditForm } from '../ClienteEditForm'
import axios from 'axios'
import { getValueOrDefault } from '@/helpers'
import { useDispatch, useSelector } from 'react-redux'
import { selectCliente } from '@/store/clientes/clienteSelectors'

export function ClienteDetalles(props) {

  const { isAdmin, isSuperUser, reload, onReload, onCloseDetalles, onToastSuccess, toastSuccessDel } = props

  const dispatch = useDispatch()
  const cliente = useSelector(selectCliente)

  const [showEdit, setShowEdit] = useState(false)

  const onOpenCloseEdit = () => setShowEdit((prevState) => !prevState)

  const [showConfirmDel, setShowConfirmDel] = useState(false)

  const onOpenCloseConfirmDel = () => setShowConfirmDel((prevState) => !prevState)

  const handleDeleteCliente = async () => {
    if (cliente?.id) {
      try {
        await axios.delete(`/api/clientes/clientes?id=${cliente.id}`)
        onReload()
        toastSuccessDel()
        onCloseDetalles()
      } catch (error) {
        console.error('Error al eliminar la cliente:', error)
      }
    } else {
      console.error('Incidencia o ID no disponible')
    }
  }

  return (

    <>

      <IconClose onOpenClose={onCloseDetalles} />

      <div className={styles.section}>
        <div className={styles.box1}>
          <div className={styles.box1_1}>
            <div>
              <h1>Cliente</h1>
              <h2>{getValueOrDefault(cliente?.nombre)}</h2>
            </div>
            <div>
              <h1>Contacto</h1>
              <h2>{getValueOrDefault(cliente?.contacto)}</h2>
            </div>
            <div>
              <h1>Dirección</h1>
              <h2>{getValueOrDefault(cliente?.direccion)}</h2>
            </div>
          </div>
          <div className={styles.box1_2}>
            <div>
              <h1>Folio</h1>
              <h2>{getValueOrDefault(cliente?.folio)}</h2>
            </div>
            <div>
              <h1>Cel</h1>
              <h2>{getValueOrDefault(cliente?.cel)}</h2>
            </div>
            <div>
              <h1>Email</h1>
              <h2>{getValueOrDefault(cliente?.email)}</h2>
            </div>
          </div>
        </div>

        <IconEdit onOpenEdit={onOpenCloseEdit} />

        {(isAdmin || isSuperUser) &&
          <IconDel onOpenDel={onOpenCloseConfirmDel} />
        }   

      </div>

      <BasicModal title='modificar cliente' show={showEdit} onClose={onOpenCloseEdit}>
        <ClienteEditForm reload={reload} onReload={onReload} onOpenCloseEdit={onOpenCloseEdit} onToastSuccess={onToastSuccess} />
      </BasicModal>

      <Confirm
        open={showConfirmDel}
        onConfirm={handleDeleteCliente}
        onCancel={onOpenCloseConfirmDel}
        content='¿ Estas seguro de eliminar el cliente ?'
      />

    </>

  )
}
