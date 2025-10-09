import { useState } from 'react'
import { IconClose } from '@/components/Layouts'
import { Button, Dropdown, Form, FormField, FormGroup, Input, Label, Message } from 'semantic-ui-react'
import axios from 'axios'
import styles from './ReciboConceptosForm.module.css'

export function ReciboConceptosForm(props) {

  const { reload, onReload, reciboId, onAddConcept, onOpenCloseConcep} = props

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

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleAddConcept = async () => {

    if (!validateForm()) {
      return
    }

    if (newConcept.tipo && newConcept.concepto && newConcept.precio && newConcept.cantidad) {

      const total = newConcept.precio * newConcept.cantidad

      try {
        const response = await axios.post(`/api/recibos/conceptos`, {
          recibo_id: reciboId,
          ...newConcept,
          total
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
        //console.error('Error al agregar el concepto:', error.response?.data || error.message || error)
      }
    } else {
      console.warn('Datos incompletos o inválidos para agregar concepto', newConcept)
    }
  }

  const opcionesSerprod = [
    { key: 1, text: 'Servicio', value: 'Servicio' },
    { key: 2, text: 'Producto', value: 'Producto' }
  ]

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
                type="number"
                name="precio"
                value={newConcept.precio}
                onChange={handleChange}
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
              />
              {errors.cantidad && <Message negative>{errors.cantidad}</Message>}
            </FormField>
          </FormGroup>
          <Button primary onClick={handleAddConcept}>
            Añadir
        </Button>
        </Form>

      </div>

    </>

  )
}
