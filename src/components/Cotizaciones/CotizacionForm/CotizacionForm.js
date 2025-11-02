import styles from './CotizacionForm.module.css'
import { AddCliente, Confirm, DatosOb, IconClose, IconPlus, RowHeadModal, ToastSuccess } from '@/components/Layouts'
import { Button, Dropdown, Form, FormField, FormGroup, Input, Label, Message } from 'semantic-ui-react'
import { formatCurrency, genCOTId } from '@/helpers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { BiSolidToggleLeft, BiSolidToggleRight } from 'react-icons/bi'
import { BasicModal } from '@/layouts'
import { ClienteForm } from '@/components/Clientes'
import { ConceptosForm } from '../ConceptosForm'
import { ConceptosEditForm } from '../ConceptosEditForm'

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CotizacionesDB', 1)

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings')
      }
    }

    request.onsuccess = (e) => resolve(e.target.result)
    request.onerror = (e) => reject(e.target.error)
  })
}

const saveToggleIVA = async (value) => {
  const db = await openDB()
  const transaction = db.transaction('settings', 'readwrite')
  const store = transaction.objectStore('settings')

  store.put({ toggleIVA: value }, 'toggleIVA')

  transaction.oncomplete = () => {
  }
  transaction.onerror = (e) => {
  }
}

const getToggleIVA = async () => {
  const db = await openDB()
  const transaction = db.transaction('settings', 'readonly')
  const store = transaction.objectStore('settings')

  return new Promise((resolve, reject) => {
    const request = store.get('toggleIVA')
    request.onsuccess = (e) => {
      resolve(e.target.result?.toggleIVA || false)
    }
    request.onerror = (e) => {
      reject(e.target.error)
    }
  })
}

export function CotizacionForm(props) {

  const { reload, onReload, onOpenCloseForm, onToastSuccess } = props

  const [isLoading, setIsLoading] = useState(false)

  const [showConfirm, setShowConfirm] = useState(false)

  const [show, setShow] = useState(false)

  const onOpenCloseClienteForm = () => setShow((prevState) => !prevState)

  const [showConcep, setShowForm] = useState(false)
  const onOpenCloseConcep = () => setShowForm((prevState) => !prevState)

  const [showEditConcep, setShowEditConcep] = useState(null)
  const [conceptoEdit, setConceptoEdit] = useState(null)
  const [conceptoAEliminar, setConceptoAEliminar] = useState(null)

  const onOpenEditConcep = (index) => {
    setConceptoEdit({ ...conceptos[index], index })
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

  const [clientes, setClientes] = useState([])
  const [cliente_id, setCliente] = useState('')
  const [cotizacion, setCotizacion] = useState('')
  const [conceptos, setConceptos] = useState([])

  const [toggleIVA, setToggleIVA] = useState(false)

  useEffect(() => {
    const fetchToggleIVA = async () => {
      const storedToggleIVA = await getToggleIVA()
      setToggleIVA(storedToggleIVA)
    }
    fetchToggleIVA()
  }, [])

  const onIVA = () => {
    setToggleIVA(prevState => {
      const newState = !prevState;
      saveToggleIVA(newState)
      return newState;
    })
  }

  const [ivaValue, setIvaValue] = useState(16)

  const [errors, setErrors] = useState({})

  const validarForm = () => {
    const newErrors = {}

    if (!cotizacion) {
      newErrors.cotizacion = 'El campo es requerido'
    }

    if (!cliente_id) {
      newErrors.cliente_id = 'El campo es requerido'
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0

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

  const crearCotizacion = async (e) => {
    e.preventDefault()

    if (!validarForm()) {
      return
    }

    setIsLoading(true)

    const folio = genCOTId(4)

    try {
      const response = await axios.post('/api/cotizaciones/cotizaciones', {
        folio,
        cliente_id,
        cotizacion,
        iva: ivaValue
      })
      const cotizacionId = response.data.id

      try {
        await Promise.all(conceptos.map(concepto =>
          axios.post('/api/cotizaciones/conceptos', {
            cotizacion_id: cotizacionId,
            tipo: concepto.tipo,
            concepto: concepto.concepto,
            precio: concepto.precio,
            cantidad: concepto.cantidad,
            total: concepto.total
          })
        ))
      } catch (errorConceptos) {
        console.error("Error al guardar conceptos:", errorConceptos)
      }

      try {
        await axios.post('/api/notificaciones',
          {
            title: 'Cotización creada',
            body: `${cotizacion}`,
            url: '/cotizaciones'
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
      } catch (errorNotif) {
        console.warn("Notificación no enviada:", errorNotif)
      }

      setCotizacion('')
      setCliente('')
      setConceptos([])

      onReload()
      onOpenCloseForm()
      onToastSuccess()
    } catch (error) {
      setIsLoading(false)
      console.error('Error al crear la cotizacion:', error)
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
    setShowEditConcep(false)
  }


  const calcularTotales = () => {
    const subtotal = conceptos.reduce((acc, curr) => acc + curr.cantidad * curr.precio, 0)
    const ivaDecimal = ivaValue / 100
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
            <FormField error={!!errors.cotizacion}>
              <Label>Cotización*</Label>
              <Input
                type="text"
                value={cotizacion}
                onChange={(e) => setCotizacion(e.target.value)}
              />
              {errors.cotizacion && <Message>{errors.cotizacion}</Message>}
            </FormField>
          </FormGroup>
        </Form>
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

          {errors.cliente_id && <Message>{errors.cliente_id}</Message>}
        </FormField>

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

          <div className={styles.sectionTotal}>
            <div className={styles.sectionTotal_1}>
              <h1>Subtotal:</h1>

              {!toggleIVA ? (
                <div className={styles.toggleOFF} onClick={onIVA}>
                  <BiSolidToggleLeft />
                  <h1>IVA:</h1>
                </div>
              ) : (
                <div className={styles.toggleON}>
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
                  <h1>%</h1>
                  <BiSolidToggleRight onClick={onIVA} />
                  <h1>IVA:</h1>
                </div>
              )}

              <h1>Total:</h1>
            </div>

            <div className={styles.sectionTotal_2}>

              {!toggleIVA ? (
                <>
                  <h1>-</h1>
                  <h1>-</h1>
                </>
              ) : (
                <>
                  <h1>{formatCurrency(subtotal)}</h1>
                  <h1>{formatCurrency(iva)}</h1>
                </>
              )}

              {!toggleIVA ? (
                <h1>{formatCurrency(subtotal)}</h1>
              ) : (
                <h1>{formatCurrency(total)}</h1>
              )}
            </div>
          </div>
        </div>

        <Button primary loading={isLoading} onClick={crearCotizacion}>Crear</Button>

        <DatosOb />

      </div>

      <BasicModal title='crear cliente' show={show} onClose={onOpenCloseClienteForm}>
        <ClienteForm reload={reload} onReload={onReload} onCloseForm={onOpenCloseClienteForm} onToastSuccess={onToastSuccessCliente} />
      </BasicModal>

      <BasicModal title='Agregar concepto' show={showConcep} onClose={onOpenCloseConcep}>
        <ConceptosForm añadirConcepto={añadirConcepto} onOpenCloseConcep={onOpenCloseConcep} />
      </BasicModal>

      <BasicModal title="Modificar concepto" show={showEditConcep} onClose={onOpenEditConcep}>
        <ConceptosEditForm
          concepto={conceptoEdit}
          onSave={(updatedConcepto) => {
            const updatedConceptos = [...conceptos]
            updatedConceptos[updatedConcepto.index] = updatedConcepto
            setConceptos(updatedConceptos)
            setShowEditConcep(false)
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
