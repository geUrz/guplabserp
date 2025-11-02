import styles from './ReciboDetalles.module.css'
import { Confirm, DatosCliente, IconClose, IconDel, IconEdit, IconPlus, Loading, RowHeadModal } from '@/components/Layouts'
import { FaInfoCircle, FaPlus } from 'react-icons/fa'
import { BasicModal } from '@/layouts'
import { formatCurrency, formatDateIncDet, getValueOrDefault, getValueOrDel } from '@/helpers'
import { BiSolidToggleLeft, BiSolidToggleRight } from 'react-icons/bi'
import { useEffect, useState } from 'react'
import { ReciboConceptos } from '../ReciboConceptos'
import { ReciboPDF } from '../ReciboPDF'
import { ReciboConceptosForm } from '../ReciboConceptosForm'
import axios from 'axios'
import { Form, FormField, FormGroup, Input, TextArea } from 'semantic-ui-react'
import { ReciboEditForm } from '../ReciboEditForm'
import { ReciboConceptosEditForm } from '../ReciboConceptosEditForm'
import { useDispatch, useSelector } from 'react-redux'
import { selectRecibo } from '@/store/recibos/reciboSelectors'
import { editConceptoAsync, fetchReciboById, saveReciboNotaAsync, updateDiscount, updateIVA } from '@/store/recibos/reciboSlice'
import { selectCliente } from '@/store/clientes/clienteSelectors'
import { fetchClienteById } from '@/store/clientes/clienteSlice'

