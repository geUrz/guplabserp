import { DatosOb, ErrorAccesso, IconClose } from '@/components/Layouts'
import { Button, Dropdown, Form, FormField, FormGroup, Input, Label, Message } from 'semantic-ui-react'
import { useState } from 'react'
import { genNEId } from '@/helpers'
import axios from 'axios'
import styles from './NegocioForm.module.css'
import { BasicModal } from '@/layouts'

export function NegocioForm(props) {

  const { user, reload, onReload, onToastSuccess, onCloseForm } = props

  const [isLoading, setIsLoading] = useState(false)

  const [apiError, setApiError] = useState(null)
  const [errorModalOpen, setErrorModalOpen] = useState(false)

  const onOpenCloseErrorModal = () => setErrorModalOpen((prev) => !prev)

  const [negocio, setNegocio] = useState('')
  const [cel, setCel] = useState('')
  const [direccion, setDireccion] = useState('')
  const [email, setEmail] = useState('')

  const [errors, setErrors] = useState({})

  const validarForm = () => {
    const newErrors = {}

    if (!negocio) {
      newErrors.negocio = 'El campo es requerido'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const crearNegocio = async (e) => {
    e.preventDefault()

    if (!validarForm()) {
      return
    }

    setIsLoading(true)

    const folio = genNEId(4)

    try {
      await axios.post('/api/negocios/negocios', {
        usuario_id: user.id,
        folio,
        negocio,
        cel,
        direccion,
        email
      })

      setNegocio('')
      setCel('')
      setDireccion('')
      setEmail('')

      onReload()
      onCloseForm()
      onToastSuccess()

    } catch (error) {
      const status = error.response?.status
      const message = error.response?.data?.error || 'Error al crear el negocio'

      if (status === 403) {
        console.log('403: acceso no autorizado, no tienes permiso para crear el negocio')
      } else {
        console.error('Error creando negocio:', error)
      }

      setApiError(message)
      setErrorModalOpen(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (

    <>

      <div className={styles.main}>
        <div className={styles.section}>
          <IconClose onOpenClose={onCloseForm} />

          <Form>
            <FormGroup widths='equal'>
              <FormField error={!!errors.negocio}>
                <Label>Negocio*</Label>
                <Input
                  type="text"
                  value={negocio}
                  onChange={(e) => setNegocio(e.target.value)}
                />
                {errors.negocio && <Message>{errors.negocio}</Message>}
              </FormField>
              <FormField>
                <Label>Celular</Label>
                <Input
                  type="number"
                  value={cel}
                  onChange={(e) => setCel(e.target.value)}
                />
              </FormField>
              <FormField>
                <Label>Dirección</Label>
                <Input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                />
              </FormField>
              <FormField>
                <Label>Correo</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormField>
            </FormGroup>
            <Button primary loading={isLoading} onClick={crearNegocio}>Crear</Button>
          </Form>
        </div>
        
        <DatosOb />

      </div>

      <BasicModal title="Error de acceso" show={errorModalOpen} onClose={onOpenCloseErrorModal}>
        <ErrorAccesso apiError={apiError} onOpenCloseErrorModal={onOpenCloseErrorModal} />
      </BasicModal>

    </>

  )
}
