import { Button, Dropdown, Form, FormField, FormGroup, Input, Label, Message, TextArea } from 'semantic-ui-react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '@/contexts/AuthContext'
import { IconClose } from '@/components/Layouts/IconClose/IconClose'
import { genRepId } from '@/helpers'
import 'react-datepicker/dist/react-datepicker.css'
import styles from './ReporteForm.module.css'
import { BasicModal } from '@/layouts'
import { ClienteForm } from '@/components/Clientes'
import { FaPlus } from 'react-icons/fa'
import { AddCliente, ToastSuccess } from '@/components/Layouts'


export function ReporteForm(props) {

  const { user } = useAuth()

  const [isLoading, setIsLoading] = useState(false)

  const [clientes, setClientes] = useState([])
  const [cliente_id, setCliente] = useState('')
  const [reporte, setReporte] = useState('')
  const [descripcion, setDescripcion] = useState('')

  const { reload, onReload, onOpenCloseForm, onToastSuccess } = props

  const [show, setShow] = useState(false)

  const onOpenCloseClienteForm = () => setShow((prevState) => !prevState)

  const [toastSuccessCliente, setToastSuccessCliente] = useState(false)

  const onToastSuccessCliente = () => {
    setToastSuccessCliente(true)
    setTimeout(() => {
      setToastSuccessCliente(false)
    }, 3000)
  }

  const [errors, setErrors] = useState({})

  const validarForm = () => {
    const newErrors = {}

    if (!reporte) {
      newErrors.reporte = 'El campo es requerido'
    }

    if (!cliente_id) {
      newErrors.cliente_id = 'El campo es requerido'
    }

    if (!descripcion) {
      newErrors.descripcion = 'El campo es requerido'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0

  }

  const handleReporteChange = (e) => {
    const value = e.target.value
    setReporte(value)
  }

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

  const crearReporte = async (e) => {

    e.preventDefault()

    if (!validarForm()) {
      return
    }

    setIsLoading(true)

    const folio = genRepId(4)

    try {
      await axios.post('/api/reportes/reportes', {
        usuario_id: user.id,
        folio,
        cliente_id,
        reporte,
        descripcion
      })

      await axios.post('/api/notificaciones', 
        {
          title: 'Reporte creado',
          body: `${reporte}`,
          data: {
            url: '/reportes' 
          }
        },
        {
          headers: {
            'Content-Type': 'application/json', 
          },
        }
      )

      setReporte('')
      setCliente('')
      setDescripcion('')

      onReload()
      onOpenCloseForm()
      onToastSuccess()

    } catch (error) {
      setIsLoading(false)
      console.error('Error al crear el reporte:', error)
    } finally {
        setIsLoading(false)
    }
  }

  return (

    <>

      <IconClose onOpenClose={onOpenCloseForm} />

      {toastSuccessCliente && <ToastSuccess contain='Creado exitosamente' onClose={() => setToastSuccessCliente(false)} />}

      <div className={styles.main}>

        <div className={styles.container}>

          <Form>
            <FormGroup widths='equal'>
              <FormField error={!!errors.reporte}>
                <Label>
                  Reporte
                </Label>
                <Input
                  name='reporte'
                  type="text"
                  value={reporte}
                  onChange={handleReporteChange}
                />
                {errors.reporte && <Message>{errors.reporte}</Message>}
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
                  value={cliente_id}
                  onChange={(e, { value }) => setCliente(value)}
                />
                
                <AddCliente onOpenCloseClienteForm={onOpenCloseClienteForm} />

                {errors.cliente_id && <Message>{errors.cliente_id}</Message>}
              </FormField>
              <FormField error={!!errors.descripcion}>
                <Label>
                  Descripción
                </Label>
                <TextArea
                  name='descripcion'
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
                {errors.descripcion && <Message>{errors.descripcion}</Message>}
              </FormField>
            </FormGroup>
            <Button
              primary
              loading={isLoading}
              onClick={crearReporte}
            >
              Crear
            </Button>

          </Form>

        </div>

        <BasicModal title='crear cliente' show={show} onClose={onOpenCloseClienteForm}>
          <ClienteForm reload={reload} onReload={onReload} onCloseForm={onOpenCloseClienteForm} onToastSuccess={onToastSuccessCliente} />
        </BasicModal>

      </div>

    </>

  )
}