export function ReciboDetalles(props) {
  const { user, loading, reload, onReload, onCloseDetalles, onAddConcept, onToastSuccess, onToastSuccessDel } = props

  const dispatch = useDispatch()
  const recibo = useSelector(selectRecibo)
  const cliente = useSelector(selectCliente)

  useEffect(() => {
  if (!cliente || cliente.id !== recibo.cliente_id) {
    const clienteId = recibo.cliente_id;
    dispatch(fetchClienteById(clienteId));
  }
  }, [cliente, dispatch, recibo.cliente_id]);


  const [showConcep, setShowForm] = useState(false)
  const [showEditConcep, setShowEditConcept] = useState(false)
  const [currentConcept, setCurrentConcept] = useState(null)

  const [showEditRecibo, setShowEditRecibo] = useState(false)
  const onOpenEditRecibo = () => setShowEditRecibo((prevState) => !prevState)

  const [showCliente, setShowCliente] = useState(false)
  const onOpenCloseCliente = () => setShowCliente((prevState) => !prevState)

  const [showConfirmDel, setShowConfirmDel] = useState(false)
  const onOpenCloseConfirmDel = () => setShowConfirmDel((prevState) => !prevState)

  const onOpenCloseConfirm = (concepto) => {
    if (!concepto || !concepto.id) {
      console.error('Concepto no válido:', concepto)
      return
    }
    setShowConfirm((prevState) => !prevState)
    setCurrentConcept(concepto.id)
  }

  const onOpenCloseConcep = () => {
    setShowForm((prevState) => !prevState)
    setCurrentConcept(null)
  }

  const onOpenCloseEditConcep = (concepto) => {
    setShowEditConcept((prevState) => !prevState)
    setCurrentConcept(concepto)
  }

  const onEditConcept = (conceptoActualizado) => {
    dispatch(editConceptoAsync(conceptoActualizado))
    onReload()
  }

  const [discount, setDiscount] = useState(0)

  useEffect(() => {
    const fetchDiscountValue = async () => {
      try {
        const response = await axios.get(`/api/recibos/discount?id=${recibo.id}`)
        const discountValue = response.data?.discount || 0
        setDiscount(discountValue)
      } catch (error) {
        console.error('Error al obtener el discount:', error)
      }
    }

    if (recibo.id) {
      fetchDiscountValue()
    }
  }, [recibo.id])

  const saveDescuento = async (discount) => {
    try {
      await axios.put(`/api/recibos/discount?id=${recibo.id}`, {
        discount: discount,
      })
    } catch (error) {
      console.error('Error al actualizar el discount:', error)
    }
  }

  const handleDescuentoChange = (e) => {
  const newDescuento = e.target.value;

  if (newDescuento === '') {
    setDiscount('');
  } else {
    const validNumber = parseFloat(newDescuento);
    if (!isNaN(validNumber) && validNumber >= 0 && validNumber <= 100) {
      setDiscount(validNumber);
      dispatch(updateDiscount(validNumber))
      saveDescuento(validNumber)
    } else {
      setDiscount(0);
      dispatch(updateDiscount(0))
    }
  }
}

  const [nota, setNota] = useState(recibo?.nota || '')
  const maxCharacters = 280

  const handleNotaChange = (e) => {
    const { value } = e.target
    if (value.length <= maxCharacters) {
      setNota(value)
    }
  }

  useEffect(() => {
    if (recibo.id && nota !== recibo.nota) {
      dispatch(saveReciboNotaAsync({ id: recibo.id, notaValue: nota }))
    }
  }, [nota, recibo.id, dispatch])

  const handleDelete = async () => {
    if (!recibo?.id) {
      console.error('Recibo o ID no disponible')
      return
    }

    try {
      await axios.delete(`/api/recibos/recibos?id=${recibo.id}`)
      onCloseDetalles()
      onReload()
      onToastSuccessDel()
    } catch (error) {
      console.error('Error al eliminar el recibo:', error)
    }
  }

  const [toggleIVA, setToggleIVA] = useState(false)

  useEffect(() => {
    const fetchToggleIVA = async () => {
      try {
        const response = await axios.get(`/api/recibos/iva?id=${recibo.id}`)
        setToggleIVA(response.data?.iva_enabled || false)
      } catch (error) {
        console.error('Error al obtener el estado del IVA:', error)
      }
    }

    if (recibo.id) {
      fetchToggleIVA()
    }
  }, [recibo.id])

  const onIVA = async () => {
    const newState = !toggleIVA;
    setToggleIVA(newState)

    try {
      await axios.put(`/api/recibos/iva?id=${recibo.id}`, {
        iva_enabled: newState,
        iva: ivaValue,
      })

      dispatch(updateIVA({ iva: ivaValue, iva_enabled: newState, iva_total: calculateIVA(ivaValue) }))
    } catch (error) {
      console.error('Error al actualizar el estado del IVA:', error)
    }
  }

  const [ivaValue, setIvaValue] = useState(16)

  useEffect(() => {
    const fetchIvaValue = async () => {
      try {
        const response = await axios.get(`/api/recibos/recibos?id=${recibo.id}`)
        const iva = response.data?.iva || 16
        setIvaValue(iva)
      } catch (error) {
        console.error('Error al obtener el IVA:', error)
      }
    }

    if (recibo.id) {
      fetchIvaValue()
    }
  }, [recibo.id])

  const saveIvaValue = async (newIvaValue) => {
    try {
      await axios.put(`/api/recibos/iva?id=${recibo.id}`, {
        iva: newIvaValue,
        iva_enabled: 1,
      })
    } catch (error) {
      console.error('Error al actualizar el IVA:', error)
    }
  }

  const calculateIVA = (ivaPercentage) => {
    const subtotal = recibo?.conceptos?.reduce((acc, curr) => acc + curr.cantidad * curr.precio, 0) || 0
    const ivaDecimal = ivaPercentage / 100
    return subtotal * ivaDecimal
  }

  const handleIvaChange = (e) => {
    const newIvaValue = e.target.value

    if (newIvaValue === '') {
      setIvaValue('')
    } else if (/^\d{0,2}$/.test(newIvaValue) && newIvaValue >= 0 && newIvaValue <= 100) {

      setIvaValue(newIvaValue)

      saveIvaValue(newIvaValue)

      dispatch(updateIVA({
        iva: newIvaValue,
        iva_total: calculateIVA(newIvaValue),
      }))
    } else {
      setIvaValue(16)
    }
  }

  const [discountValue, setDiscountValue] = useState(0)

  const calcularTotales = (discount) => {
  const subtotal = recibo?.conceptos?.reduce((acc, curr) => acc + curr.cantidad * curr.precio, 0) || 0
  const descuentoValor = (discount / 100) * subtotal
  const subtotalConDescuento = subtotal - descuentoValor
  const iva = subtotalConDescuento * (ivaValue / 100)
  const total = toggleIVA ? subtotalConDescuento + iva : subtotalConDescuento

  if (descuentoValor !== discountValue) {
    setDiscountValue(descuentoValor)
  }

  return { subtotal, iva, total }
}

  const { subtotal, iva, total } = calcularTotales(discount)

  if (loading) {
    return <Loading size={45} loading={1} />
  }

  return (
    <>
      <IconClose onOpenClose={onCloseDetalles} />

      <div className={styles.main}>
        <div className={styles.sectionDatos}>
          <div className={styles.datos_1}>
            <div>
              <h1>Recibo</h1>
              <h2>{getValueOrDefault(recibo?.recibo)}</h2>
            </div>
            <div>
              <div>
                <div className={styles.infCliente}>
                  <h1>Cliente</h1>
                  {(recibo?.cliente_nombre_real || recibo?.cliente_id) && (
                    <FaInfoCircle onClick={onOpenCloseCliente} />
                  )}
                </div>
                <h2>
                  {recibo?.cliente_nombre_real
                    ? recibo?.cliente_nombre_real
                    : getValueOrDel(recibo?.cliente_nombre, !recibo?.cliente_id)}
                </h2>
              </div>
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

        <ReciboConceptos onOpenCloseConfirm={onOpenCloseConfirm} onOpenCloseEditConcep={onOpenCloseEditConcep} />

        <IconPlus onOpenCloseConcep={onOpenCloseConcep} />

        <div className={styles.sectionTotal}>
          <div className={styles.sectionTotal_1}>
            <h1>Subtotal:</h1>

            <div className={styles.descON}>
              <Form>
                <FormGroup>
                  <FormField>
                    <Input
                      value={discount}
                      onChange={handleDescuentoChange}
                      className={styles.descInput}
                    />
                  </FormField>
                </FormGroup>
              </Form>
              <h1>%</h1>
              <h1>Desc:</h1>
            </div>

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

            <div className={styles.total}>
              <h1>Total:</h1>
            </div>
          </div>

          <div className={styles.sectionTotal_2}>
            <h1>{formatCurrency(subtotal)}</h1>
            <h1>- {formatCurrency(discountValue)}</h1>
            
            {!toggleIVA ? (
              <h1>{formatCurrency('0')}</h1>
            ) : (
              <h1>{formatCurrency(iva)}</h1>
                
            )}
            <div className={styles.total}>
              <h1>{formatCurrency(total)}</h1>
            </div>
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
          </Form>
        </div>

        <IconEdit onOpenEdit={onOpenEditRecibo} />

        <IconDel onOpenDel={() => setShowConfirmDel(true)} />

        <ReciboPDF />
      </div>

      <BasicModal title="modificar el recibo" show={showEditRecibo} onClose={onOpenEditRecibo}>
        <ReciboEditForm user={user} reload={reload} onReload={onReload} onOpenEditRecibo={onOpenEditRecibo} onToastSuccess={onToastSuccess} />
      </BasicModal>

      <BasicModal title="Agregar concepto" show={showConcep} onClose={onOpenCloseConcep}>
        <ReciboConceptosForm reload={reload} onReload={onReload} onAddConcept={onAddConcept} onOpenCloseConcep={onOpenCloseConcep} onToastSuccess={onToastSuccess} />
      </BasicModal>

      <BasicModal title="Modificar concepto" show={showEditConcep} onClose={onOpenCloseEditConcep}>
        <ReciboConceptosEditForm
          reload={reload}
          onReload={onReload}
          onEditConcept={onEditConcept}
          conceptToEdit={currentConcept}
          onToastSuccess={onToastSuccess}
          onOpenCloseEditConcep={onOpenCloseEditConcep}
        />
      </BasicModal>

      <BasicModal title="datos del cliente" show={showCliente} onClose={onOpenCloseCliente}>
        <DatosCliente
          cliente={cliente}
          tag={recibo}
          fetchById={fetchReciboById}
          reload={reload}
          onReload={onReload}
          onToastSuccess={onToastSuccess}
          onOpenCloseCliente={onOpenCloseCliente}
        />
      </BasicModal>

      <Confirm
        open={showConfirmDel}
        onConfirm={handleDelete}
        onCancel={onOpenCloseConfirmDel}
        content="¿ Estas seguro de eliminar el recibo ?" />
    </>
  )
}
