import { Button, Form, FormField, FormGroup, Input, Label } from 'semantic-ui-react'
import { IconClose } from '@/components/Layouts'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import axios from 'axios'
import styles from './UsuarioFormPDF.module.css'

export function UsuarioFormPDF(props) {

  const {user, reload, onReload, onOpenCloseFormPDF} = props

  const [isLoading, setIsLoading] = useState(false)

  const [fila1, setFila1] = useState('')
  const [fila2, setFila2] = useState('')
  const [fila3, setFila3] = useState('')
  const [fila4, setFila4] = useState('')
  const [fila5, setFila5] = useState('')
  const [fila7, setFila7] = useState('')

  const crearDatoPDF = async (e) => {
    e.preventDefault()

    setIsLoading(true)

    try {
      await axios.post('/api/usuarios/datos_pdf', {
        usuario_id: user.id,
        fila1,
        fila2,
        fila3,
        fila4,
        fila5,
        fila7
      })

      setFila1('')
      setFila2('')
      setFila3('')
      setFila4('')
      setFila5('')
      setFila7('')

      onReload()
      onOpenCloseFormPDF()
    } catch (error) {
      console.error('Error al crear el datoPDF:', error)

    } finally {
        setIsLoading(false)
    }
  }

  return (
    
    <>

    <IconClose onOpenClose={onOpenCloseFormPDF} />
    
      <div className={styles.main}>
      <Form>
          <FormGroup widths='equal'>
            <FormField>
              <Label>Nombre de mi negocio</Label>
              <Input
                type="text"
                value={fila1 || ''}
                onChange={(e) => setFila1(e.target.value)}
              />
            </FormField>
            <FormField>
              <Label>Calle / Número</Label>
              <Input
                type="text"
                value={fila2 || ''}
                onChange={(e) => setFila2(e.target.value)}
              />
            </FormField>
            <FormField>
              <Label>Colonia</Label>
              <Input
                type="text"
                value={fila3 || ''}
                onChange={(e) => setFila3(e.target.value)}
              />
            </FormField>
            <FormField>
              <Label>Código postal</Label>
              <Input
                type="text"
                value={fila4 || ''}
                onChange={(e) => setFila4(e.target.value)}
              />
            </FormField>
            <FormField>
              <Label>Ciudad / Estado</Label>
              <Input
                type="text"
                value={fila5 || ''}
                onChange={(e) => setFila5(e.target.value)}
              />
            </FormField>
            <FormField>
              <Label>Teléfono</Label>
              <Input
                type="text"
                value={fila7 || ''}
                onChange={(e) => setFila7(e.target.value)}
              />
            </FormField>
          </FormGroup>
        </Form>
        <Button primary loading={isLoading} onClick={crearDatoPDF}>Guardar</Button>
      </div>
    
    </>

  )
}
