import { Button, Dropdown, Form, FormField, Label, Input, Message } from 'semantic-ui-react';
import { useState, useEffect } from 'react';
import styles from './ConceptosEditForm.module.css';
import { IconClose } from '@/components/Layouts';
import { FaTrash } from 'react-icons/fa';

export function ConceptosEditForm(props) {
  const { concepto, onSave, onCloseEditConcep, onOpenCloseConfirm } = props;

  const [editedConcepto, setEditedConcepto] = useState(concepto);
  const [errors, setErrors] = useState({});

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!editedConcepto.tipo) newErrors.tipo = 'El campo es requerido';
    if (!editedConcepto.concepto) newErrors.concepto = 'El campo es requerido';
    if (!editedConcepto.precio) newErrors.precio = 'El campo precio es requerido';
    if (!editedConcepto.cantidad) newErrors.cantidad = 'El campo cantidad es requerido';

    setErrors(newErrors);

    onCloseEditConcep();

    if (Object.keys(newErrors).length === 0) {
      // Enviar el total junto con el resto de los datos
      const updatedConcepto = { ...editedConcepto, total: editedConcepto.total };

      // Llamamos a onSave para enviar el concepto con el total
      onSave(updatedConcepto);
    }
  };

  const opcionesSerprod = [
    { key: 1, text: 'Servicio', value: 'Servicio' },
    { key: 2, text: 'Producto', value: 'Producto' },
  ];

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
              type="number"
              name="precio"
              value={editedConcepto.precio}
              onChange={handleInputChange}
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
            />
            {errors.cantidad && <Message negative>{errors.cantidad}</Message>}
          </FormField>

          <Button primary type="submit">
            Guardar
          </Button>
        </Form>

        <div className={styles.iconDel}>
          <div>
            <FaTrash onClick={() => onOpenCloseConfirm(editedConcepto)} />
          </div>
        </div>
      </div>
    </>
  );
}
