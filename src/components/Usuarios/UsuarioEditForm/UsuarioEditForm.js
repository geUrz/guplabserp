import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Form, Button, Input, Label, FormGroup, FormField, Message, Dropdown } from 'semantic-ui-react'
import { IconClose } from '@/components/Layouts/IconClose/IconClose'
import styles from './UsuarioEditForm.module.css'
import { fetchNegocios } from '@/store/negocios/negocioSlice'
import { useDispatch, useSelector } from 'react-redux'
import { selectNegocios } from '@/store/negocios/negocioSelectors'
import { selectUsuario } from '@/store/usuarios/usuarioSelectors'
import { BasicModal } from '@/layouts'
import { NegocioForm } from '@/components/Negocios'
import { FaPlus } from 'react-icons/fa'
import { DatosOb } from '@/components/Layouts'

export function UsuarioEditForm(props) {
  const { user, logout, isAdmin, reload, onReload, onOpenCloseEdit, onToastSuccess } = props

  const dispatchUsr = useDispatch()
  const usuario = useSelector(selectUsuario)
  
  const logOut = () => {
    if (usuario?.id === user?.id) {
      logout()
    }
  }

  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    nombre: usuario?.nombre || '',
    usuario: usuario?.usuario || '',
    cel: usuario?.cel || '',
    email: usuario?.email || '',
    nivel: usuario?.nivel || '',
    negocio_id: usuario?.negocio_id,
    negocio_nombre: usuario?.negocio_nombre,
    isActive: usuario?.isactive ? 1 : 0,
    newPassword: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState({})

  const validarForm = () => {
    const newErrors = {};

    if (!formData.nombre) {
      newErrors.nombre = 'El campo es requerido'
    }

    if (!formData.usuario) {
      newErrors.usuario = 'El campo es requerido'
    }

    if (!formData.nivel) {
      newErrors.nivel = 'El campo es requerido'
    }

    if (formData.isActive === undefined || formData.isActive === '') {
      newErrors.isActive = 'El campo es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const [showNegocioForm, setShowNegocioForm] = useState(false)
  const onOpenCloseNegocioForm = () => setShowNegocioForm((prevState) => !prevState)

  const dispatch = useDispatch()
  const negocios = useSelector(selectNegocios)

  useEffect(() => {
    if (!isAdmin) return
    dispatch(fetchNegocios())
  }, [dispatch, reload, user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleDropdownChange = (e, { value }) => {
    const negocioSeleccionado = value ? negocios.find((negocio) => negocio.id === value) : null;

    setFormData({
      ...formData,
      negocio_id: value,
      negocio_nombre: negocioSeleccionado ? negocioSeleccionado.negocio : ''
    });
  }

  const handleSubmit = async (e) => {

    e.preventDefault()

    if (!validarForm()) {
      return
    }

    setIsLoading(true)

    try {
      await axios.put(`/api/usuarios/usuarios?id=${usuario?.id}`, {
        ...formData,
        negocio_id: formData.negocio_id === null ? null : formData.negocio_id,  // Aseguramos que si no se selecciona un negocio, se mande null
      })

      const res = await axios.get(`/api/usuarios/usuarios?id=${usuario?.id}`)
      dispatchUsr(updateUsuario(res.data))

      logOut()
      onReload()
      onOpenCloseEdit()
      onToastSuccess()

    } catch (error) {
      console.error('Error actualizando el usuario:', error.response?.data?.error || error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const opcionesNivel = [
    { key: 1, text: 'admin', value: 'admin' },
    { key: 2, text: 'usuariosu', value: 'usuariosu' },
    { key: 3, text: 'usuario', value: 'usuario' },
    { key: 4, text: 'técnico', value: 'técnico' }
  ]

  const opcionesIsActive = [
    { key: 1, text: 'Activo', value: 1 },
    { key: 2, text: 'Inactivo', value: 0 }
  ]

  return (
    <>
      <IconClose onOpenClose={onOpenCloseEdit} />
      <Form>
        <FormGroup widths='equal'>
          <FormField error={!!errors.nombre}>
            <Label>Nombre*</Label>
            <Input
              name='nombre'
              type='text'
              value={formData.nombre}
              onChange={handleChange}
            />
            {errors.nombre && <Message negative>{errors.nombre}</Message>}
          </FormField>
          <FormField error={!!errors.usuario}>
            <Label>Usuario*</Label>
            <Input
              name='usuario'
              type='text'
              value={formData.usuario}
              onChange={handleChange}
            />
            {errors.usuario && <Message negative>{errors.usuario}</Message>}
          </FormField>
          <FormField>
            <Label>Cel</Label>
            <Input
              name='cel'
              type='text'
              value={formData.cel}
              onChange={handleChange}
            />
            {errors.cel && <Message negative>{errors.cel}</Message>}
          </FormField>
          <FormField error={!!errors.email}>
            <Label>Correo*</Label>
            <Input
              name='email'
              type='email'
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <Message negative>{errors.email}</Message>}
          </FormField>
          <FormField error={!!errors.nivel}>
            <Label>Nivel*</Label>
            <Dropdown
              placeholder='Seleccionar'
              fluid
              selection
              options={opcionesNivel}
              value={formData.nivel}
              onChange={(e, { value }) => setFormData({ ...formData, nivel: value })}
            />
            {errors.nivel && <Message negative>{errors.nivel}</Message>}
          </FormField>

          {isAdmin &&

            <FormField>
              <Label>
                Negocio*
              </Label>
              <Dropdown
                placeholder={negocios.length === 0 ? 'No hay negocios' : 'Seleccionar'}
                fluid
                selection
                options={[
                  { key: 'none', text: 'Ninguno', value: null },
                  ...negocios.map(negocio => ({
                    key: negocio.id,
                    text: negocio.negocio,
                    value: negocio.id
                  }))
                ]}
                value={formData.negocio_id}
                onChange={handleDropdownChange}
                disabled={negocios.length === 0}
              />
              <div className={styles.addNegocio}>
                <h1>Crear negocio</h1>
                <FaPlus onClick={onOpenCloseNegocioForm} />
              </div>
            </FormField>

          }

          <FormField error={!!errors.isActive}>
            <Label>Activo*</Label>
            <Dropdown
              placeholder='Seleccionar'
              fluid
              selection
              options={opcionesIsActive}
              value={formData.isActive}
              onChange={(e, { value }) => setFormData({ ...formData, isActive: Number(value) })}
            />
            {errors.isActive && <Message negative>{errors.isActive}</Message>}
          </FormField>
        </FormGroup>
        <Button primary loading={isLoading} onClick={handleSubmit}>Guardar</Button>

        <DatosOb />

      </Form>

      <BasicModal title='crear negocio' show={showNegocioForm} onClose={onOpenCloseNegocioForm}>
        <NegocioForm user={user} reload={reload} onReload={onReload} onCloseForm={onOpenCloseNegocioForm} onToastSuccess={onToastSuccess} />
      </BasicModal>

    </>
  )
}
