import { IconClose } from '@/components/Layouts/IconClose/IconClose'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Button, Dropdown, Form, FormField, FormGroup, Input, Label, Message, TextArea } from 'semantic-ui-react'
import styles from './ReporteEditForm.module.css'
import { BasicModal } from '@/layouts'
import { ClienteForm } from '@/components/Clientes'
import { AddCliente, ToastSuccess } from '@/components/Layouts'
import { FaPlus } from 'react-icons/fa'

export function ReporteEditForm(props) {

  const { reload, onReload, reporteData, actualizarReporte, onOpenEditReporte, onToastSuccessMod } = props

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
    reporte: reporteData.reporte,
    cliente_id: reporteData.cliente_id,
    descripcion: reporteData.descripcion
  })

  const [errors, setErrors] = useState({})

  const validarForm = () => {
    const newErrors = {}

    if (!formData.reporte) {
      newErrors.reporte = 'El campo es requerido'
    }

    if (!formData.cliente_id) {
      newErrors.cliente_id = 'El campo es requerido'
    }

    if (!formData.descripcion) {
      newErrors.descripcion = 'El campo es requerido'
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

  // Enviar los datos actualizados
  const handleSubmit = async (e) => {

    e.preventDefault()

    if (!validarForm()) {
      return
    }

    setIsLoading(true)

    try {
      await axios.put(`/api/reportes/reportes?id=${reporteData.id}`, {
        ...formData
      })
      const clienteNombre = clientes.find(c => c.id === formData.cliente_id)?.nombre || ''
      onReload()
      actualizarReporte({ ...formData, cliente_nombre: clienteNombre })
      onOpenEditReporte()
      onToastSuccessMod()
    } catch (error) {
      setIsLoading(false)
      console.error('Error al modificar el reporte:', error)
    } finally {
        setIsLoading(false)
    }
  }

  return (

    <>

      <IconClose onOpenClose={onOpenEditReporte} />

      {toastSuccessCliente && <ToastSuccess contain='Creado exitosamente' onClose={() => setToastSuccessCliente(false)} />}

      <Form>
        <FormGroup widths='equal'>
          <FormField error={!!errors.reporte}>
            <Label>
              Reporte
            </Label>
            <Input
              type="text"
              name="reporte"
              value={formData.reporte}
              onChange={handleChange}
            />
            {errors.reporte && <Message negative>{errors.reporte}</Message>}
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
          <FormField error={!!errors.descripcion}>
            <Label>
              Descripción
            </Label>
            <TextArea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
            />
            {errors.descripcion && <Message negative>{errors.descripcion}</Message>}
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
