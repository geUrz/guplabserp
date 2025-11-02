import { useState } from 'react'
import { Confirm, IconClose, IconDel } from '@/components/Layouts'
import { Button, Dropdown, Form, FormField, FormGroup, Input, Label, Message } from 'semantic-ui-react'
import axios from 'axios'
import styles from './ReciboConceptosEditForm.module.css'
import { formatCurrencyInput, parseCurrencyInput } from '@/helpers'
import { useDispatch } from 'react-redux'
import { deleteConceptoAsync, editConceptoAsync } from '@/store/recibos/reciboSlice'

export function ReciboConceptosEditForm(props) {

  const { reload, onReload, onOpenCloseEditConcep, conceptToEdit, onToastSuccess } = props

  const dispatch = useDispatch()

  const [isLoading, setIsLoading] = useState(false)

  const [showConfirm, setShowConfirm] = useState(false)

  const [newConcept, setNewConcept] = useState(conceptToEdit || { tipo: '', concepto: '', precio: '', cantidad: '' })
  const [errors, setErrors] = useState({})

  const calculateTotal = (precio, cantidad) => {
    return parseFloat(precio || 0) * parseInt(cantidad || 0)
  }

  const handleChange = (e, { name, value }) => {
  setNewConcept((prevState) => {
    let updatedConcept = { ...prevState, [name]: value };

    if (value === '.') {
      updatedConcept = { ...updatedConcept, concepto: '', precio: 0, cantidad: 0 };
    } else if (name === 'precio' || name === 'cantidad') {
      updatedConcept.total = calculateTotal(updatedConcept.precio, updatedConcept.cantidad);
    }

    return updatedConcept;
  })
}

  const validateForm = () => {
    const newErrors = {}

    if (newConcept.tipo !== '.') {
      if (!newConcept.tipo) {
        newErrors.tipo = 'El campo es requerido'
      }
      if (!newConcept.concepto) {
        newErrors.concepto = 'El campo es requerido'
      }
      if (!newConcept.cantidad || newConcept.cantidad <= 0) {
        newErrors.cantidad = 'El campo es requerido'
      }
      if (!newConcept.precio || newConcept.precio <= 0) {
        newErrors.precio = 'El campo es requerido'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUpdateConcept = async () => {

    if (!validateForm()) return

    setIsLoading(true)

    try {
      await axios.put(`/api/recibos/conceptos?id=${newConcept.id}`, newConcept);
      dispatch(editConceptoAsync(newConcept)); // Actualiza el concepto en Redux
      onReload()
      onToastSuccess()
      onOpenCloseEditConcep()
    } catch (error) {
      console.error('Error al actualizar el concepto:', error);
    } finally {
      setIsLoading(false)
    }
  }

  const opcionesSerprod = [
    { key: 1, text: 'Servicio', value: 'Servicio' },
    { key: 2, text: 'Producto', value: 'Producto' },
    { key: 3, text: '<vacio>', value: '.' }
  ]

  const handlePrecioChange = (e) => {
    const rawValue = e.target.value;
    const numericValue = parseCurrencyInput(rawValue)

    setNewConcept((prev) => ({
      ...prev,
      precio: numericValue,
    }))
  }

  const handleDeleteConcept = () => {
    setShowConfirm(true)
  }

  const confirmDeleteConcept = async () => {
    if (conceptToEdit?.id) {
      dispatch(deleteConceptoAsync(conceptToEdit.id))
      onReload()
      onOpenCloseEditConcep()
      setShowConfirm(false)
    } else {
      console.error("Concepto no encontrado o ID no válido");
    }
  }

  return (
    <>
      <IconClose onOpenClose={onOpenCloseEditConcep} />

      <div className={styles.addConceptForm}>
        <Form>
          <FormGroup widths='equal'>
            <FormField error={!!errors.tipo}>
              <Label>Tipo</Label>
              <Dropdown
                name="tipo"
                placeholder='Seleccionar'
                fluid
                selection
                options={opcionesSerprod}
                value={newConcept.tipo}
                onChange={handleChange}
              />
              {errors.tipo && <Message negative>{errors.tipo}</Message>}
            </FormField>
            <FormField error={!!errors.concepto}>
              <Label>Concepto</Label>
              <Input
                type="text"
                name="concepto"
                value={newConcept.concepto}
                onChange={handleChange}
              />
              {errors.concepto && <Message negative>{errors.concepto}</Message>}
            </FormField>
            <FormField error={!!errors.precio}>
              <Label>Precio</Label>
              <Input
                type="text"
                name="precio"
                value={formatCurrencyInput(newConcept.precio)}
                onChange={handlePrecioChange}
                disabled={newConcept.tipo === '.'}
              />
              {errors.precio && <Message negative>{errors.precio}</Message>}
            </FormField>
            <FormField error={!!errors.cantidad}>
              <Label>Qty</Label>
              <Input
                type="number"
                name="cantidad"
                value={newConcept.cantidad}
                onChange={handleChange}
                disabled={newConcept.tipo === '.'}
              />
              {errors.cantidad && <Message negative>{errors.cantidad}</Message>}
            </FormField>
          </FormGroup>
          <Button primary loading={isLoading} onClick={handleUpdateConcept}>
            Guardar
          </Button>
        </Form>

        <IconDel onOpenDel={handleDeleteConcept} />

      </div>

      <Confirm
        open={showConfirm}
        onConfirm={confirmDeleteConcept}
        onCancel={() => setShowConfirm(false)}
        content="¿Estás seguro de eliminar el concepto?"
      />

    </>
  )
}
