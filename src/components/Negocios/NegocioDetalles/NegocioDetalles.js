import styles from './NegocioDetalles.module.css'
import { IconClose, Confirm, IconDel, IconEdit } from '@/components/Layouts'
import { useState } from 'react'
import { BasicModal } from '@/layouts'
import { NegocioEditForm } from '../NegocioEditForm'
import axios from 'axios'
import { getValueOrDefault } from '@/helpers'
import { FaInfinity } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import { selectNegocio } from '@/store/negocios/negocioSelectors'

export function NegocioDetalles(props) {

  const { reload, onReload, isAdmin, isPremium, onCloseDetalles, onToastSuccess, onToastSuccessDel } = props
  
  const negocio = useSelector(selectNegocio)
  
  const [showEdit, setShowEdit] = useState(false)

  const onOpenCloseEdit = () => setShowEdit((prevState) => !prevState)

  const [showConfirmDel, setShowConfirmDel] = useState(false)
  const onOpenCloseConfirmDel = () => setShowConfirmDel((prevState) => !prevState)

  const handleDeleteNegocio = async () => {
    
    if (!negocio?.id) {
      console.error("Negocio o ID no disponible");
      return;
    }

      try {
        await axios.delete(`/api/negocios/negocios?id=${negocio.id}`)
        onReload()
        onToastSuccessDel()
        onCloseDetalles()
      } catch (error) {
        console.error('Error al eliminar el negocio:', error)
      }
  }

  return (

    <>

      <IconClose onOpenClose={onCloseDetalles} />

      <div className={styles.section}>
        <div className={styles.box1}>
          <div className={styles.box1_1}>
            <div>
              <h1>Negocio</h1>
              <h2>{getValueOrDefault(negocio?.negocio)}</h2>
            </div>
            <div>
              <h1>Dirección</h1>
              <h2>{getValueOrDefault(negocio?.direccion)}</h2>
            </div>
            <div>
              <h1>Correo</h1>
              <h2>{getValueOrDefault(negocio?.email)}</h2>
            </div>
          </div>
          <div className={styles.box1_2}>
            <div>
              <h1>Folio</h1>
              <h2>{getValueOrDefault(negocio?.folio)}</h2>
            </div>
            <div>
              <h1>Cel</h1>
              <h2>{getValueOrDefault(negocio?.cel)}</h2>
            </div>
          </div>
        </div>


        {isAdmin &&
          <>

            <IconEdit onOpenEdit={onOpenCloseEdit} />
            
            <IconDel onOpenDel={onOpenCloseConfirmDel} />
          
          </>
        }

      </div>

      <BasicModal title='modificar negocio' show={showEdit} onClose={onOpenCloseEdit}>
        <NegocioEditForm reload={reload} onReload={onReload} onOpenCloseEdit={onOpenCloseEdit} onToastSuccess={onToastSuccess} />
      </BasicModal>

      <Confirm
        open={showConfirmDel}
        onConfirm={handleDeleteNegocio}
        onCancel={onOpenCloseConfirmDel}
        content='¿ Estas seguro de eliminar el negocio ?'
      />

    </>

  )
}
