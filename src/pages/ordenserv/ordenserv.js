import styles from './ordenserv.module.css'
import ProtectedRoute from '@/components/Layouts/ProtectedRoute/ProtectedRoute'
import { BasicLayout, BasicModal } from '@/layouts'
import { Add, ErrorAccesso, Loading, Search, Title, ToastDelete, ToastSuccess } from '@/components/Layouts'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { OrdenservForm, OrdenservList, OrdenservListSearch, SearchOrdenserv } from '@/components/Ordenserv'
import { usePermissions } from '@/hooks'
import { fetchOrdenserv } from '@/store/ordenserv/ordenservSlice'
import { useDispatch, useSelector } from 'react-redux'
import { selectOrdenServError } from '@/store/ordenserv/ordenservSelectors'

export default function Ordenserv() {

  const { user, logout, loading } = useAuth()
  
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
    const error = useSelector(selectOrdenServError)
  
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
        dispatch(fetchOrdenserv(user))
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
    return <Loading size={45} loading={0} />
  }

  return (

    <ProtectedRoute>

      <BasicLayout relative onReload={onReload}>

        {toastSuccess && <ToastSuccess onClose={() => setToastSuccessReportes(false)} />}

        {toastSuccessDel && <ToastDelete onClose={() => setToastSuccessReportesDel(false)} />}

        <Title title='órdenes de servicio' />

        <Add onOpenClose={onOpenCloseForm} />
        
        <Search
          title='orden de servicio'
          search={search}
          onOpenCloseSearch={onOpenCloseSearch}
          user={user}
          reload={reload}
          onReload={onReload}
          resultados={resultados}
          setResultados={setResultados}
          SearchComponent={SearchOrdenserv}
          SearchListComponent={OrdenservListSearch}
          onToastSuccess={onToastSuccess}
        />

        <OrdenservList user={user} reload={reload} onReload={onReload} onToastSuccess={onToastSuccess} onToastSuccessDel={onToastSuccessDel} />

      </BasicLayout>

      <BasicModal title='crear orden de servicio' show={openForm} onClose={onOpenCloseForm}>
        <OrdenservForm user={user} reload={reload} onReload={onReload} onOpenCloseForm={onOpenCloseForm} onToastSuccess={onToastSuccess} />
      </BasicModal>

      {/* <BasicModal title="Error de acceso" show={errorModalOpen} onClose={onOpenCloseErrorModal}>
        <ErrorAccesso apiError={apiError} onOpenCloseErrorModal={onOpenCloseErrorModal} />
      </BasicModal>  */}

    </ProtectedRoute>

  )
}

