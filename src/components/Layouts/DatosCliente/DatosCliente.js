import { getValueOrDefault } from '@/helpers'
import { IconClose } from '../IconClose/IconClose'
import styles from './DatosCliente.module.css'
import { BasicModal } from '@/layouts'
import { ClienteEditForm } from '@/components/Clientes'
import { useState } from 'react'
import { IconEdit } from '../IconEdit'

export function DatosCliente(props) {

  const { cliente, reload, onReload, tag, fetchById, onToastSuccess, onOpenCloseCliente } = props

  const [showEdit, setShowEdit] = useState(false)
  
  const onOpenCloseEdit = () => setShowEdit((prevState) => !prevState)

  return (

    <>

      <IconClose onOpenClose={onOpenCloseCliente} />

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
      
      </div>


      <BasicModal title='modificar cliente' show={showEdit} onClose={onOpenCloseEdit}>
        <ClienteEditForm reload={reload} onReload={onReload} tag={tag} fetchById={fetchById} onOpenCloseEdit={onOpenCloseEdit} onToastSuccess={onToastSuccess} />
      </BasicModal>

    </>

  )
}
