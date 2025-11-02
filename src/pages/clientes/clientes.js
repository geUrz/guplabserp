import styles from './clientes.module.css'
import { Add, ErrorAccesso, Loading, Search, Title, ToastDelete, ToastSuccess } from '@/components/Layouts'
import ProtectedRoute from '@/components/Layouts/ProtectedRoute/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { BasicLayout, BasicModal } from '@/layouts'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { ClienteForm, ClientesLista, ClientesListSearch, SearchClientes } from '@/components/Clientes'
import { usePermissions } from '@/hooks'
import { fetchClientes } from '@/store/clientes/clienteSlice'
import { useDispatch, useSelector } from 'react-redux'
import { selectReciboError } from '@/store/recibos/reciboSelectors'

export default function Clientes() {

  const { user, loading } = useAuth()

  const { isAdmin, isSuperUser } = usePermissions()

  const [reload, setReload] = useState(false)

  const onReload = () => setReload((prevState) => !prevState)

  const [openForm, setOpenForm] = useState(false)

  const onOpenCloseForm = () => setOpenForm((prevState) => !prevState)

  const [search, setSearch] = useState(false)

  const onOpenCloseSearch = () => setSearch((prevState) => !prevState)

  const [resultados, setResultados] = useState([])

  const [apiError, setApiError] = useState(null)
  const [errorModalOpen, setErrorModalOpen] = useState(false)
  const error = useSelector(selectReciboError)

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
    dispatch(fetchClientes(user))
  }, [dispatch, reload, user])

  const [toastSuccess, setToastSuccess] = useState(false)
  const [toastSuccessDel, setToastSuccessDel] = useState(false)

  const onToastSuccess = () => {
    setToastSuccess(true)
    setTimeout(() => {
      setToastSuccess(false)
    }, 3000)
  }

  const onToastSuccessDel = () => {
    setToastSuccessDel(true)
    setTimeout(() => {
      setToastSuccessDel(false)
    }, 3000)
  }

  if (loading) {
    return <Loading size={45} loading={'L'} />
  }

  return (

    <ProtectedRoute>

      <BasicLayout relative onReload={onReload}>

        {toastSuccess && <ToastSuccess onClose={() => setToastSuccess(false)} />}

        {toastSuccessDel && <ToastDelete onClose={() => setToastSuccessDel(false)} />}

        <Title title='clientes' />

        <Add onOpenClose={onOpenCloseForm} />

        <Search
          title='cliente'
          search={search}
          onOpenCloseSearch={onOpenCloseSearch}
          isAdmin={isAdmin}
          isSuperUser={isSuperUser}
          reload={reload}
          onReload={onReload}
          resultados={resultados}
          setResultados={setResultados}
          SearchComponent={SearchClientes}
          SearchListComponent={ClientesListSearch}
          onToastSuccess={onToastSuccess}
        />

        <ClientesLista isAdmin={isAdmin} isSuperUser={isSuperUser} reload={reload} onReload={onReload} onToastSuccess={onToastSuccess} onToastSuccessDel={onToastSuccessDel} />

      </BasicLayout>

      <BasicModal title='crear cliente' show={openForm} onClose={onOpenCloseForm}>
        <ClienteForm reload={reload} onReload={onReload} onCloseForm={onOpenCloseForm} onToastSuccess={onToastSuccess} />
      </BasicModal>

      <BasicModal title="Error de acceso" show={errorModalOpen} onClose={onOpenCloseErrorModal}>
        <ErrorAccesso apiError={apiError} onOpenCloseErrorModal={onOpenCloseErrorModal} />
      </BasicModal>

    </ProtectedRoute>

  )
}
