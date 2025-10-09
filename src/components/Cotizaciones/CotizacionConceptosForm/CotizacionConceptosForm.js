import { useState } from 'react'
import { IconClose } from '@/components/Layouts'
import { Button, Dropdown, Form, FormField, FormGroup, Input, Label, Message } from 'semantic-ui-react'
import axios from 'axios'
import styles from './CotizacionConceptosForm.module.css'
import { formatCurrencyInput, parseCurrencyInput } from '@/helpers'

export function CotizacionConceptosForm(props) {

  const { reload, onReload, cotizacionId, onAddConcept, onOpenCloseConcep, onToastSuccess } = props

  const [isLoading, setIsLoading] = useState(false)

  const [newConcept, setNewConcept] = useState({ tipo: '', concepto: '', precio: '', cantidad: '' })
  const [errors, setErrors] = useState({})

  const handleChange = (e, { name, value }) => {
    setNewConcept((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    // Validar solo si tipo no es "<vacio>"
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

  const handleAddConcept = async () => {

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    if (newConcept.tipo && (newConcept.tipo === '.' || (newConcept.concepto && newConcept.precio && newConcept.cantidad))) {
      try {
        const response = await axios.post(`/api/cotizaciones/conceptos`, {
          cotizacion_id: cotizacionId,
          ...newConcept,
        })

        if ((response.status === 200 || response.status === 201) && response.data) {
          const { id } = response.data
          if (id) {
            const newConceptWithId = { ...newConcept, id }
            onAddConcept(newConceptWithId)
            setNewConcept({ tipo: '', concepto: '', precio: '', cantidad: '' })

            onReload()
            onOpenCloseConcep()

          } else {
            console.error('Error al agregar el concepto: El ID no se encuentra en la respuesta del servidor', response);
          }
        } else {
          console.error('Error al agregar el concepto: Respuesta del servidor no fue exitosa', response)
        }
      } catch (error) {
      } finally {
        setIsLoading(false)
      }
    } else {
      console.warn('Datos incompletos o inválidos para agregar concepto', newConcept)
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

  return (

    <>

      <IconClose onOpenClose={onOpenCloseConcep} />

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
                disabled={newConcept.tipo === '.'}  // Deshabilitar si el tipo es "<vacio>"
              />
              {errors.cantidad && <Message negative>{errors.cantidad}</Message>}
            </FormField>
          </FormGroup>
          <Button primary loading={isLoading} onClick={handleAddConcept}>
            Agregar
          </Button>
        </Form>

      </div>

    </>

  )
}
