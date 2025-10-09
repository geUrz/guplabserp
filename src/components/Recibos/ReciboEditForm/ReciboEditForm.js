import { IconClose } from '@/components/Layouts/IconClose/IconClose'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Button, Dropdown, Form, FormField, FormGroup, Input, Label, Message } from 'semantic-ui-react'
import 'react-datepicker/dist/react-datepicker.css'
import styles from './ReciboEditForm.module.css'
import { FaPlus } from 'react-icons/fa'
import { BasicModal } from '@/layouts'
import { ClienteForm } from '@/components/Clientes'
import { AddCliente, ToastSuccess } from '@/components/Layouts'

export function ReciboEditForm(props) {

  const { reload, onReload, reciboData, actualizarRecibo, onOpenEditRecibo, onToastSuccessMod } = props

  const [isLoading, setIsLoading] = useState(false)

  const [show, setShow] = useState(false)

  const onOpenCloseClienteForm = () => setShow((prevState) => !prevState)

  const [formData, setFormData] = useState({
    recibo: reciboData.recibo,
    cliente_id: reciboData.cliente_id
  })
  
  const [errors, setErrors] = useState({})

  const validarForm = () => {
    const newErrors = {}

    if (!formData.recibo) {
      newErrors.recibo = 'El campo es requerido'
    }

    if (!formData.cliente_id) {
      newErrors.cliente_id = 'El campo es requerido'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0

  }

  const [clientes, setClientes] = useState([])
  
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await axios.get('/api/clientes/clientes')
        setClientes(response.data)
      } catch (error) {
        console.error('Error al obtener los clientes:', error)
      }
    }

    fetchClientes()
  }, [reload])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

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
      await axios.put(`/api/recibos/recibos?id=${reciboData.id}`, {
        ...formData,
      })
      const clienteNombre = clientes.find(c => c.id === formData.cliente_id)?.nombre || ''
      onReload()
      actualizarCotizacion({ ...formData, cliente_nombre: clienteNombre })
      onOpenEditRecibo()
      onToastSuccessMod()
    } catch (error) {
      setIsLoading(false)
      console.error('Error al modificar el recibo:', error)
    } finally {
        setIsLoading(false)
    }
  }

  const [toastSuccessCliente, setToastSuccessCCliente] = useState(false)

  const onToastSuccessCliente = () => {
    setToastSuccessCCliente(true)
    setTimeout(() => {
      setToastSuccessCCliente(false)
    }, 3000)
  }


  return (

    <>

      <IconClose onOpenClose={onOpenEditRecibo} />

      {toastSuccessCliente && <ToastSuccess contain='Cliente creado exitosamente' onClose={() => setToastSuccessCliente(false)} />}

      <Form>
        <FormGroup widths='equal'>
          <FormField error={!!errors.recibo}>
            <Label>
              Recibo
            </Label>
            <Input
              type="text"
              name="recibo"
              value={formData.recibo}
              onChange={handleChange}
            />
            {errors.recibo && <Message negative>{errors.recibo}</Message>}
          </FormField>
          <FormField error={!!errors.cliente_id}>
            <Label>Cliente</Label>
            <Dropdown
              placeholder='Selecciona un cliente'
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
