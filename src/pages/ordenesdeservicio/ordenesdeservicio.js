import ProtectedRoute from '@/components/Layouts/ProtectedRoute/ProtectedRoute'
import { BasicLayout, BasicModal } from '@/layouts'
import { Add, Loading, Search, Title, ToastDelete, ToastSuccess } from '@/components/Layouts'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth } from '@/contexts/AuthContext'
import { FaSearch } from 'react-icons/fa'
import { OrdenesdeservicioForm, OrdenesdeservicioList, OrdenesdeservicioListSearch, SearchOrdenesdeservicio } from '@/components/Ordenesdeservicio'
import styles from './ordenesdeservicio.module.css'

export default function Ordenesdeservicio() {

  const { user, loading } = useAuth()

  const [reload, setReload] = useState(false)

  const onReload = () => setReload((prevState) => !prevState)

  const [openForm, setOpenForm] = useState(false)

  const onOpenCloseForm = () => setOpenForm((prevState) => !prevState)

  const [search, setSearch] = useState(false)

  const onOpenCloseSearch = () => setSearch((prevState) => !prevState)

  const [resultados, setResultados] = useState([])

  const [ordservs, setOrdservs] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/api/ordenesdeserv/ordenesdeserv')
        setOrdservs(res.data)
      } catch (error) {
        console.error(error)
      }
    })()
  }, [reload])

  const [toastSuccess, setToastSuccess] = useState(false)
  const [toastSuccessMod, setToastSuccessMod] = useState(false)
  const [toastSuccessDel, setToastSuccessDel] = useState(false)

  const onToastSuccess = () => {
    setToastSuccess(true)
    setTimeout(() => {
      setToastSuccess(false)
    }, 3000)
  }

  const onToastSuccessMod = () => {
    setToastSuccessMod(true)
    setTimeout(() => {
      setToastSuccessMod(false)
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

        {toastSuccess && <ToastSuccess contain='Creada exitosamente' onClose={() => setToastSuccess(false)} />}

        {toastSuccessMod && <ToastSuccess contain='Modificada exitosamente' onClose={() => setToastSuccessMod(false)} />}

        {toastSuccessDel && <ToastDelete contain='Eliminada exitosamente' onClose={() => setToastSuccessDel(false)} />}

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
          SearchComponent={SearchOrdenesdeservicio}
          SearchListComponent={OrdenesdeservicioListSearch}
          onToastSuccessMod={onToastSuccessMod}
        />

        <OrdenesdeservicioList user={user} reload={reload} onReload={onReload} ordservs={ordservs} onToastSuccessMod={onToastSuccessMod} onToastSuccessDel={onToastSuccessDel} />

      </BasicLayout>

      <BasicModal title='crear orden de servicio' show={openForm} onClose={onOpenCloseForm}>
        <OrdenesdeservicioForm user={user} reload={reload} onReload={onReload} onOpenCloseForm={onOpenCloseForm} onToastSuccess={onToastSuccess} />
      </BasicModal>

    </ProtectedRoute>

  )
}

