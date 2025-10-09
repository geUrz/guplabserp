import styles from './clientes.module.css'
import { Add, Loading, Search, Title, ToastDelete, ToastSuccess } from '@/components/Layouts'
import ProtectedRoute from '@/components/Layouts/ProtectedRoute/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { BasicLayout, BasicModal } from '@/layouts'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { ClienteForm, ClientesLista, ClientesListSearch, SearchClientes } from '@/components/Clientes'
import { usePermissions } from '@/hooks'

export default function Clientes() {

  const { user, loading } = useAuth()

  const {isAdmin, isSuperUser} = usePermissions()

  const [reload, setReload] = useState(false)

  const onReload = () => setReload((prevState) => !prevState)

  const [openForm, setOpenForm] = useState(false)

  const onOpenCloseForm = () => setOpenForm((prevState) => !prevState)

  const [search, setSearch] = useState(false)

  const onOpenCloseSearch = () => setSearch((prevState) => !prevState)

  const [resultados, setResultados] = useState([])

  const [clientes, setClientes] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`/api/clientes/clientes`);
        setClientes(res.data);
      } catch (error) {
        console.error(error);
      }
    })()
  }, [reload, user])

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

        <ClientesLista isAdmin={isAdmin} isSuperUser={isSuperUser} reload={reload} onReload={onReload} clientes={clientes} onToastSuccess={onToastSuccess} onToastSuccessDel={onToastSuccessDel} />

      </BasicLayout>

      <BasicModal title='crear cliente' show={openForm} onClose={onOpenCloseForm}>
        <ClienteForm reload={reload} onReload={onReload} onCloseForm={onOpenCloseForm} onToastSuccess={onToastSuccess} />
      </BasicModal>

    </ProtectedRoute>

  )
}
