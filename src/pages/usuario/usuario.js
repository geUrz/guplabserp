import { BasicModal } from '@/layouts'
import { Confirm, Loading, Title, UploadImg } from '@/components/Layouts'
import { useAuth } from '@/contexts/AuthContext'
import { FaEdit, FaImage, FaInfinity, FaMoon, FaSun, FaUser } from 'react-icons/fa'
import { Button, Image } from 'semantic-ui-react'
import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/Layouts/ProtectedRoute/ProtectedRoute'
import { ModCuentaForm, UsuarioAddDatosImage, UsuarioFormEditPDF, UsuarioFormPDF } from '@/components/Usuario'
import { BiSolidToggleLeft, BiSolidToggleRight } from 'react-icons/bi'
import { getValueOrDefault, getValueOrDel } from '@/helpers'
import { useTheme } from '@/contexts/ThemeContext'
import axios from 'axios'
import styles from './usuario.module.css'
import { usePermissions } from '@/hooks'

export default function Usuario() {

  const { user, logout, loading } = useAuth()

  const { isAdmin, isSuperUser, isPremium } = usePermissions()

  const [reload, setReload] = useState(false)

  const onReload = () => setReload((prevState) => !prevState)

  const [show, setShow] = useState(false)

  const onOpenClose = () => setShow((prevState) => !prevState)

  const [showFormPDF, setShowFormPDF] = useState(false)

  const onOpenCloseFormPDF = () => setShowFormPDF((prevState) => !prevState)

  const [showEditPDF, setShowEditPDF] = useState(false)

  const onOpenCloseEditPDF = () => setShowEditPDF((prevState) => !prevState)

  const [datoPDF, setDatoPDF] = useState(null)

  useEffect(() => {
    if (user && user?.id) {
      (async () => {
        try {
          const res = await axios.get(`/api/usuarios/datos_pdf?usuario_id=${user?.id}`)
          setDatoPDF(res.data)
        } catch (error) {
          console.error(error)
        }
      })()
    }
  }, [reload, user])

  const [showSubirImg, setShowSubirImg] = useState(false)

  const onShowSubirImg = () => {
    setShowSubirImg(true)
  }

  const onCloseSubirImg = () => {
    setShowSubirImg(false)
  }

  const [showConfirmDelImg, setShowConfirmDelImg] = useState(false)
  const onShowConfirmDelImg = () => setShowConfirmDelImg(true)

  const [imgKeyToDelete, setImgKeyToDelete] = useState(null)

  const setImageToDelete = () => {
    if (datoPDF?.logo) {
      setImgKeyToDelete('logo')
    }
  }

  const handleDeleteImage = async () => {
    try {
      await axios.delete(`/api/usuarios/uploadImage`, {
        params: {
          id: datoPDF.id,
          imageKey: imgKeyToDelete,
        },
      })

      setDatoPDF((prevDatoPDF) => ({
        ...prevDatoPDF,
        [imgKeyToDelete]: null,
      }))

      onReload()

      setShowConfirmDelImg(false)
    } catch (error) {
      console.error('Error al eliminar la imagen:', error)
    }
  }

  if (loading) {
    <Loading size={45} loading={'L'} />
  }

  return (

    <ProtectedRoute>

      <Title title='Usuario' iconBack />

      <div className={styles.main}>
        <div className={styles.section}>
          <FaUser />

          <div className={styles.datos_usuario}>
            {user && user?.usuario &&
              <>
                <h1>{getValueOrDefault(user?.usuario)}</h1>
                <div>
                  <h2>Nombre:</h2>
                  <h3>{getValueOrDefault(user?.nombre)}</h3>
                </div>
                <div>
                  <h2>Correo:</h2>
                  <h3>{getValueOrDefault(user?.email)}</h3>
                </div>
                <div>
                  <h2>Nivel:</h2>
                  <h3>{getValueOrDefault(user?.nivel)}</h3>
                </div>
                <div>
                  <h2>Negocio:</h2>
                  <h3>{getValueOrDel(user?.negocio_nombre, !user?.negocio_id)}</h3>
                </div>
              </>
            }
          </div>

          {(isAdmin || isSuperUser) &&

            <>

              <div className={styles.iconEdit}>
                <div onClick={onOpenClose}>
                  <FaEdit />
                </div>
              </div>

              <div className={styles.datos_pdf}>
                <h1>Datos de mi negocio</h1>
                <div className={styles.datos}>
                  <div>
                    <h1>Nombre de mi negocio</h1>
                    <h2>{getValueOrDefault(datoPDF?.fila1)}</h2>
                  </div>
                  <div>
                    <h1>Calle / Número</h1>
                    <h2>{getValueOrDefault(datoPDF?.fila2)}</h2>
                  </div>
                  <div>
                    <h1>Colonia</h1>
                    <h2>{getValueOrDefault(datoPDF?.fila3)}</h2>
                  </div>
                  <div>
                    <h1>Código postal</h1>
                    <h2>{getValueOrDefault(datoPDF?.fila4)}</h2>
                  </div>
                  <div>
                    <h1>Ciudad / Estado</h1>
                    <h2>{getValueOrDefault(datoPDF?.fila5)}</h2>
                  </div>
                  <div>
                    <h1>Teléfono</h1>
                    <h2>{getValueOrDefault(datoPDF?.fila7)}</h2>
                  </div>
                  <div>
                    <h1>Logo</h1>
                    {!datoPDF?.logo ? (
                      <FaImage onClick={() => onShowSubirImg()} />
                    ) : (
                      <Image
                        src={datoPDF.logo}
                        onClick={() => {
                          setImageToDelete()
                          onShowConfirmDelImg()
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.iconEdit}>
                <div onClick={onOpenCloseFormPDF}>
                  <FaEdit />
                </div>
              </div>

            </>

          }

          <Button secondary onClick={logout}>
            Cerrar sesión
          </Button>

          <div className={styles.footer}>
            <div>
              <h1>© 2025 GupraERP</h1>
            </div>
          </div>

        </div>

      </div>


      <BasicModal title='modificar usuario' show={show} onClose={onOpenClose}>
        <ModCuentaForm onOpenClose={onOpenClose} />
      </BasicModal>

      <BasicModal title={datoPDF ? 'editar negocio' : 'crear negocio'} show={showFormPDF} onClose={onOpenCloseEditPDF}>
        {datoPDF ? (
          <UsuarioFormEditPDF reload={reload} onReload={onReload} datoPDF={datoPDF} onOpenCloseFormPDF={onOpenCloseFormPDF} />
        ) : (
          <UsuarioFormPDF reload={reload} onReload={onReload} user={user} onOpenCloseFormPDF={onOpenCloseFormPDF} />
        )}
      </BasicModal>

      <BasicModal title="Subir imagen" show={showSubirImg} onClose={onCloseSubirImg}>
        {datoPDF ?
          <UploadImg
            reload={reload}
            onReload={onReload}
            itemId={datoPDF.id}
            endpoint="usuarios"
            onShowSubirImg={onCloseSubirImg}
            onSuccess={(key, url) => {
              setDatoPDF({ ...datoPDF, logo: url })
              onCloseSubirImg()
            }}
            selectedImageKey="logo"
          /> :
          <UsuarioAddDatosImage onCloseSubirImg={onCloseSubirImg} />
        }
      </BasicModal>

      <Confirm
        open={showConfirmDelImg}
        onConfirm={handleDeleteImage}
        onCancel={() => setShowConfirmDelImg(false)}
        content="¿Estás seguro de eliminar el logo?"
      />

    </ProtectedRoute>

  )
}
