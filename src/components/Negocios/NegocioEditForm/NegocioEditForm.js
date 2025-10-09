import styles from './NegocioEditForm.module.css'
import { DatosOb, IconClose } from '@/components/Layouts'
import { useState } from 'react'
import axios from 'axios'
import { Button, Form, FormField, FormGroup, Input, Label, Message } from 'semantic-ui-react'
import { useDispatch, useSelector } from 'react-redux'
import { selectNegocio } from '@/store/negocios/negocioSelectors'
import { updateNegocio } from '@/store/negocios/negocioSlice'

export function NegocioEditForm(props) {

  const { reload, onReload, onOpenCloseEdit, onToastSuccess } = props

  const dispatch = useDispatch()
  const negocio = useSelector(selectNegocio)
  
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    negocio: negocio?.negocio || '',
    cel: negocio?.cel || '',
    direccion: negocio?.direccion || '',
    email: negocio?.email || ''
  })

  const [errors, setErrors] = useState({})

  const validarForm = () => {
    const newErrors = {}

    if (!formData.negocio) {
      newErrors.negocio = 'El campo es requerido'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0

  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {

    e.preventDefault()

    if (!validarForm()) {
      return
    }

    setIsLoading(true)

    try {
      await axios.put(`/api/negocios/negocios?id=${negocio.id}`, formData)

      const res = await axios.get(`/api/negocios/negocios?id=${negocio.id}`)
      dispatch(updateNegocio(res.data))

      onReload()
      onOpenCloseEdit()
      onToastSuccess()
    } catch (error) {
      console.error('Error actualizando el negocio:', error)
    } finally {
        setIsLoading(false)
    }
  }

  return (

    <>

      <IconClose onOpenClose={onOpenCloseEdit} />

      <Form>
        <FormGroup widths='equal'>
          <FormField error={!!errors.negocio}>
            <Label>
              Negocio*
            </Label>
            <Input
              type="text"
              name="negocio"
              value={formData.negocio}
              onChange={handleChange}
            />
            {errors.negocio && <Message>{errors.negocio}</Message>}
          </FormField>
          <FormField>
            <Label>
              Celular
            </Label>
            <Input
              type="text"
              name="cel"
              value={formData.cel}
              onChange={handleChange}
            />
          </FormField>
          <FormField>
            <Label>
              Dirección
            </Label>
            <Input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
            />
          </FormField>
          <FormField>
            <Label>
              Correo
            </Label>
            <Input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </FormField>
        </FormGroup>
        <Button primary loading={isLoading} onClick={handleSubmit}>
          Guardar
        </Button>

        <DatosOb />

      </Form>

    </>

  )
}
