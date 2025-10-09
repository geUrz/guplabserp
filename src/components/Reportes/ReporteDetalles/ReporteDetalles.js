import { IconClose, Confirm, UploadImg, FirmaDigital, IconEdit, IconDel } from '@/components/Layouts'
import { formatDateIncDet, getValueOrDefault } from '@/helpers'
import { BasicModal, ModalImg } from '@/layouts'
import { FaCheck, FaEdit, FaImage, FaPlus, FaTimes, FaTrash } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import { ReporteEditForm } from '../ReporteEditForm/ReporteEditForm'
import axios from 'axios'
import { useAuth } from '@/contexts/AuthContext'
import { Tab, Image, Form, FormGroup, FormField, Input, Button, TextArea, Label } from 'semantic-ui-react'
import { ReportePDF } from '../ReportePDF/ReportePDF'
import styles from './ReporteDetalles.module.css'
import { BiSolidToggleLeft, BiSolidToggleRight } from 'react-icons/bi'

export function ReporteDetalles(props) {

  const { reload, onReload, reporte: initialReporte, onCloseDetalles, onToastSuccessMod, onToastSuccessDel } = props;

  const { user } = useAuth()

  const [reporte, setReporte] = useState(initialReporte || {})
  const [showEditReporte, setShowEditReporte] = useState(false)
  const [showSubirImg, setShowSubirImg] = useState(false)
  const [selectedImageKey, setSelectedImageKey] = useState(null)
  const [showImg, setShowImg] = useState(false)
  const [selectedImg, setSelectedImg] = useState(null)
  const [currentTitle, setCurrentTitle] = useState('')
  const [currentTitleKey, setCurrentTitleKey] = useState(null)
  const [showEditTitleModal, setShowEditTitleModal] = useState(false)
  const [showFirmaTecModal, setShowFirmaTecModal] = useState(false)
  const [showFirmaCliModal, setShowFirmaCliModal] = useState(false)
  const [firmaTec, setFirmaTec] = useState(reporte.firmaTec || null)
  const [firmaCli, setFirmaCli] = useState(reporte.firmaCli || null)
  const [showConfirmFirmaTec, setShowConfirmFirmaTec] = useState(false)
  const [showConfirmFirmaCli, setShowConfirmFirmaCli] = useState(false)

  const [togglePagina2, setTogglePagina2] = useState(() => {
    const savedState = localStorage.getItem('togglePagina2');
    return savedState !== null ? JSON.parse(savedState) : false;
  })

  const onTogglePagina2 = () => {
    setTogglePagina2((prevState) => {
      const newState = !prevState;

      localStorage.setItem('togglePagina2', JSON.stringify(newState));
      return newState;
    })
  }

  const [toggleEvi, setToggleEvi] = useState(() => {
    const savedState = localStorage.getItem('toggleEvi');
    return savedState !== null ? JSON.parse(savedState) : false;
  })

  const onToggleEvi = () => {
    setToggleEvi((prevState) => {
      const newState = !prevState;

      localStorage.setItem('toggleEvi', JSON.stringify(newState));
      return newState;
    })
  }

  const [toggleEviAD, setToggleEviAD] = useState(() => {
    const savedState = localStorage.getItem('toggleEviAD');
    return savedState !== null ? JSON.parse(savedState) : false;
  })

  const onToggleEviAD = () => {
    setToggleEviAD((prevState) => {
      const newState = !prevState;

      localStorage.setItem('toggleEviAD', JSON.stringify(newState));
      return newState;
    })
  }

  const onOpenCloseFirmaTec = () => {
    setShowFirmaTecModal((prev) => !prev);
    if (!showFirmaTecModal) {
      fetchFirmaTec();  // Actualizar la firma del técnico
    }
  }

  const onOpenCloseFirmaCli = () => {
    setShowFirmaCliModal((prev) => !prev);
    if (!showFirmaCliModal) {
      fetchFirmaCli();  // Actualizar la firma del cliente
    }
  }

  const onOpenCloseConfirmFirmaTec = () => setShowConfirmFirmaTec((prev) => !prev)
  const onOpenCloseConfirmFirmaCli = () => setShowConfirmFirmaCli((prev) => !prev)

  useEffect(() => {
    fetchFirmaTec()
    fetchFirmaCli()
  }, [])

  const onOpenEditReporte = () => setShowEditReporte((prevState) => !prevState)

  const [showConfirmDel, setShowConfirmDel] = useState(false)

  const onOpenCloseConfirmDel = () => setShowConfirmDel((prevState) => !prevState)

  const [imgKeyToDelete, setImgKeyToDelete] = useState(null)

  const openImg = (imgUrl, imgKey) => {
    setSelectedImg(imgUrl)
    setImgKeyToDelete(imgKey)
    setShowImg(true)
  }

  const onShowSubirImg = (imgKey) => {
    setSelectedImageKey(imgKey)
    setShowSubirImg(true)
  }

  const onCloseSubirImg = () => {
    setShowSubirImg(false)
    setSelectedImageKey(null)
  }

  const [reporteState, setReporteState] = useState(reporte)

  useEffect(() => {
    setReporteState(reporte)
  }, [reporte])

  const [showConfirmDelImg, setShowConfirmDelImg] = useState(null)
  const [imageToDelete, setImageToDelete] = useState(null)

  const handleDeleteReporte = async () => {
    if (reporte?.id) {
      try {
        await axios.delete(`/api/reportes/reportes?id=${reporte.id}`)
        setReporte(null)
        onReload()
        onToastSuccessDel()
        onCloseDetalles()
      } catch (error) {
        console.error('Error al eliminar el reporte:', error)
      }
    } else {
      console.error('Reporte o ID no disponible')
    }
  }

  const handleDeleteImage = async () => {
    try {
      await axios.delete(`/api/reportes/uploadImage`, {
        params: {
          id: reporte.id,
          imageKey: imgKeyToDelete,
        },
      })

      setReporte((prevVisitatecnica) => ({
        ...prevVisitatecnica,
        [imgKeyToDelete]: null,
      }))

      onReload()
      setShowImg(false)
      setShowConfirmDelImg(false)
    } catch (error) {
      console.error('Error al eliminar la imagen:', error)
    }
  }

  const onShowConfirmDelImg = (imgKey) => {
    setImageToDelete(imgKey)
    setShowConfirmDelImg(true)
  }

  const handleImageUploadSuccess = (imageKey, imageUrl) => {
    setReporte({ ...reporte, [imageKey]: imageUrl })
    setShowSubirImg(false)
  }

  const MAX_TITLE_LENGTH = 60

  const handleTitleChange = (e) => {
    const newTitle = e.target.value || ''
    if (newTitle.length <= MAX_TITLE_LENGTH) {
      setCurrentTitle(newTitle)
    }
  }


  const handleEditTitle = (title, key) => {
    setCurrentTitle(title)
    setCurrentTitleKey(key)
    setShowEditTitleModal(true)
  }

  const handleSaveTitle = async () => {
    try {
      await axios.put(`/api/reportes/uploadTitle`, {
        id: reporte.id,
        titleKey: currentTitleKey,
        titleValue: currentTitle,
      })

      setReporte((prev) => ({
        ...prev,
        [currentTitleKey]: currentTitle,
      }))

      setShowEditTitleModal(false)
      onReload()
    } catch (error) {
      console.error('Error al guardar el título:', error)
    }
  }

  const [page2, setPage2] = useState(reporte.page2 || '')
  const [editPage2, setEditPage2] = useState(!!reporte.page2)
  const maxCharactersPage2 = 6200

  const handlePage2Change = (e) => {
    const { value } = e.target
    if (value.length <= maxCharactersPage2) {
      setPage2(value)
    }
  }

  const handleAddPage2 = async () => {
    if (!reporte.id) {
      console.error('ID del reporte no disponible')
      return
    }

    try {
      const response = await axios.put(`/api/reportes/createPage2`, {
        id: reporte.id,
        page2Value: page2
      })

      if (response.status === 200) {
        setEditPage2(true)
        onReload()
      }

    } catch (error) {
      console.error('Error al actualizar la page2:', error.response?.data || error.message)
    }
  }

  useEffect(() => {
    if (reporte.page2) setEditPage2(true)
  }, [reporte])

  const [nota, setNota] = useState(reporte.nota || '')
  const [editNota, setEditNota] = useState(!!reporte.nota)
  const maxCharacters = 460

  const handleNotaChange = (e) => {
    const { value } = e.target
    if (value.length <= maxCharacters) {
      setNota(value)
    }
  }

  const handleAddNota = async () => {
    if (!reporte.id) {
      console.error("ID del reporte no disponible")
      return
    }

    try {
      const response = await axios.put(`/api/reportes/createNota`, {
        id: reporte.id,
        notaValue: nota
      })

      if (response.status === 200) {
        setEditNota(true)
        setReporteData(prevState => ({
          ...prevState,
          nota: nota
        }))
        onReload()
      }
    } catch (error) {
      console.error('Error al actualizar la nota:', error.response?.data || error.message)
    }
  }

  useEffect(() => {
    if (reporte.nota) setEditNota(true)
  }, [reporte])

  const [reporteData, setReporteData] = useState(reporte)

  useEffect(() => {
    setReporteData(reporte) 
  }, [reporte]) 

  const actualizarReporte = (nuevaData) => {
    setReporteData((prevState) => ({
      ...prevState,
      ...nuevaData, 
    }))
  }

  const fetchFirmaTec = async () => {
    try {
      const response = await axios.get(`/api/reportes/reportes?id=${reporte.id}`);
      if (response.data.firmaTec) {
        setFirmaTec(response.data.firmaTec);  // Actualiza el estado con la firma
      }
    } catch (error) {
      console.error('Error al obtener la firma del técnico:', error);
    }
  }

  const fetchFirmaCli = async () => {
    try {
      const response = await axios.get(`/api/reportes/reportes?id=${reporte.id}`);
      if (response.data.firmaCli) {
        setFirmaCli(response.data.firmaCli);  // Actualiza el estado con la firma
      }
    } catch (error) {
      console.error('Error al obtener la firma del cliente:', error);
    }
  }

  const removeFirmaTec = async () => {
    try {
      await axios.put(`/api/reportes/createFirmaTec`, {
        id: reporte.id,
        firmaValue: null
      })
      setFirmaTec(null)
      onOpenCloseConfirmFirmaTec()
    } catch (error) {
      console.error('Error al eliminar la firma del técnico:', error)
    }
  }

  const removeFirmaCli = async () => {
    try {
      await axios.put(`/api/reportes/createFirmaCli`, {
        id: reporte.id,
        firmaValue: null
      })
      setFirmaCli(null)
      onOpenCloseConfirmFirmaCli()
    } catch (error) {
      console.error('Error al eliminar la firma del cliente:', error)
    }
  }

  const imageKeys1 = ['img1', 'img2', 'img3', 'img4', 'img5', 'img6', 'img7', 'img8', 'img9', 'img10']
  const imageKeys2 = ['img11', 'img12', 'img13', 'img14', 'img15', 'img16', 'img17', 'img18', 'img19', 'img20']


  const panes = [
    {
      menuItem: 'Evidencias',
      render: () => (
        <Tab.Pane className={styles.mainTabPane}>
          <div className={styles.tabContent}>
            {imageKeys1.map((imgKey, index) => (
              <div key={imgKey}>
                {reporte[imgKey] === null ? (
                  <FaImage onClick={() => onShowSubirImg(imgKey)} />
                ) : (
                  <>
                    <Image src={reporte[imgKey]} onClick={() => openImg(reporte[imgKey], imgKey)} />
                    <h1>{reporte[`title${index + 1}`] || 'Sin título'}</h1>
                    <div
                      className={styles.editTitle}
                      onClick={() =>
                        handleEditTitle(reporte[`title${index + 1}`], `title${index + 1}`)
                      }
                    >
                      <FaEdit />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </Tab.Pane>
      ),
    }
  ]

  const panesAD = [
    {
      menuItem: 'Antes',
      render: () => (
        <Tab.Pane className={styles.mainTabPane}>
          <div className={styles.tabContent}>
            {imageKeys1.map((imgKey, index) => (
              <div key={imgKey}>
                {reporte[imgKey] === null ? (
                  <FaImage onClick={() => onShowSubirImg(imgKey)} />
                ) : (
                  <>
                    <Image src={reporte[imgKey]} onClick={() => openImg(reporte[imgKey], imgKey)} />
                    <h1>{reporte[`title${index + 1}`] || 'Sin título'}</h1>
                    <div
                      className={styles.editTitle}
                      onClick={() =>
                        handleEditTitle(reporte[`title${index + 1}`], `title${index + 1}`)
                      }
                    >
                      <FaEdit />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </Tab.Pane>
      ),
    },
    {
      menuItem: 'Después',
      render: () => (
        <Tab.Pane className={styles.mainTabPane}>
          <div className={styles.tabContent}>
            {imageKeys2.map((imgKey, index) => (
              <div key={imgKey}>
                {reporte[imgKey] === null ? (
                  <FaImage onClick={() => onShowSubirImg(imgKey)} />
                ) : (
                  <>
                    <Image src={reporte[imgKey]} onClick={() => openImg(reporte[imgKey], imgKey)} />
                    <h1>{reporte[`title${index + 11}`] || 'Sin título'}</h1> {/* Usar el índice correctamente */}
                    <div
                      className={styles.editTitle}
                      onClick={() =>
                        handleEditTitle(reporte[`title${index + 11}`], `title${index + 11}`)
                      }
                    >
                      <FaEdit />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </Tab.Pane>
      ),
    },
  ]

  return (
    <>
      <IconClose onOpenClose={onCloseDetalles} />

      <div className={styles.section}>
        <div className={styles.box1}>
          <div className={styles.box1_1}>
            <div>
              <h1>Reporte</h1>
              <h2>{getValueOrDefault(reporteData?.reporte)}</h2>
            </div>
            <div>
              <h1>Descripción</h1>
              <h2>{getValueOrDefault(reporteData?.descripcion)}</h2>
            </div>
            <div>
              <h1>Cliente</h1>
              <h2>{getValueOrDefault(reporteData?.cliente_nombre)}</h2>
            </div>
          </div>
          <div className={styles.box1_2}>
            <div>
              <h1>Folio</h1>
              <h2>{getValueOrDefault(reporteData?.folio)}</h2>
            </div>
            <div>
              <h1>Fecha</h1>
              <h2>{getValueOrDefault(formatDateIncDet(reporteData?.createdAt))}</h2>
            </div>
            <div>
              <h1>Técnico</h1>
              <h2>{getValueOrDefault(reporteData?.usuario_nombre)}</h2>
            </div>
          </div>
        </div>

        <div className={styles.pagina}>
          <h1>Descripción 2</h1>
          {togglePagina2 ?
            <div className={styles.toggleON}><BiSolidToggleRight onClick={onTogglePagina2} /></div> :
            <div className={styles.toggleOFF}><BiSolidToggleLeft onClick={onTogglePagina2} /></div>
          }
        </div>

        {togglePagina2 ?
          <Form>
            <FormGroup widths='equal'>
              <FormField>
                <TextArea
                  value={page2}
                  onChange={handlePage2Change}
                />
                <div className={styles.charCount}>
                  {page2.length}/{maxCharactersPage2}
                </div>
              </FormField>
            </FormGroup>
            <Button secondary onClick={handleAddPage2}>
              {editPage2 ? 'Modificar' : 'Añadir'}
            </Button>
          </Form>
          : null
        }

        <div className={styles.toggleEvi}>
          <h1>Evidencias</h1>
          {toggleEvi ?
            <div className={styles.toggleON}><BiSolidToggleRight onClick={onToggleEvi} /></div> :
            <div className={styles.toggleOFF}><BiSolidToggleLeft onClick={onToggleEvi} /></div>
          }
        </div>

        {toggleEvi ?
          <div className={styles.mainImg}>
            <Tab panes={panes} className={styles.mainTab} />
          </div> : null
        }

        <div className={styles.toggleEvi}>
          <h1>Evidencias antes / después</h1>
          {toggleEviAD ?
            <div className={styles.toggleON}><BiSolidToggleRight onClick={onToggleEviAD} /></div> :
            <div className={styles.toggleOFF}><BiSolidToggleLeft onClick={onToggleEviAD} /></div>
          }
        </div>

        {toggleEviAD ?
          <div className={styles.mainImg}>
            <Tab panes={panesAD} className={styles.mainTab} />
          </div> : null
        }

        <div className={styles.formNota}>
          <Form>
            <FormGroup widths='equal'>
              <FormField>
                <Label>
                  Nota:
                </Label>
                <TextArea
                  value={nota}
                  onChange={handleNotaChange}
                  placeholder="Escribe una nota aquí..."
                />
                <div className={styles.charCount}>
                  {nota.length}/{maxCharacters}
                </div>
              </FormField>
            </FormGroup>
            <Button secondary onClick={handleAddNota}>
              {editNota ? 'Modificar nota' : 'Añadir nota'}
            </Button>
          </Form>
        </div>

        <div className={styles.imgFirma}>
          {firmaTec ? (
            <div>
              <Image src={firmaTec} alt="Firma Técnico" />
              <div className={styles.linea}></div>
              <h2>Firma Técnico</h2>
              <Button secondary onClick={() => setShowConfirmFirmaTec(true)}><FaTrash /> Eliminar Firma Técnico</Button>
            </div>
          ) : (
            <Button secondary onClick={onOpenCloseFirmaTec}><FaPlus /> Agregar Firma Técnico</Button>
          )}
        </div>

        <div className={styles.imgFirma}>
          {firmaCli ? (
            <div>
              <Image src={firmaCli} alt="Firma Cliente" />
              <div className={styles.linea}></div>
              <h2>Firma Cliente</h2>
              <Button secondary onClick={() => setShowConfirmFirmaCli(true)}><FaTrash /> Eliminar Firma Cliente</Button>
            </div>
          ) : (
            <Button secondary onClick={onOpenCloseFirmaCli}><FaPlus /> Agregar Firma Cliente</Button>
          )}
        </div>

            <IconEdit onOpenEdit={onOpenEditReporte} />

            <IconDel onOpenDel={onOpenCloseConfirmDel} />

        <ReportePDF reporteData={reporteData} firmaTec={firmaTec} firmaCli={firmaCli} toggleEvi={toggleEvi} toggleEviAD={toggleEviAD} togglePagina2={togglePagina2} />

      </div>

      <BasicModal title="Modificar el reporte" show={showEditReporte} onClose={onOpenEditReporte}>
        <ReporteEditForm reload={reload} onReload={onReload} reporteData={reporteData} actualizarReporte={actualizarReporte} onOpenEditReporte={onOpenEditReporte} onToastSuccessMod={onToastSuccessMod} />
      </BasicModal>

      <BasicModal title="Subir imagen" show={showSubirImg} onClose={onCloseSubirImg}>
        {selectedImageKey && (
          <UploadImg
            reload={reload}
            onReload={onReload}
            itemId={reporte.id}
            onShowSubirImg={onCloseSubirImg}
            selectedImageKey={selectedImageKey}
            endpoint="reportes"
            onSuccess={handleImageUploadSuccess}
          />
        )}
      </BasicModal>

      <BasicModal show={showImg} onClose={() => setShowImg(false)}>
        <ModalImg
          img={selectedImg}
          openImg={() => setShowImg(false)}
          onShowConfirmDelImg={() => onShowConfirmDelImg(imgKeyToDelete)}
          imgKey={imgKeyToDelete}
        />
      </BasicModal>

      <BasicModal title="Título de la imagen" show={showEditTitleModal} onClose={() => setShowEditTitleModal(false)}>
        <div>
          <IconClose onOpenClose={() => setShowEditTitleModal(false)} />

          <Form>
            <FormGroup widths='equal'>
              <FormField>
                <Input
                  type="text"
                  value={currentTitle}
                  onChange={handleTitleChange}
                  placeholder="Título"
                />
              </FormField>
            </FormGroup>
            <div className={styles.caracteres}>
              <h2>{(currentTitle || '').length}/{MAX_TITLE_LENGTH}</h2>
            </div>
            <Button primary onClick={handleSaveTitle}>Guardar</Button>
          </Form>
        </div>
      </BasicModal>

      <BasicModal title="Firma del Técnico" show={showFirmaTecModal} onClose={onOpenCloseFirmaTec}>
        <FirmaDigital
          reload={reload}
          onReload={onReload}
          endPoint='reportes'
          itemId={reporte.id}
          tipoFirma="firmatec"
          onOpenClose={() => {
            onOpenCloseFirmaTec()
            fetchFirmaTec()
          }}
        />
      </BasicModal>

      <BasicModal title="Firma del Cliente" show={showFirmaCliModal} onClose={onOpenCloseFirmaCli}>
        <FirmaDigital
          reload={reload}
          onReload={onReload}
          endPoint='reportes'
          itemId={reporte.id}
          tipoFirma="firmacli"
          onOpenClose={() => {
            onOpenCloseFirmaCli()
            fetchFirmaCli()
          }}
        />
      </BasicModal>

      <Confirm
        open={showConfirmDel}
        cancelButton={
          <div className={styles.iconClose}>
            <FaTimes />
          </div>
        }
        confirmButton={
          <div className={styles.iconCheck}>
            <FaCheck />
          </div>
        }
        onConfirm={handleDeleteReporte}
        onCancel={onOpenCloseConfirmDel}
        content="¿ Estás seguro de eliminar el reporte ?"
      />

      <Confirm
        open={showConfirmDelImg}
        cancelButton={
          <div className={styles.iconClose}>
            <FaTimes />
          </div>
        }
        confirmButton={
          <div className={styles.iconCheck}>
            <FaCheck />
          </div>
        }
        onConfirm={handleDeleteImage}
        onCancel={() => setShowConfirmDelImg(false)}
        content="¿Estás seguro de eliminar la imagen?"
      />

      <Confirm
        open={showConfirmFirmaTec}
        onCancel={onOpenCloseConfirmFirmaTec}
        onConfirm={removeFirmaTec}
        cancelButton={
          <div className={styles.iconClose}>
            <FaTimes />
          </div>
        }
        confirmButton={
          <div className={styles.iconCheck}>
            <FaCheck />
          </div>
        }
        content="¿Estás seguro de eliminar la firma del técnico?"
      />

      <Confirm
        open={showConfirmFirmaCli}
        onCancel={onOpenCloseConfirmFirmaCli}
        onConfirm={removeFirmaCli}
        cancelButton={
          <div className={styles.iconClose}>
            <FaTimes />
          </div>
        }
        confirmButton={
          <div className={styles.iconCheck}>
            <FaCheck />
          </div>
        }
        content="¿Estás seguro de eliminar la firma del cliente?"
      />
    </>
  )
}
