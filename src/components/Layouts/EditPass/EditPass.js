import { DatosOb, IconClose } from '@/components/Layouts'
import React, { useState } from 'react'
import { Button, Form, FormField, Input, Label, Message } from 'semantic-ui-react'
import axios from 'axios'

export function EditPass(props) {

  const { usuario, onOpenCloseEditPass, onToastSuccessUsuarioMod } = props
  
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validarFormUser = () => {
    // Validar que ambos campos no estén vacíos
    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Ambos campos son requeridos')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validación de formulario
    if (!validarFormUser()) {
      return
    }

    setError(null)

    // Validar que las contraseñas coincidan
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    try {
      await axios.put(`/api/usuarios/updatePassword?id=${usuario.id}`, {
        newPassword: formData.newPassword
      })

      onOpenCloseEditPass()
      onToastSuccessUsuarioMod()

    } catch (error) {
      console.error('Error al actualizar la contraseña:', error)
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error)
      } else {
        setError('Ocurrió un error inesperado')
      }
    }
  }

  return (
    <>
      <IconClose onOpenClose={onOpenCloseEditPass} />
      <Form>
        <FormField>
          <Label>Nueva contraseña*</Label>
          <Input
            name='newPassword'
            type='password'
            value={formData.newPassword}
            onChange={handleChange}
          />
        </FormField>
        <FormField>
          <Label>Confirmar nueva contraseña*</Label>
          <Input
            name='confirmPassword'
            type='password'
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </FormField>

        {error && <Message negative>{error}</Message>}

        <Button primary onClick={handleSubmit}>Guardar</Button>

        <DatosOb />

      </Form>
    </>
  )
}
