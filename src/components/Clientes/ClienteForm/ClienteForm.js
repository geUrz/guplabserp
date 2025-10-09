import styles from './ClienteForm.module.css'
import { DatosOb, IconClose } from '@/components/Layouts'
import { Button, Form, FormField, FormGroup, Input, Label, Message } from 'semantic-ui-react'
import { useState } from 'react'
import { genCLId } from '@/helpers'
import axios from 'axios'

export function ClienteForm(props) {

  const { reload, onReload, onToastSuccess, onCloseForm } = props

  const [isLoading, setIsLoading] = useState(false)

  const [nombre, setNombre] = useState('')
  const [contacto, setContacto] = useState('')
  const [direccion, setDireccion] = useState('')
  const [cel, setCel] = useState('')
  const [email, setEmail] = useState('')

  const [errors, setErrors] = useState({})

  const validarForm = () => {
    const newErrors = {}

    if (!nombre) {
      newErrors.nombre = 'El campo es requerido'
    }

    if (!contacto) {
      newErrors.contacto = 'El campo es requerido'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const crearCliente = async (e) => {
    e.preventDefault()

    if(!validarForm()){
      return
    }

    setIsLoading(true)

    const folio = genCLId(4)

    try {
      await axios.post ('/api/clientes/clientes', {
        folio,
        nombre, 
        contacto, 
        direccion, 
        cel, 
        email,
      })

      await axios.post('/api/notificaciones', 
        {
          title: 'Cliente creado',
          body: `${nombre}`,
          url: '/clientes' 
        },
        {
          headers: {
            'Content-Type': 'application/json', 
          },
        }
      )

      setNombre('')
      setContacto('')
      setDireccion('')
      setCel('')
      setEmail('')

      onReload()
      onCloseForm()
      onToastSuccess()

    } catch (error) {
        console.error('Error al crear el cliente:', error)
    } finally {
        setIsLoading(false)
    }

  }

  return (

    <>

      <IconClose onOpenClose={onCloseForm} />

      <Form>
        <FormGroup widths='equal'>
          <FormField error={!!errors.nombre}>
            <Label>Cliente*</Label>
            <Input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            {errors.nombre && <Message>{errors.nombre}</Message>}
          </FormField>
          <FormField error={!!errors.contacto}>
            <Label>Contacto*</Label>
            <Input
              type="text"
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
            />
            {errors.contacto && <Message>{errors.contacto}</Message>}
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
            <Label>Celular</Label>
            <Input
              type="number"
              value={cel}
              onChange={(e) => setCel(e.target.value)}
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
        <Button primary loading={isLoading} onClick={crearCliente}>Crear</Button>
      
        <DatosOb />
      
      </Form>

    </>

  )
}
