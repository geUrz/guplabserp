import styles from './ConceptosEditForm.module.css';
import { Button, Dropdown, Form, FormField, Label, Input, Message } from 'semantic-ui-react';
import { useState, useEffect } from 'react';
import { DatosOb, IconClose, IconDel } from '@/components/Layouts';
import { formatCurrencyInput, parseCurrencyInput } from '@/helpers';

export function ConceptosEditForm(props) {
  const { concepto, onSave, onCloseEditConcep, onOpenCloseConfirm } = props

  const [isLoading, setIsLoading] = useState(false)

  const [editedConcepto, setEditedConcepto] = useState(concepto);
  const [errors, setErrors] = useState({});

  const validarFormConceptos = () => {
    const newErrors = {}

    if (editedConcepto.tipo !== '.') {
      if (!editedConcepto.tipo) {
        newErrors.tipo = 'El campo es requerido'
      }
      if (!editedConcepto.concepto) {
        newErrors.concepto = 'El campo es requerido'
      }
      if (!editedConcepto.cantidad || editedConcepto.cantidad <= 0) {
        newErrors.cantidad = 'El campo es requerido'
      }
      if (!editedConcepto.precio || editedConcepto.precio <= 0) {
        newErrors.precio = 'El campo es requerido'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  useEffect(() => {
    setEditedConcepto(concepto);
  }, [concepto]);

  // Función para calcular el total cuando cambian precio o cantidad
  const calculateTotal = (precio, cantidad) => {
    return parseFloat(precio || 0) * parseInt(cantidad || 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setEditedConcepto((prevState) => {
      const updatedConcepto = { ...prevState, [name]: value };

      // Si cambiaron precio o cantidad, recalculamos el total
      if (name === 'precio' || name === 'cantidad') {
        updatedConcepto.total = calculateTotal(updatedConcepto.precio, updatedConcepto.cantidad);
      }

      return updatedConcepto;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validarFormConceptos()) return

    setIsLoading(true)

    try {
      const updatedConcepto = { ...editedConcepto, total: editedConcepto.total }

      onSave(updatedConcepto);
      
      onCloseEditConcep()
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
              placeholder="Selecciona una opción"
              fluid
              selection
              options={opcionesSerprod}
              value={editedConcepto.tipo}
              onChange={(e, { value }) =>
                setEditedConcepto({ ...editedConcepto, tipo: value })
              }
            />
            {errors.tipo && <Message negative>{errors.tipo}</Message>}
          </FormField>

          <FormField error={!!errors.concepto}>
            <Label>Concepto*</Label>
            <Input
              value={editedConcepto.concepto}
              onChange={(e) =>
                setEditedConcepto({ ...editedConcepto, concepto: e.target.value })
              }
            />
            {errors.concepto && <Message negative>{errors.concepto}</Message>}
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
            {errors.precio && <Message negative>{errors.precio}</Message>}
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
            {errors.cantidad && <Message negative>{errors.cantidad}</Message>}
          </FormField>

          <Button primary loading={isLoading} type="submit">
            Guardar
          </Button>

          <DatosOb />
        </Form>

        <IconDel onOpenDel={() => onOpenCloseConfirm(editedConcepto)} />
      </div>
    </>
  );
}
