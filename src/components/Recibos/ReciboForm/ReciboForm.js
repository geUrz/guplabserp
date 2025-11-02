import styles from './ReciboForm.module.css'
import { AddCliente, Confirm, DatosOb, IconClose, IconPlus, RowHeadModal, ToastSuccess, Toggle } from '@/components/Layouts'
import { Button, Dropdown, Form, FormField, FormGroup, Input, Label, Message } from 'semantic-ui-react'
import { formatCurrency, genRECId } from '@/helpers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '@/contexts/AuthContext'
import { ClienteForm } from '@/components/Clientes'
import { BasicModal } from '@/layouts'
import { ConceptosForm } from '../ConceptosForm'
import { ConceptosEditForm } from '../ConceptosEditForm'
import { fetchClientes } from '@/store/clientes/clienteSlice'
import { selectClientes } from '@/store/clientes/clienteSelectors'
import { useDispatch, useSelector } from 'react-redux'

export function ReciboForm(props) {

  const { reload, onReload, onOpenCloseForm, onToastSuccess } = props
  const { user } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [toggle, setToggle] = useState(false)

  const onToggle = () => setToggle((prevState) => !prevState)

  const [show, setShow] = useState(false)
  const onOpenCloseClienteForm = () => setShow((prevState) => !prevState)

  const [showConcep, setShowForm] = useState(false)
  const onOpenCloseConcep = () => setShowForm((prevState) => !prevState)

  const [showEditConcep, setShowEditConcep] = useState(null)
  const [conceptoEdit, setConceptoEdit] = useState(null)
  const [conceptoAEliminar, setConceptoAEliminar] = useState(null)

  const onOpenEditConcep = (index) => {
    setConceptoEdit(conceptos[index])
    setShowEditConcep(true)
  }

  const onCloseEditConcep = () => {
    setConceptoEdit(null)
    setShowEditConcep(false)
  }

  const onOpenCloseConfirm = (index) => {
    setConceptoAEliminar(index)
    setShowConfirm(true)
  }

  const onHideConfirm = () => {
    setConceptoAEliminar(null)
    setShowConfirm(false)
  }

  const [toastSuccessCliente, setToastSuccessCliente] = useState(false)

  const onToastSuccessCliente = () => {
    setToastSuccessCliente(true)
    setTimeout(() => {
      setToastSuccessCliente(false)
    }, 3000)
  }

  const dispatch = useDispatch()
  const clientes = useSelector(selectClientes)

  useEffect(() => {
    dispatch(fetchClientes())
  }, [dispatch, reload, user])

  const [cliente_id, setCliente] = useState('')
  const [cotizacion, setCotizacion] = useState('')
  const [cotizaciones, setCotizaciones] = useState([])
  const [recibo, setRecibo] = useState('')
  const [conceptos, setConceptos] = useState([])
  const [nuevoConcepto, setNuevoConcepto] = useState({
    tipo: '',
    concepto: '',
    precio: '',
    cantidad: ''
  })

  const [toggleIVA, setToggleIVA] = useState(false)
  
  const [ivaValue, setIvaValue] = useState(16)

  const [errors, setErrors] = useState({})

  const validarForm = () => {
    const newErrors = {}

    if (!cliente_id) {
      newErrors.cliente_id = 'El campo es requerido'
    }

    if (!recibo) {
      newErrors.recibo = 'El campo es requerido'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  // Guardar el valor de iva_enabled cuando el toggle cambia
  const onIVA = () => {
    setToggleIVA(prevState => {
      const newState = !prevState;
      return newState;
    })
  }

  const crearRecibo = async (e) => {
    e.preventDefault()

    if (!validarForm()) {
      return
    }

    setIsLoading(true)

    const folio = genRECId(4)

    const folioRef = cotizaciones.find(cot => cot.id === cotizacion)?.folio || null

    try {
      // Crear el recibo con iva_enabled
      const res = await axios.post('/api/recibos/recibos', {
        usuario_id: user.id,
        folio,
        cliente_id,
        recibo,
        folioref: folioRef,
        iva_enabled: toggleIVA,  // Guardamos el estado de IVA
        iva: ivaValue
      })
      const reciboId = res.data.id
      await Promise.all(conceptos.map(concepto =>
        axios.post('/api/recibos/conceptos', {
          recibo_id: reciboId,
          tipo: concepto.tipo,
          concepto: concepto.concepto,
          precio: concepto.precio,
          cantidad: concepto.cantidad,
          total: concepto.total
        })
      ))

      setRecibo('')
      setCliente('')
      setConceptos([])
      setCotizacion(null)

      onReload()
      onOpenCloseForm()
      onToastSuccess()
    } catch (error) {
      setIsLoading(false)
      console.error('Error al crear el recibo:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const añadirConcepto = (concepto) => {
    const total = concepto.precio * concepto.cantidad
    setConceptos([...conceptos, { ...concepto, total }])
  }

  const eliminarConcepto = () => {
    const nuevosConceptos = conceptos.filter((_, i) => i !== conceptoAEliminar)
    setConceptos(nuevosConceptos)
    setShowConfirm(false)
  }

  const fetchCotizaciones = async () => {
    try {
      const res = await axios.get('/api/cotizaciones/cotizaciones')
      setCotizaciones(res.data)
    } catch (error) {
      console.error('Error al obtener las cotizaciones:', error)
    }
  }

  useEffect(() => {
    fetchCotizaciones()
  }, [])

  useEffect(() => {
    if (cotizacion) {
      const fetchConceptos = async () => {
        try {
          const response = await axios.get(`/api/cotizaciones/conceptos?cotizacion_id=${cotizacion}`)
          setConceptos(response.data)
          setNuevoConcepto({
            tipo: '',
            concepto: '',
            precio: '',
            cantidad: ''
          })

          const cotizacionResponse = await axios.get(`/api/cotizaciones/cotizaciones?id=${cotizacion}`)
          setRecibo(cotizacionResponse.data?.cotizacion || '')
          setCliente(cotizacionResponse.data?.cliente_id || '')
        } catch (error) {
          console.error('Error al obtener los conceptos:', error)
        }
      }
      fetchConceptos()
    }
  }, [cotizacion])

  const calcularTotales = () => {
    const subtotal = conceptos.reduce((acc, curr) => acc + curr.cantidad * curr.precio, 0)
    const ivaDecimal = toggleIVA ? ivaValue / 100 : 0 // Solo calcular si está activado
    const iva = subtotal * ivaDecimal
    const total = subtotal + iva
    return { subtotal, iva, total }
  }

  const { subtotal, iva, total } = calcularTotales()

  const handleIvaChange = (e) => {
    let value = e.target.value
    if (/^\d{0,2}$/.test(value)) setIvaValue(value)
  }

  return (

    <>

      <IconClose onOpenClose={onOpenCloseForm} />

      {toastSuccessCliente && <ToastSuccess contain='Creado exitosamente' onClose={() => setToastSuccessCliente(false)} />}

      <div className={styles.main}>
        <Form>
          <FormGroup widths='equal'>
            <FormField>

              <div className={styles.toggleCot}>
                <h1>Cotización</h1>
                <div onClick={onToggle}>
                  <Toggle />
                </div>
              </div>

              {toggle ?
                <Dropdown
                  placeholder='Seleccionar'
                  fluid
                  selection
                  options={cotizaciones.map(cot => ({ key: cot.id, text: cot.folio, value: cot.id }))}
                  value={cotizacion}
                  onChange={(e, { value }) => setCotizacion(value)}
                /> : null
              }

            </FormField>
            <FormField error={!!errors.recibo}>
              <Label>Recibo*</Label>
              <Input
                type="text"
                value={recibo || ''}
                onChange={(e) => setRecibo(e.target.value)}
              />
              {errors.recibo && <Message negative>{errors.recibo}</Message>}
            </FormField>
            <FormField error={!!errors.cliente_id}>
              <Label>Cliente*</Label>
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

              {errors.cliente_id && <Message negative>{errors.cliente_id}</Message>}
            </FormField>
          </FormGroup>
        </Form>

        <div className={styles.section}>
          <RowHeadModal rowMain />
          
          {conceptos.map((concepto, index) => (
            <div key={index} className={styles.rowMap} onClick={() => onOpenEditConcep(index)}>
              <h1>{concepto.tipo}</h1>
              <h1>{concepto.concepto}</h1>

              {concepto.tipo !== '.' ? (
                <>
                  <h1>{formatCurrency(concepto.precio)}</h1>
                  <h1>{concepto.cantidad}</h1>
                  <h1>{formatCurrency(concepto.total)}</h1>
                </>
              ) : (
                <>
                  <h1></h1>
                  <h1></h1>
                  <h1></h1>
                </>
              )}
            </div>
          ))}

          <IconPlus onOpenCloseConcep={onOpenCloseConcep} />

          <div className={styles.box3}>
            <div className={styles.box3_1}>
              <div className={styles.box3_1_1}>
                <div>
                  <h2>Subtotal:</h2>
                </div>
                <div>
                  <h2>
                    {toggleIVA ? formatCurrency(subtotal) : '$0.00'}</h2>
                </div>
              </div>
              <div className={styles.box3_1_2}>
                <div onClick={onIVA}>
                  <Toggle />
                  <h2>IVA</h2>
                </div>

                <Form>
                  <FormGroup>
                    <FormField>
                      <Input
                        value={ivaValue}
                        onChange={handleIvaChange}
                        className={styles.ivaInput}
                      />
                    </FormField>
                  </FormGroup>
                </Form>

                <div>
                  <h2>
                    {toggleIVA ? formatCurrency(iva) : "$0.00"}
                  </h2>
                </div>

              </div>
              <div className={styles.box3_1_3}>
                <div>
                  <h2>Total:</h2>
                </div>
                <div>
                  <h2>{formatCurrency(total)}</h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Button primary loading={isLoading} onClick={crearRecibo}>Crear</Button>

        <DatosOb />

      </div>

      <BasicModal title='crear cliente' show={show} onClose={onOpenCloseClienteForm}>
        <ClienteForm reload={reload} onReload={onReload} onCloseForm={onOpenCloseClienteForm} onToastSuccess={onToastSuccessCliente} />
      </BasicModal>

      <BasicModal title='Agregar concepto' show={showConcep} onClose={onOpenCloseConcep}>
        <ConceptosForm añadirConcepto={añadirConcepto} onOpenCloseConcep={onOpenCloseConcep} />
      </BasicModal>

      <BasicModal title="Editar concepto" show={showEditConcep} onClose={onOpenEditConcep}>
        <ConceptosEditForm
          concepto={conceptoEdit}
          onSave={(updatedConcepto) => {

            const updatedConceptos = conceptos.map((concepto) =>
              concepto === conceptoEdit ? updatedConcepto : concepto
            )
            setConceptos(updatedConceptos)
          }}
          onCloseEditConcep={onCloseEditConcep}
          onOpenCloseConfirm={onOpenCloseConfirm}
        />
      </BasicModal>

      <Confirm
        open={showConfirm}
        onConfirm={eliminarConcepto}
        onCancel={onHideConfirm}
        content='¿Estás seguro de eliminar el concepto?'
      />

    </>

  )
}
