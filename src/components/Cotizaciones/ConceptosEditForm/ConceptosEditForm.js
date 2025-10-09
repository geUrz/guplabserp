import { Button, Dropdown, Form, FormField, Label, Input, Message } from 'semantic-ui-react'
import { useState, useEffect } from 'react'
import styles from './ConceptosEditForm.module.css'
import { DatosOb, IconClose, IconDel } from '@/components/Layouts'
import { formatCurrencyInput, parseCurrencyInput } from '@/helpers';

export function ConceptosEditForm(props) {
  const { concepto, onSave, onCloseEditConcep, onOpenCloseConfirm } = props;

  const [editedConcepto, setEditedConcepto] = useState(concepto)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setEditedConcepto(concepto)
  }, [concepto])

  const calculateTotal = (precio, cantidad) => {
    return parseFloat(precio || 0) * parseInt(cantidad || 0)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setEditedConcepto((prevState) => {
      const updatedConcepto = { ...prevState, [name]: value }

      if (name === 'precio' || name === 'cantidad') {
        updatedConcepto.total = calculateTotal(updatedConcepto.precio, updatedConcepto.cantidad)
      }

      return updatedConcepto;
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const newErrors = {}

    if (editedConcepto.tipo !== '.') {
      if (!editedConcepto.tipo) newErrors.tipo = 'El campo es requerido'
      if (!editedConcepto.concepto) newErrors.concepto = 'El campo es requerido'
      if (!editedConcepto.precio) newErrors.precio = 'El campo precio es requerido'
      if (!editedConcepto.cantidad) newErrors.cantidad = 'El campo cantidad es requerido'
    }

    setErrors(newErrors)

    onCloseEditConcep()

    if (Object.keys(newErrors).length === 0) {
      const updatedConcepto = {
        ...editedConcepto,
        total: editedConcepto.tipo === '.' ? 0 : calculateTotal(editedConcepto.precio, editedConcepto.cantidad)
      };
      onSave(updatedConcepto);
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

    setEditedConcepto((prev) => ({
      ...prev,
      precio: numericValue,
    }))
  }

  return (
    <>
      <IconClose onOpenClose={onCloseEditConcep} />

      <div className={styles.addConceptForm}>
        <Form onSubmit={handleSubmit}>
          <FormField error={!!errors.tipo}>
            <Label>Tipo*</Label>
            <Dropdown
              placeholder="Seleccionar"
              fluid
              selection
              options={opcionesSerprod}
              value={editedConcepto.tipo}
              onChange={(e, { value }) => {
                if (value === '.') {
                  setEditedConcepto((prev) => ({
                    ...prev,
                    tipo: value,
                    concepto: '',
                    precio: '',
                    cantidad: '',
                    total: 0
                  }));
                } else {
                  setEditedConcepto((prev) => ({
                    ...prev,
                    tipo: value
                  }));
                }
              }}
            />
            {errors.tipo && <Message>{errors.tipo}</Message>}
          </FormField>
          <FormField error={!!errors.concepto}>
            <Label>Concepto*</Label>
            <Input
              value={editedConcepto.concepto}
              onChange={(e) =>
                setEditedConcepto({ ...editedConcepto, concepto: e.target.value })
              }
            />
            {errors.concepto && <Message>{errors.concepto}</Message>}
          </FormField>

          <FormField error={!!errors.precio}>
            <Label>Precio*</Label>
            <Input
              type="text"
              name="precio"
              value={formatCurrencyInput(editedConcepto.precio)}
              onChange={handlePrecioChange}
              disabled={editedConcepto.tipo === '.'}
            />
            {errors.precio && <Message>{errors.precio}</Message>}
          </FormField>

          <FormField error={!!errors.cantidad}>
            <Label>Qty*</Label>
            <Input
              type="number"
              name="cantidad"
              value={editedConcepto.cantidad}
              onChange={handleInputChange}
              disabled={editedConcepto.tipo === '.'}
            />
            {errors.cantidad && <Message>{errors.cantidad}</Message>}
          </FormField>

          <Button primary type="submit">
            Guardar
          </Button>

          <DatosOb />

        </Form>

        <IconDel setShowConfirmDel={() => onOpenCloseConfirm(concepto.index)} />

      </div>
    </>
  )
}
