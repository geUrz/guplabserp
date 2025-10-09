import styles from './recibos.module.css'
import ProtectedRoute from '@/components/Layouts/ProtectedRoute/ProtectedRoute'
import { BasicLayout, BasicModal } from '@/layouts'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Add, ErrorAccesso, Loading, Search, Title, ToastDelete, ToastSuccess } from '@/components/Layouts'
import { ReciboForm, RecibosLista, RecibosListSearch, SearchRecibos } from '@/components/Recibos'
import { useDispatch, useSelector } from 'react-redux'
import { fetchRecibos } from '@/store/recibos/reciboSlice'
import { selectReciboError } from '@/store/recibos/reciboSelectors'
import { usePermissions } from '@/hooks'

export default function Recibos() {

  const { user, loading } = useAuth()

  const {isAdmin, isSuperUser} = usePermissions()
 
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
      dispatch(fetchRecibos(user))
  }, [dispatch, reload, user])

  const [toastSuccess, setToastSuccessReportes] = useState(false)
  const [toastSuccessDel, setToastSuccessReportesDel] = useState(false)

  const onToastSuccess = () => {
    setToastSuccessReportes(true)
    setTimeout(() => {
      setToastSuccessReportes(false)
    }, 3000)
  }

  const onToastSuccessDel = () => {
    setToastSuccessReportesDel(true)
    setTimeout(() => {
      setToastSuccessReportesDel(false)
    }, 3000)
  }

  if (loading) {
    return <Loading size={45} loading={0} />
  }

  return (

    <ProtectedRoute>

      <BasicLayout relative onReload={onReload}>
  
        <Add onOpenClose={onOpenCloseForm} />

        <Title title='Recibos' />

        {toastSuccess && <ToastSuccess onClose={() => setToastSuccessReportes(false)} />}

        {toastSuccessDel && <ToastDelete onClose={() => setToastSuccessReportesDel(false)} />}

        <Search
          title='recibo'
          search={search}
          onOpenCloseSearch={onOpenCloseSearch}
          user={user}
          reload={reload}
          onReload={onReload}
          isAdmin={isAdmin} 
          isSuperUser={isSuperUser}
          resultados={resultados}
          setResultados={setResultados}
          SearchComponent={SearchRecibos}
          SearchListComponent={RecibosListSearch}
          onToastSuccess={onToastSuccess}
        />

        <RecibosLista user={user} loading={loading} reload={reload} onReload={onReload} isAdmin={isAdmin} isSuperUser={isSuperUser} onToastSuccess={onToastSuccess} onToastSuccessDel={onToastSuccessDel} />

      </BasicLayout>

      <BasicModal title='crear recibo' show={openForm} onClose={onOpenCloseForm}>
        <ReciboForm reload={reload} onReload={onReload} onToastSuccess={onToastSuccess} onOpenCloseForm={onOpenCloseForm} />
      </BasicModal>

      {/* <BasicModal title="Error de acceso" show={errorModalOpen} onClose={onOpenCloseErrorModal}>
        <ErrorAccesso apiError={apiError} onOpenCloseErrorModal={onOpenCloseErrorModal} />
      </BasicModal> */}

    </ProtectedRoute>

  )
}
