import { Confirm, IconClose, IconDel, IconEdit, Loading, RowHeadModal, ToastSuccess } from '@/components/Layouts'
import { FaPlus } from 'react-icons/fa'
import { BasicModal } from '@/layouts'
import { formatCurrency, formatDateIncDet, getValueOrDefault } from '@/helpers'
import { BiSolidToggleLeft, BiSolidToggleRight } from 'react-icons/bi'
import { useEffect, useState } from 'react'
import { ReciboConceptos } from '../ReciboConceptos'
import { ReciboPDF } from '../ReciboPDF'
import { ReciboConceptosForm } from '../ReciboConceptosForm'
import axios from 'axios'
import { Button, Form, FormField, FormGroup, Input, TextArea } from 'semantic-ui-react'
import { ReciboEditForm } from '../ReciboEditForm'
import { ReciboConceptosEditForm } from '../ReciboConceptosEditForm'
import styles from './ReciboDetalles.module.css'

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

export function ReciboDetalles(props) {

  const { loading, reload, onReload, onOpenClose, onAddConcept, onDeleteConcept, onShowConfirm, onToastSuccess, onToastSuccessDel } = props

  const [showConcep, setShowForm] = useState(false)
  const [showEditConcep, setShowEditConcept] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [currentConcept, setCurrentConcept] = useState(null)
  const [toastSuccess, setToastSuccess] = useState(false)

  const [showEditRecibo, setShowEditRecibo] = useState(false)
  const onOpenEditRecibo = () => setShowEditRecibo((prevState) => !prevState)

  const [showConfirmDel, setShowConfirmDel] = useState(false)
  const onOpenCloseConfirmDel = () => setShowConfirmDel((prevState) => !prevState)

  const onOpenCloseConfirm = (concepto) => {
    if (!concepto || !concepto.id) {
      console.error('Concepto no válido:', concepto)
      return;
    }
    setShowConfirm((prevState) => !prevState)
    setCurrentConcept(concepto.id)
  }

  const onOpenCloseConcep = (concepto) => {
    setShowForm((prevState) => !prevState)
    setCurrentConcept(concepto.id)
  }

  const onOpenCloseEditConcep = (concepto) => {
    setShowEditConcept((prevState) => !prevState)
    setCurrentConcept(concepto)
  }

  const handleDeleteConcept = () => {
    onDeleteConcept(currentConcept)
    setShowConfirm(false)
    setShowEditConcept(false)
  }
  

  const onEditConcept = (conceptoActualizado) => {
    if (!reciboState) return;
  
    setReciboState((prevRecibo) => {
      const conceptosActualizados = prevRecibo.conceptos.map((c) =>
        c.id === conceptoActualizado.id ? conceptoActualizado : c
      )
  
      return {
        ...prevRecibo,
        conceptos: conceptosActualizados,
      }
    })
  
    onReload() 
  }

  const [nota, setNota] = useState(recibo?.nota || '')
  const [editNota, setEditNota] = useState(!!recibo?.nota)

  const maxCharacters = 280

  const handleNotaChange = (e) => {
    const { value } = e.target;
    if (value.length <= maxCharacters) {
      setNota(value)
    }
  };

  const handleAddNota = async () => {
    if (!recibo.id) {
      console.error("ID del recibo no disponible")
      return;
    }

    try {
      const response = await axios.put(`/api/recibos/nota`, {
        id: recibo.id,
        notaValue: nota,
      })

      if (response.status === 200) {
        setEditNota(true)
        setReciboData(prevState => ({
          ...prevState,
          nota: nota
        }))
        onReload()
      }
    } catch (error) {
      console.error('Error al actualizar la nota:', error.response?.data || error.message)
    }
  };

  const handleDelete = async () => {
    if (!recibo?.id) {
      console.error("Recibo o ID no disponible")
      return;
    }

    try {
      await axios.delete(`/api/recibos/recibos?id=${recibo.id}`)
      onOpenClose()
      reciboSeleccionado(null)
      onReload()
      onToastSuccessDel()
    } catch (error) {
      console.error("Error al eliminar el recibo:", error)
    }
  }

  useEffect(() => {
      setEditNota(!!(recibo && recibo.nota))
    }, [recibo?.nota])
  
    useEffect(() => {
      if (recibo?.nota !== undefined) {
        setEditNota(!!recibo?.nota)
      }
    }, [recibo?.nota])

    const [toggleIVA, setToggleIVA] = useState(false)
  
  // Cargar el valor inicial de toggleIVA desde IndexedDB
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
      saveToggleIVA(newState) // Guardar el valor en IndexedDB
      return newState;
    })
  }
  
  const [ivaValue, setIvaValue] = useState(16)
  
  useEffect(() => {
    const fetchIvaValue = async () => {
      try {
        const response = await axios.get(`/api/recibos/recibos?id=${recibo.id}`)
        const iva = response.data?.iva || 16  // Si IVA es null o no existe, se usa 16
        setIvaValue(iva)
      } catch (error) {
        console.error("Error al obtener el IVA:", error)
      }
    }

    if (reciboId) {
      fetchIvaValue()
    }
  }, [reciboId])

  const saveIvaValue = async (newIvaValue) => {
    try {
      await axios.put(`/api/recibos/iva?id=${recibo.id}`, {
        iva: newIvaValue
      })
    } catch (error) {
      console.error("Error al actualizar el IVA:", error)
    }
  }

  const handleIvaChange = (e) => {
    const newIvaValue = e.target.value
    if (/^\d{0,2}$/.test(newIvaValue)) {
      setIvaValue(newIvaValue)
      saveIvaValue(newIvaValue)  // Guardar el nuevo valor de IVA directamente
    }
  }

  const calcularTotales = () => {
    const subtotal = reciboState?.conceptos?.reduce((acc, curr) => acc + curr.cantidad * curr.precio, 0) || 0
    const ivaDecimal = ivaValue / 100
    const iva = toggleIVA ? subtotal * ivaDecimal : 0
    const total = subtotal + iva
    return { subtotal, iva, total }
  }

  const { subtotal, iva, total } = calcularTotales()

  if (loading) {
    return <Loading size={45} loading={1} />
  }

  return (

    <>

      <IconClose onOpenClose={onOpenClose} />

      {toastSuccess && <ToastSuccess contain='Concepto agregado exitosamente' onClose={() => setToastSuccess(false)} />}

      <div className={styles.main}>
        <div className={styles.sectionDatos}>
          <div className={styles.datos_1}>
            <div>
              <h1>Recibo</h1>
              <h2>{getValueOrDefault(recibo?.recibo)}</h2>
            </div>
            <div>
              <h1>Cliente</h1>
              <h2>{getValueOrDefault(recibo?.cliente_nombre)}</h2>
            </div>
            <div>
              <h1>Atención a</h1>
              <h2>{getValueOrDefault(recibo?.cliente_contacto)}</h2>
            </div>
          </div>
          <div className={styles.datos_2}>
            <div>
              <h1>Folio</h1>
              <h2>{getValueOrDefault(recibo?.folio)}</h2>
            </div>
            <div>
              <h1>Fecha</h1>
              <h2>{getValueOrDefault(formatDateIncDet(recibo?.createdAt))}</h2>
            </div>
            <div>
              <h1>Cotización</h1>
              <h2>{getValueOrDefault(recibo?.folioref)}</h2>
            </div>
          </div>
        </div>

        <RowHeadModal rowMain />

        <ReciboConceptos conceptos={reciboState?.conceptos || []} onOpenCloseConfirm={onOpenCloseConfirm} onOpenCloseEditConcep={onOpenCloseEditConcep} handleDeleteConcept={handleDeleteConcept} />

        <div className={styles.iconPlus}>
          <div onClick={onOpenCloseConcep}>
            <FaPlus />
          </div>
        </div>

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

        <div className={styles.nota}>
          <h1>Nota</h1>
        </div>

        <div className={styles.formNota}>
          <Form>
            <FormGroup>
              <FormField>
                <TextArea
                  value={nota}
                  onChange={handleNotaChange}
                  placeholder="Escribe una nota aquí..."
                />
                <div className={styles.charCount}>
                  {nota.length}/{maxCharacters}
                </div>
              </FormField>
            </FormGroup>
            <Button secondary onClick={handleAddNota}>
              {editNota ? 'Modificar nota' : 'Añadir nota'}
            </Button>
          </Form>
        </div>
        
        <IconEdit onOpenEdit={onOpenEditRecibo} />

        <IconDel setShowConfirmDel={() => setShowConfirmDel(true)} />

        <ReciboPDF recibo={recibo} conceptos={reciboState?.conceptos || []} ivaValue={ivaValue} />

      </div>

      <BasicModal title='modificar el recibo' show={showEditRecibo} onClose={onOpenEditRecibo}>
        <ReciboEditForm reload={reload} onReload={onReload} recibo={recibo} actualizarRecibo={actualizarRecibo} onOpenEditRecibo={onOpenEditRecibo}/>
      </BasicModal>

      <BasicModal title='Agregar concepto' show={showConcep} onClose={onOpenCloseConcep}>
        <ReciboConceptosForm reload={reload} onReload={onReload} onOpenCloseConcep={onOpenCloseConcep} onAddConcept={onAddConcept} reciboId={reciboId?.id || []} onToastSuccess={onToastSuccess} />
      </BasicModal>

      <BasicModal title='Modificar concepto' show={showEditConcep} onClose={onOpenCloseEditConcep}>
        <ReciboConceptosEditForm
          reload={reload}
          onReload={onReload}
          onEditConcept={onEditConcept}
          conceptToEdit={currentConcept}
          onOpenCloseEditConcep={onOpenCloseEditConcep}
          onOpenCloseConfirm={onOpenCloseConfirm}
        />
      </BasicModal>

      {/* <BasicModal title='datos del cliente' show={showCliente} onClose={onOpenCloseCliente}>
        <DatosCliente
          folio={getValueOrDefault(recibo?.cliente_folio)}
          nombre={getValueOrDefault(recibo?.cliente_nombre)}
          cel={getValueOrDefault(recibo?.cliente_cel)}
          direccion={getValueOrDefault(recibo?.cliente_direccion)}
          email={getValueOrDefault(recibo?.cliente_email)}
          onOpenCloseCliente={onOpenCloseCliente} />
      </BasicModal> */}

      <Confirm
        open={showConfirm}
        onConfirm={handleDeleteConcept}
        onCancel={() => setShowConfirm(false)}
        onClick={() => onOpenCloseConfirm}
        content='¿ Estas seguro de eliminar el concepto ?'
      />

      <Confirm
        open={showConfirmDel}
        onConfirm={handleDelete}
        onCancel={onOpenCloseConfirmDel}
        content='¿ Estas seguro de eliminar el recibo ?'
      />

    </>

  )
}
