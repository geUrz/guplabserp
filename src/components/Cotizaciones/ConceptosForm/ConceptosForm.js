import { Button, Dropdown, Form, FormField, FormGroup, Label, Input, Message } from 'semantic-ui-react';
import { useState } from 'react';
import styles from './ConceptosForm.module.css';
import { DatosOb, IconClose } from '@/components/Layouts';
import { formatCurrencyInput, parseCurrencyInput } from '@/helpers';

export function ConceptosForm(props) {
  const { añadirConcepto, onOpenCloseConcep } = props;
  const [nuevoConcepto, setNuevoConcepto] = useState({ tipo: '', concepto: '', precio: '', cantidad: '' })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const opcionesSerprod = [
    { key: 1, text: 'Servicio', value: 'Servicio' },
    { key: 2, text: 'Producto', value: 'Producto' },
    { key: 3, text: '<vacio>', value: '.' }
  ];

  const validarFormConceptos = () => {
    const newErrors = {};

    if (nuevoConcepto.tipo !== '.') {
      if (!nuevoConcepto.tipo) newErrors.tipo = 'El tipo es requerido';
      if (!nuevoConcepto.concepto) newErrors.concepto = 'El concepto es requerido';
      if (!nuevoConcepto.precio || nuevoConcepto.precio <= 0) newErrors.precio = 'El precio es requerido y debe ser mayor a 0';
      if (!nuevoConcepto.cantidad || nuevoConcepto.cantidad <= 0) newErrors.cantidad = 'La cantidad es requerida y debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoConcepto((prevState) => {
      const updatedConcepto = { ...prevState, [name]: value };
      if (name === 'precio' || name === 'cantidad') {
        updatedConcepto.total = (updatedConcepto.precio || 0) * (updatedConcepto.cantidad || 0);
      }
      return updatedConcepto;
    });
  };

  const handleTipoChange = (e, { value }) => {
    setNuevoConcepto({
      ...nuevoConcepto,
      tipo: value,
      concepto: value === '.' ? '' : nuevoConcepto.concepto,
      precio: value === '.' ? '' : nuevoConcepto.precio,
      cantidad: value === '.' ? '' : nuevoConcepto.cantidad
    })
  }

  const handleAddConcepto = async () => {
    if (!validarFormConceptos()) return

    setIsLoading(true)
    try {
      await añadirConcepto(nuevoConcepto)
      setNuevoConcepto({ tipo: '', concepto: '', precio: '', cantidad: '', total: 0 })
      onOpenCloseConcep()
    } finally {
      setIsLoading(false)
    }
  }

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
              value={nuevoConcepto.tipo}
              onChange={handleTipoChange}
            />
            {errors.tipo && <Message negative>{errors.tipo}</Message>}
          </FormField>
          <FormField error={!!errors.concepto}>
            <Label>Concepto*</Label>
            <Input
              type='text'
              value={nuevoConcepto.concepto}
              onChange={handleInputChange}
              name='concepto'
            />
            {errors.concepto && <Message negative>{errors.concepto}</Message>}
          </FormField>
          <FormField error={!!errors.precio}>
            <Label>Precio*</Label>
            <Input
              type="text"
              name="precio"
              value={formatCurrencyInput(nuevoConcepto.precio)}
              onChange={handlePrecioChange}
              disabled={nuevoConcepto.tipo === '.'}
            />
            {errors.precio && <Message negative>{errors.precio}</Message>}
          </FormField>
          <FormField error={!!errors.cantidad}>
            <Label>Qty*</Label>
            <Input
              type='number'
              value={nuevoConcepto.cantidad}
              onChange={handleInputChange}
              name='cantidad'
              disabled={nuevoConcepto.tipo === '.'}
            />
            {errors.cantidad && <Message negative>{errors.cantidad}</Message>}
          </FormField>
        </FormGroup>
        <Button primary loading={isLoading} onClick={handleAddConcepto}>Agregar</Button>

        <DatosOb />

      </Form>
    </>
  );
}
