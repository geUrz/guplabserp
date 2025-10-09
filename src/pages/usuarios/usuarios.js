import styles from './usuarios.module.css'
import ProtectedRoute from '@/components/Layouts/ProtectedRoute/ProtectedRoute'
import { BasicLayout, BasicModal } from '@/layouts'
import { Add, ErrorAccesso, Loading, Search, Title, ToastDelete, ToastSuccess } from '@/components/Layouts'
import { useAuth } from '@/contexts/AuthContext'
import { SearchUsuarios, UsuarioForm, UsuariosLista, UsuariosListSearch } from '@/components/Usuarios'
import { useEffect, useState } from 'react'
import { usePermissions } from '@/hooks'
import { useDispatch, useSelector } from 'react-redux'
import { fetchUsuarios } from '@/store/usuarios/usuarioSlice'
import { selectUsuariosError } from '@/store/usuarios/usuarioSelectors'

export default function Usuarios() {

  const { user, logout, loading } = useAuth()
  
  const { isAdmin, isSuperUser } = usePermissions()

  const [reload, setReload] = useState()

  const onReload = () => setReload((prevState) => !prevState)

  const [openForm, setOpenForm] = useState(false)

  const onOpenCloseForm = () => setOpenForm((prevState) => !prevState)

  const [search, setSearch] = useState(false)

  const onOpenCloseSearch = () => setSearch((prevState) => !prevState)

  const [resultados, setResultados] = useState([])

  const [apiError, setApiError] = useState(null)
  const [errorModalOpen, setErrorModalOpen] = useState(false)
  const error = useSelector(selectUsuariosError)

  const onOpenCloseErrorModal = () => setErrorModalOpen((prev) => !prev)

  const dispatch = useDispatch()

  useEffect(() => {
    if (error) {
      setApiError(error)
      setErrorModalOpen(true)  
    }
  }, [error])

  useEffect(() => {
    if (!user) return
    dispatch(fetchUsuarios(user))
  }, [dispatch, reload, user])  

  const [toastSuccess, setToastSuccess] = useState(false)
  const [toastSuccessDel, setToastSuccessReportesDel] = useState(false)

  const onToastSuccess = () => {
    setToastSuccess(true)
    setTimeout(() => {
      setToastSuccess(false)
    }, 3000)
  }

  const onToastSuccessDel = () => {
    setToastSuccessReportesDel(true)
    setTimeout(() => {
      setToastSuccessReportesDel(false)
    }, 3000)
  }

  if (loading) {
    return <Loading size={45} loading={'L'} />
  }

  return (

    <ProtectedRoute>

      <BasicLayout relative categorie='usuario' onReload={onReload}>

        {toastSuccess && <ToastSuccess onClose={() => setToastSuccessUsuario(false)} />}

        {toastSuccessDel && <ToastDelete onClose={() => setToastSuccessReportesDel(false)} />}

        <Title title='Usuarios' />

        <Add onOpenClose={onOpenCloseForm} />

        <Search
          title='usuario'
          search={search}
          onOpenCloseSearch={onOpenCloseSearch}
          user={user}
          logout={logout}
          reload={reload}
          onReload={onReload}
          isAdmin={isAdmin} 
          isSuperUser={isSuperUser}
          resultados={resultados}
          setResultados={setResultados}
          SearchComponent={SearchUsuarios}
          SearchListComponent={UsuariosListSearch}
          onToastSuccess={onToastSuccess}
        />

        <UsuariosLista user={user} logout={logout} loading={loading} reload={reload} onReload={onReload} isAdmin={isAdmin} isSuperUser={isSuperUser} onToastSuccess={onToastSuccess} onToastSuccessDel={onToastSuccessDel} />

      </BasicLayout>

      <BasicModal title='crear usuario' show={openForm} onClose={onOpenCloseForm}>
        <UsuarioForm reload={reload} onReload={onReload} onOpenCloseForm={onOpenCloseForm} onToastSuccess={onToastSuccess} />
      </BasicModal>

      <BasicModal title="Error de acceso" show={errorModalOpen} onClose={onOpenCloseErrorModal}>
        <ErrorAccesso apiError={apiError} onOpenCloseErrorModal={onOpenCloseErrorModal} />
      </BasicModal>

    </ProtectedRoute>

  )
}
