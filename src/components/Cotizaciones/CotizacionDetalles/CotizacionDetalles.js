import { Confirm, IconClose, IconDel, IconEdit, IconPlus, RowHeadModal, ToastSuccess } from '@/components/Layouts'
import { FaPlus } from 'react-icons/fa'
import { BasicModal } from '@/layouts'
import { formatCurrency, formatDateIncDet, getValueOrDefault } from '@/helpers'
import { BiSolidToggleLeft, BiSolidToggleRight } from 'react-icons/bi'
import { useEffect, useState, useRef } from 'react'
import { CotizacionConceptos } from '../CotizacionConceptos'
import { CotizacionPDF } from '../CotizacionPDF'
import { CotizacionConceptosForm } from '../CotizacionConceptosForm'
import axios from 'axios'
import { Form, FormField, FormGroup, Input, TextArea } from 'semantic-ui-react'
import { CotizacionEditForm } from '../CotizacionEditForm'
import { CotizacionConceptosEditForm } from '../CotizacionConceptosEditForm'
import styles from './CotizacionDetalles.module.css'

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

export function CotizacionDetalles(props) {

  const { cotizacion, cotizacionId, reload, onReload, onOpenClose, onAddConcept, onDeleteConcept, onShowConfirm, onToastSuccess, onToastSuccessDel, cotizacionSeleccionado } = props
  
  const [showConcep, setShowForm] = useState(false)
  const [showEditConcep, setShowEditConcept] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [currentConcept, setCurrentConcept] = useState(null)
  const [toastSuccess, setToastSuccess] = useState(false)

  const [showEditCotizacion, setShowEditCotizacion] = useState(false)
  const onOpenEditCotizacion = () => setShowEditCotizacion((prevState) => !prevState)

  const [showConfirmDel, setShowConfirmDel] = useState(false)
  const onOpenCloseConfirmDel = () => setShowConfirmDel((prevState) => !prevState)

  useEffect(() => {
    setEditNota(!!(cotizacion && cotizacion.nota))
  }, [cotizacion?.nota])

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

  const [cotizacionState, setCotizacionState] = useState(cotizacion)

  useEffect(() => {
    setCotizacionState(cotizacion)
  }, [cotizacion])


  const onEditConcept = (conceptoActualizado) => {
    if (!cotizacionState) return;

    setCotizacionState((prevRecibo) => {
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

  const [nota, setNota] = useState(cotizacion?.nota || '')
  const [isSaving, setIsSaving] = useState(false)
  const debounceRef = useRef(null)
  const [editNota, setEditNota] = useState(!!cotizacion?.nota)

  const maxCharacters = 280

  const handleNotaChange = (e) => {
    const { value } = e.target;
    if (value.length <= maxCharacters) {
      setNota(value)
    }
  }

  useEffect(() => {
    if (!cotizacion?.id) return
  
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
  
    debounceRef.current = setTimeout(async () => {
      setIsSaving(true)
      try {
        await axios.put(`/api/cotizaciones/nota`, {
          id: cotizacion.id,
          notaValue: nota,
        })
  
        setEditNota(true)
        setCotizacionData(prevState => ({
          ...prevState,
          nota: nota
        }))
        onReload()
      } catch (error) {
        console.error('Error al guardar la nota automáticamente:', error)
      } finally {
        setIsSaving(false)
      }
    }, 1000) // Espera 1 segundo después de dejar de escribir
  
    return () => clearTimeout(debounceRef.current)
  }, [nota])

  const handleDelete = async () => {
    if (!cotizacion?.id) {
      console.error("Cotización o ID no disponible")
      return;
    }

    try {
      await axios.delete(`/api/cotizaciones/cotizaciones?id=${cotizacion.id}`)
      onOpenClose()
      cotizacionSeleccionado(null)
      onReload()
      onToastSuccessDel()
    } catch (error) {
      console.error("Error al eliminar la cotización:", error)
    }
  }

  const [cotizacionData, setCotizacionData] = useState(cotizacion)

  useEffect(() => {
    setCotizacionData(cotizacion)
  }, [cotizacion])

  const actualizarCotizacion = (nuevaData) => {
    setCotizacionData((prevState) => ({
      ...prevState,
      ...nuevaData,
    }))
  }

  useEffect(() => {
    setEditNota(!!(cotizacionData && cotizacionData.nota))
  }, [cotizacionData?.nota])

  useEffect(() => {
    if (cotizacionData?.nota !== undefined) {
      setEditNota(!!cotizacionData?.nota)
    }
  }, [cotizacionData?.nota])

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
        const response = await axios.get(`/api/cotizaciones/cotizaciones?id=${cotizacion.id}`)
        const iva = response.data?.iva || 16  // Si IVA es null o no existe, se usa 16
        setIvaValue(iva)
      } catch (error) {
        console.error("Error al obtener el IVA:", error)
      }
    }

    if (cotizacionId) {
      fetchIvaValue()
    }
  }, [cotizacionId])

  const saveIvaValue = async (newIvaValue) => {
    try {
      await axios.put(`/api/cotizaciones/iva?id=${cotizacion.id}`, {
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
    const subtotal = cotizacionState?.conceptos?.reduce((acc, curr) => acc + curr.cantidad * curr.precio, 0) || 0
    const ivaDecimal = ivaValue / 100
    const iva = toggleIVA ? subtotal * ivaDecimal : 0
    const total = subtotal + iva
    return { subtotal, iva, total }
  }

  const { subtotal, iva, total } = calcularTotales()

  return (

    <>

      <IconClose onOpenClose={onOpenClose} />

      {toastSuccess && <ToastSuccess contain='Concepto agregado exitosamente' onClose={() => setToastSuccess(false)} />}

      <div className={styles.main}>
        <div className={styles.sectionDatos}>
          <div className={styles.datos_1}>
            <div>
              <h1>Cotización</h1>
              <h2>{getValueOrDefault(cotizacionData?.cotizacion)}</h2>
            </div>
            <div>
              <h1>Cliente</h1>
              <h2>{getValueOrDefault(cotizacionData?.cliente_nombre)}</h2>
            </div>
            <div>
              <h1>Contacto</h1>
              <h2>{getValueOrDefault(cotizacionData?.cliente_contacto)}</h2>
            </div>
          </div>
          <div className={styles.datos_2}>
            <div>
              <h1>Folio</h1>
              <h2>{getValueOrDefault(cotizacionData?.folio)}</h2>
            </div>
            <div>
              <h1>Fecha</h1>
              <h2>{getValueOrDefault(formatDateIncDet(cotizacionData?.createdAt))}</h2>
            </div>
          </div>
        </div>

        <RowHeadModal rowMain />

        <CotizacionConceptos conceptos={cotizacionState?.conceptos || []} onOpenCloseConfirm={onOpenCloseConfirm} onOpenCloseEditConcep={onOpenCloseEditConcep} handleDeleteConcept={handleDeleteConcept} />

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

        <div className={styles.toggleNota}>
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
          </Form>
        </div>

        <IconEdit onOpenEdit={onOpenEditCotizacion} />
        
        <IconDel onOpenDel={() => setShowConfirmDel(true)} />

        <CotizacionPDF cotizacionData={cotizacionData} conceptos={cotizacionState?.conceptos || []} ivaValue={ivaValue} />

      </div>

      <BasicModal title='modificar la cotización' show={showEditCotizacion} onClose={onOpenEditCotizacion}>
        <CotizacionEditForm reload={reload} onReload={onReload} cotizacionData={cotizacionData} actualizarCotizacion={actualizarCotizacion} onOpenEditCotizacion={onOpenEditCotizacion} onToastSuccess={onToastSuccess} />
      </BasicModal>

      <BasicModal title='Agregar concepto' show={showConcep} onClose={onOpenCloseConcep}>
        <CotizacionConceptosForm reload={reload} onReload={onReload} onOpenCloseConcep={onOpenCloseConcep} onAddConcept={onAddConcept} cotizacionId={cotizacionId?.id || []} onToastSuccess={onToastSuccess} />
      </BasicModal>

      <BasicModal title='Modificar concepto' show={showEditConcep} onClose={onOpenCloseEditConcep}>
        <CotizacionConceptosEditForm
          reload={reload}
          onReload={onReload}
          onEditConcept={onEditConcept}
          conceptToEdit={currentConcept}
          onOpenCloseEditConcep={onOpenCloseEditConcep}
          onOpenCloseConfirm={onOpenCloseConfirm}
        />
      </BasicModal>

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
        content='¿ Estas seguro de eliminar la cotización ?'
      />

    </>

  )
}
