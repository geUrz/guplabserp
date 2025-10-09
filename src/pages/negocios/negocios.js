import styles from './negocios.module.css'
import ProtectedRoute from '@/components/Layouts/ProtectedRoute/ProtectedRoute'
import { BasicLayout, BasicModal } from '@/layouts'
import { useAuth } from '@/contexts'
import { useEffect, useState } from 'react'
import { Add, ErrorAccesso, Loading, Search, Title, ToastDelete, ToastSuccess } from '@/components/Layouts'
import { NegocioForm, NegociosLista, NegociosListSearch, SearchNegocios } from '@/components/Negocios'
import { usePermissions } from '@/hooks'
import { useDispatch, useSelector } from 'react-redux'
import { fetchNegocios } from '@/store/negocios/negocioSlice'
import { selectNegociosError } from '@/store/negocios/negocioSelectors'

export default function Negocios() {

  const { user, loading } = useAuth()

  const { isAdmin, isPremium } = usePermissions()

  const [reload, setReload] = useState(false)

  const onReload = () => setReload((prevState) => !prevState)

  const [openForm, setOpenForm] = useState(false)

  const onOpenCloseForm = () => setOpenForm((prevState) => !prevState)

  const [search, setSearch] = useState(false)

  const onOpenCloseSearch = () => setSearch((prevState) => !prevState)

  const [resultados, setResultados] = useState([])

  const [apiError, setApiError] = useState(null)
  const [errorModalOpen, setErrorModalOpen] = useState(false)
  const error = useSelector(selectNegociosError)

  const onOpenCloseErrorModal = () => setErrorModalOpen((prev) => !prev)

  const dispatch = useDispatch()

  useEffect(() => {
    if (error) {
      setApiError(error)
      setErrorModalOpen(true)  
    }
  }, [error])

  useEffect(() => {
    dispatch(fetchNegocios())
  }, [dispatch, reload])

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

        <Title title='negocios' />

        <Add onOpenClose={onOpenCloseForm} />

        <Search
          title='negocio'
          search={search}
          onOpenCloseSearch={onOpenCloseSearch}
          user={user}
          reload={reload}
          onReload={onReload}
          resultados={resultados}
          setResultados={setResultados}
          SearchComponent={SearchNegocios}
          SearchListComponent={NegociosListSearch}
          onToastSuccess={onToastSuccess}
        />

        <NegociosLista loading={loading} reload={reload} onReload={onReload} isAdmin={isAdmin} isPremium={isPremium} onToastSuccess={onToastSuccess} onToastSuccessDel={onToastSuccessDel} />

      </BasicLayout>

      <BasicModal title='crear negocio' show={openForm} onClose={onOpenCloseForm}>
        <NegocioForm user={user} reload={reload} onReload={onReload} onCloseForm={onOpenCloseForm} onToastSuccess={onToastSuccess} />
      </BasicModal>

      <BasicModal title="Error de acceso" show={errorModalOpen} onClose={onOpenCloseErrorModal}>
        <ErrorAccesso apiError={apiError} onOpenCloseErrorModal={onOpenCloseErrorModal} />
      </BasicModal>

    </ProtectedRoute>

  )
}
