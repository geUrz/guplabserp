import { Button, Dropdown, Form, FormField, FormGroup, Image, Input, Label, Message } from 'semantic-ui-react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useRedirectIfAuthenticated } from '@/hooks'
import styles from './signup.module.css'
import { useAuth } from '@/contexts'
import { Loading } from '@/components/Layouts'

export default function Signup() {

  const {loading} = useAuth()

  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)

  const [theme, setTheme] = useState(null)

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme')
    setTheme(storedTheme) // puede ser 'light' o 'dark'
  }, [])

  const [errors, setErrors] = useState({})

  const [credentials, setCredentials] = useState({
    nombre: '',
    usuario: '',
    email: '',
    cel: '',
    nivel: '',
    password: '',
    confirmarPassword: ''
  });

  useRedirectIfAuthenticated()

  const [error, setError] = useState(null)

  const handleChange = (e, { name, value }) => {
    setCredentials({
      ...credentials,
      [name]: value
    })
  }

  const validarFormSignUp = () => {
    const newErrors = {}

    if (!credentials.nombre) {
      newErrors.nombre = 'El campo es requerido'
    }

    if (!credentials.usuario) {
      newErrors.usuario = 'El campo es requerido'
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

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validarFormSignUp()) {
      return
    }

    setIsLoading(true)
    setError(null)

    if (credentials.password !== credentials.confirmarPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      await axios.post('/api/auth/register', credentials)

      router.push('/join/signin')

      setCredentials({
        nombre: '',
        usuario: '',
        email: '',
        cel: '',
        nivel: '',
        password: '',
        confirmarPassword: ''
      })

      setError(null)
    } catch (error) {
      console.error('Error capturado:', error);

      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error); // Error específico del backend
      } else if (error.message) {
        setError(error.message)
      } else {
        setError('¡ Ocurrió un error inesperado !')
      }
    } finally {
        setIsLoading(false)
    }
  }

  if (loading) {
        return <Loading size={45} loading={0} />
      }

  return (

    <>

      <div className={styles.main}>
        <div className={styles.boxForm}>

          <div className={styles.logo}>
            <Image src={theme != 'dark' ? '/img/logoB.webp' : '/img/logoW.webp'} />
          </div>

          <div className={styles.h1}>
            <h1>Crear usuario</h1>
          </div>

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <FormField error={!!errors.nombre}>
                <Label>Nombre</Label>
                <Input
                  name='nombre'
                  type='text'
                  value={credentials.nombre}
                  onChange={handleChange}
                />
                {errors.nombre && <Message>{errors.nombre}</Message>}
              </FormField>
              <FormField error={!!errors.usuario}>
                <Label>Usuario</Label>
                <Input
                  name='usuario'
                  type='text'
                  value={credentials.usuario}
                  onChange={handleChange}
                />
                {errors.usuario && <Message>{errors.usuario}</Message>}
              </FormField>
              <FormField>
                <Label>Correo</Label>
                <Input
                  name='email'
                  type='email'
                  value={credentials.email}
                  onChange={handleChange}
                />
              </FormField>
              <FormField>
                <Label>Celular</Label>
                <Input
                  name='cel'
                  type='text'
                  value={credentials.cel}
                  onChange={handleChange}
                />
              </FormField>
              <FormField error={!!errors.nivel}>
                <Label>Nivel</Label>
                <Dropdown
                  placeholder='Seleccionar'
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
                {errors.nivel && <Message>{errors.nivel}</Message>}
              </FormField>
              <FormField error={!!errors.password}>
                <Label>Contraseña</Label>
                <Input
                  name='password'
                  type='password'
                  value={credentials.password}
                  onChange={handleChange}
                />
                {errors.password && <Message>{errors.password}</Message>}
              </FormField>
              <FormField error={!!errors.confirmarPassword}>
                <Label>Confirmar contraseña</Label>
                <Input
                  name='confirmarPassword'
                  type='password'
                  value={credentials.confirmarPassword}
                  onChange={handleChange}
                />
                {errors.confirmarPassword && <Message>{errors.confirmarPassword}</Message>}
              </FormField>
            </FormGroup>
            {error && <Message>{error}</Message>}
            <Button primary loading={isLoading} type='submit'>Crear usuario</Button>
          </Form>

          <div className={styles.link}>
            <Link href='/join/signin'>
              Iniciar sesión
            </Link>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.section}>
            <h1>© 2025 GUPLabs</h1>
          </div>
        </div>

      </div>

    </>

  )
}
