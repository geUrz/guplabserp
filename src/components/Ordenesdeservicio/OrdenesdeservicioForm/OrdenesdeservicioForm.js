import { Button, Dropdown, Form, FormField, FormGroup, Input, Label, Message, TextArea } from 'semantic-ui-react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '@/contexts/AuthContext'
import { IconClose } from '@/components/Layouts/IconClose/IconClose'
import { genOSId } from '@/helpers'
import 'react-datepicker/dist/react-datepicker.css'
import { BasicModal } from '@/layouts'
import { ClienteForm } from '@/components/Clientes'
import { FaPlus } from 'react-icons/fa'
import { ToastSuccess } from '@/components/Layouts'
import styles from './OrdenesdeservicioForm.module.css'


export function OrdenesdeservicioForm(props) {
  
  const { user, reload, onReload, onOpenCloseForm, onToastSuccess } = props

  const [clientes, setClientes] = useState([])
  const [cliente_id, setCliente] = useState('')
  const [ordendeservicio, setOrdendeservicio] = useState('')
  const [descripcion, setDescripcion] = useState('')

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

    if (!ordendeservicio) {
      newErrors.ordendeservicio = 'El campo es requerido'
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
    setOrdendeservicio(value)
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

  const crear = async (e) => {

    e.preventDefault()

    if (!validarForm()) {
      return
    }

    const folio = genOSId(4)

    try {
      await axios.post('/api/ordenesdeserv/ordenesdeserv', {
        usuario_id: user.id,
        folio,
        cliente_id,
        ordendeservicio,
        descripcion
      })

      await axios.post('/api/notificaciones', 
        {
          title: 'Orden de servicio creado',
          body: `${ordendeservicio}`,
          data: {
            url: '/ordenesdeservicio' 
          }
        },
        {
          headers: {
            'Content-Type': 'application/json', 
          },
        }
      )

      setOrdendeservicio('')
      setCliente('')
      setDescripcion('')

      onReload()
      onOpenCloseForm()
      onToastSuccess()

    } catch (error) {
      console.error('Error al crear la orden de servicio:', error)
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
              <FormField error={!!errors.ordendeservicio}>
                <Label>
                  Orden de servicio
                </Label>
                <Input
                  name='ordendeservicio'
                  type="text"
                  value={ordendeservicio}
                  onChange={handleReporteChange}
                />
                {errors.ordendeservicio && <Message negative>{errors.ordendeservicio}</Message>}
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
                <div className={styles.addCliente}>
                  <h1>Crear cliente</h1>
                  <FaPlus onClick={onOpenCloseClienteForm} />
                </div>
                {errors.cliente_id && <Message negative>{errors.cliente_id}</Message>}
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
                {errors.descripcion && <Message negative>{errors.descripcion}</Message>}
              </FormField>
            </FormGroup>
            <Button
              primary
              onClick={crear}
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
