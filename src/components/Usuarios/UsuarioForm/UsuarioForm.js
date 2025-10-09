import { Button, Dropdown, Form, FormField, FormGroup, Input, Label, Message } from 'semantic-ui-react'
import { useState } from 'react'
import axios from 'axios'
import { IconClose } from '@/components/Layouts'
import { genUserId } from '@/helpers'
import styles from './UsuarioForm.module.css'

export function UsuarioForm(props) {
  const { reload, onReload, onOpenCloseForm, onToastSuccess } = props;

  const [errors, setErrors] = useState({});
  const [credentials, setCredentials] = useState({
    nombre: '',
    usuario: '',
    cel: '',
    email: '',
    nivel: '',
    password: '',
    confirmarPassword: ''
  });

  const [error, setError] = useState(null);

  const handleChange = (e, { name, value }) => {
    setCredentials({
      ...credentials,
      [name]: value
    });
  };

  const validarFormSignUp = () => {
    const newErrors = {};

    if (!credentials.nombre) {
      newErrors.nombre = 'El campo es requerido'
    }

    if (!credentials.usuario) {
      newErrors.usuario = 'El campo es requerido'
    }

    if (!credentials.email) {
      newErrors.email = 'El campo es requerido'
    }

    if (!credentials.nivel) {
      newErrors.nivel = 'El campo es requerido'
    }

    if (!credentials.password) {
      newErrors.password = 'El campo es requerido'
    }

    if (!credentials.confirmarPassword) {
      newErrors.confirmarPassword = 'El campo es requerido'
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormSignUp()) {
      return;
    }
    setError(null);

    if (credentials.password !== credentials.confirmarPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    const folio = genUserId(4)
    const isactive = 1

    // Enviar datos al backend para crear el usuario
    try {
      await axios.post('/api/usuarios/usuarios', {
        folio,
        nombre: credentials.nombre,
        usuario: credentials.usuario,
        cel: credentials.cel,
        email: credentials.email,
        nivel: credentials.nivel,
        isactive,
        password: credentials.password
      });

      setCredentials({
        nombre: '',
        usuario: '',
        cel: '',
        email: '',
        nivel: '',
        password: '',
        confirmarPassword: ''
      });

      await axios.post('/api/notificaciones', 
        {
          title: 'Usuario creado',
          body: `${nombre}`,
          data: {
            url: '/usuarios' 
          }
        },
        {
          headers: {
            'Content-Type': 'application/json', 
          },
        }
      )

      setError(null);
      onReload()
      onOpenCloseForm()
      onToastSuccess()
    } catch (error) {
      console.error('Error capturado:', error);

      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('¡ Ocurrió un error inesperado !');
      }
    }
  };

  return (
    <>
      <IconClose onOpenClose={onOpenCloseForm} />

      <div className={styles.main}>
        <div className={styles.container}>
          <Form onSubmit={handleSubmit}>
            <FormGroup widths='equal'>
              <FormField error={!!errors.nombre}>
                <Label>Nombre</Label>
                <Input
                  name='nombre'
                  type='text'
                  value={credentials.nombre}
                  onChange={handleChange}
                />
                {errors.nombre && <Message negative>{errors.nombre}</Message>}
              </FormField>
              <FormField error={!!errors.usuario}>
                <Label>Usuario</Label>
                <Input
                  name='usuario'
                  type='text'
                  value={credentials.usuario}
                  onChange={handleChange}
                />
                {errors.usuario && <Message negative>{errors.usuario}</Message>}
              </FormField>
              <FormField>
                <Label>Cel</Label>
                <Input
                  name='cel'
                  type='text'
                  value={credentials.cel}
                  onChange={handleChange}
                />
                {errors.cel && <Message negative>{errors.cel}</Message>}
              </FormField>
              <FormField error={!!errors.email}>
                <Label>Correo</Label>
                <Input
                  name='email'
                  type='email'
                  value={credentials.email}
                  onChange={handleChange}
                />
                {errors.email && <Message negative>{errors.email}</Message>}
              </FormField>
              <FormField error={!!errors.nivel}>
                <Label>Nivel</Label>
                <Dropdown
                  placeholder='Selecciona nivel'
                  fluid
                  selection
                  options={[
                    { key: 'admin', text: 'admin', value: 'admin' },
                    { key: 'usuariosu', text: 'usuariosu', value: 'usuariosu' },
                    { key: 'usuario', text: 'usuario', value: 'usuario' },
                    { key: 'técnico', text: 'técnico', value: 'técnico' }
                  ]}
                  name='nivel'
                  value={credentials.nivel}
                  onChange={handleChange}
                />
                {errors.nivel && <Message negative>{errors.nivel}</Message>}
              </FormField>
              <FormField error={!!errors.password}>
                <Label>Contraseña</Label>
                <Input
                  name='password'
                  type='password'
                  value={credentials.password}
                  onChange={handleChange}
                />
                {errors.password && <Message negative>{errors.password}</Message>}
              </FormField>
              <FormField error={!!errors.confirmarPassword}>
                <Label>Confirmar contraseña</Label>
                <Input
                  name='confirmarPassword'
                  type='password'
                  value={credentials.confirmarPassword}
                  onChange={handleChange}
                />
                {errors.confirmarPassword && <Message negative>{errors.confirmarPassword}</Message>}
              </FormField>
            </FormGroup>
            {error && <p className={styles.error}>{error}</p>}
            <Button primary type='submit'>
              Crear
            </Button>
          </Form>
        </div>
      </div>
    </>
  );
}
