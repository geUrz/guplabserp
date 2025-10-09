import { IconClose } from '@/components/Layouts/IconClose/IconClose'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Button, Dropdown, Form, FormField, FormGroup, Input, Label, Message } from 'semantic-ui-react'
import { BasicModal } from '@/layouts'
import { FaPlus } from 'react-icons/fa'
import { AddCliente, ToastSuccess } from '@/components/Layouts'
import 'react-datepicker/dist/react-datepicker.css'
import styles from './CotizacionEditForm.module.css'
import { ClienteForm } from '@/components/Clientes'

export function CotizacionEditForm(props) {

  const { reload, onReload, cotizacionData, actualizarCotizacion, onOpenEditCotizacion, onToastSuccess } = props

  const [isLoading, setIsLoading] = useState(false)

  const [show, setShow] = useState(false)

  const onOpenCloseClienteForm = () => setShow((prevState) => !prevState)

  const [toastSuccessCliente, setToastSuccessCliente] = useState(false)

  const onToastSuccessCliente = () => {
    setToastSuccessCliente(true)
    setTimeout(() => {
      setToastSuccessCliente(false)
    }, 3000)
  }

  const [formData, setFormData] = useState({
    cotizacion: cotizacionData.cotizacion,
    cliente_id: cotizacionData.cliente_id
  })

  const [errors, setErrors] = useState({})

  const validarForm = () => {
    const newErrors = {}

    if (!formData.cotizacion) {
      newErrors.cotizacion = 'El campo es requerido'
    }

    if (!formData.cliente_id) {
      newErrors.cliente_id = 'El campo es requerido'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0

  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const [clientes, setClientes] = useState([])

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await axios.get('/api/clientes/clientes')
        setClientes(res.data)
      } catch (error) {
        console.error('Error al obtener los clientes:', error)
      }
    }

    fetchClientes()
  }, [reload])

  const handleDropdownChange = (e, { value }) => {
    setFormData({ ...formData, cliente_id: value })
  }

  const handleSubmit = async (e) => {

    e.preventDefault()

    if (!validarForm()) {
      return
    }

    setIsLoading(true)

    try {
      await axios.put(`/api/cotizaciones/cotizaciones?id=${cotizacionData.id}`, {
        ...formData,
      })
      const clienteNombre = clientes.find(c => c.id === formData.cliente_id)?.nombre || ''
      onReload()
      actualizarCotizacion({ ...formData, cliente_nombre: clienteNombre })
      onOpenEditCotizacion()
      onToastSuccess()
    } catch (error) {
      console.error('Error actualizando la cotizacion:', error)
    } finally {
        setIsLoading(false)
    }
  }

  return (

    <>

      <IconClose onOpenClose={onOpenEditCotizacion} />

      {toastSuccessCliente && <ToastSuccess contain='Creado exitosamente' onClose={() => setToastSuccessCliente(false)} />}

      <Form>
        <FormGroup widths='equal'>
          <FormField error={!!errors.cotizacion}>
            <Label>
              Cotización
            </Label>
            <Input
              type="text"
              name="cotizacion"
              value={formData.cotizacion}
              onChange={handleChange}
            />
            {errors.cotizacion && <Message negative>{errors.cotizacion}</Message>}
          </FormField>
          <FormField error={!!errors.cliente_id}>
            <Label>Cliente</Label>
            <Dropdown
              placeholder='Seleccionar'
              fluid
              selection
              options={clientes.map(cliente => ({
                key: cliente.id,
                text: cliente.nombre,
                value: cliente.id
              }))}
              value={formData.cliente_id}
              onChange={handleDropdownChange}
            />
            
            <AddCliente onOpenCloseClienteForm={onOpenCloseClienteForm} />

            {errors.cliente_id && <Message negative>{errors.cliente_id}</Message>}
          </FormField>
        </FormGroup>
        <Button primary loading={isLoading} onClick={handleSubmit}>
          Guardar
        </Button>
      </Form>

      <BasicModal title='crear cliente' show={show} onClose={onOpenCloseClienteForm}>
        <ClienteForm reload={reload} onReload={onReload} onCloseForm={onOpenCloseClienteForm} onToastSuccess={onToastSuccessCliente} />
      </BasicModal>

    </>

  )
}
