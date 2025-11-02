import { Button, Dropdown, Form, FormField, FormGroup, Label, Input, Message } from 'semantic-ui-react'
import { useState } from 'react'
import styles from './ConceptosForm.module.css'
import { DatosOb, IconClose } from '@/components/Layouts'
import { formatCurrencyInput, parseCurrencyInput } from '@/helpers'

export function ConceptosForm(props) {
  const { añadirConcepto, onOpenCloseConcep } = props

  const [isLoading, setIsLoading] = useState(false)

  const [newConcept, setNuevoConcepto] = useState({ tipo: '', concepto: '', precio: '', cantidad: '' })
  const [errors, setErrors] = useState({})

  const validarFormConceptos = () => {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNuevoConcepto((prevState) => {
      const updatedConcepto = { ...prevState, [name]: value }
      if (name === 'precio' || name === 'cantidad') {
        updatedConcepto.total = (updatedConcepto.precio || 0) * (updatedConcepto.cantidad || 0)
      }
      return updatedConcepto
    })
  }

  const handleTipoChange = (e, { value }) => {
    setNuevoConcepto({
      ...newConcept,
      tipo: value,
      concepto: value === '.' ? '' : newConcept.concepto,
      precio: value === '.' ? '' : newConcept.precio,
      cantidad: value === '.' ? '' : newConcept.cantidad
    })
  }

  const handleAddConcepto = async (e) => {
    e.preventDefault()

    if (!validarFormConceptos()) return

    setIsLoading(true)
    try {
      const conceptoConTotal = { ...newConcept, total: newConcept.total }
      await añadirConcepto(conceptoConTotal)
      setNuevoConcepto({ tipo: '', concepto: '', precio: '', cantidad: '', total: 0 })
      onOpenCloseConcep()
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

    setNuevoConcepto((prev) => ({
      ...prev,
      precio: numericValue,
    }))
  }

  return (
    <>
      <IconClose onOpenClose={onOpenCloseConcep} />
      <Form>
        <FormGroup widths='equal'>
          <FormField error={!!errors.tipo}>
            <Label>Tipo*</Label>
            <Dropdown
              placeholder='Seleccionar'
              fluid
              selection
              options={opcionesSerprod}
              value={newConcept.tipo}
              onChange={handleTipoChange}
            />
            {errors.tipo && <Message negative>{errors.tipo}</Message>}
          </FormField>

          <FormField error={!!errors.concepto}>
            <Label>Concepto*</Label>
            <Input
              type="text"
              name="concepto"
              value={newConcept.concepto}
              onChange={handleInputChange}
              disabled={newConcept.tipo === '.'}
            />
            {errors.concepto && <Message negative>{errors.concepto}</Message>}
          </FormField>

          <FormField error={!!errors.precio}>
            <Label>Precio*</Label>
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
            <Label>Qty*</Label>
            <Input
              type="number"
              name="cantidad"
              value={newConcept.cantidad}
              onChange={handleInputChange}
              disabled={newConcept.tipo === '.'}
            />
            {errors.cantidad && <Message negative>{errors.cantidad}</Message>}
          </FormField>
        </FormGroup>

        <Button primary loading={isLoading} onClick={handleAddConcepto}>Agregar</Button>
        <DatosOb />
      </Form>
    </>
  )
}
