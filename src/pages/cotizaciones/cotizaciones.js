import styles from './cotizaciones.module.css'
import ProtectedRoute from '@/components/Layouts/ProtectedRoute/ProtectedRoute'
import { BasicLayout, BasicModal } from '@/layouts'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { Add, Loading, Search, Title, ToastDelete, ToastSuccess } from '@/components/Layouts'
import { CotizacionForm, CotizacionLista, CotizacionListSearch, SearchCotizacion } from '@/components/Cotizaciones'
import axios from 'axios'

export default function Cotizaciones() {

  const { user, loading } = useAuth()

  const [reload, setReload] = useState(false)

  const onReload = () => setReload((prevState) => !prevState)

  const [openForm, setOpenForm] = useState(false)

  const onOpenCloseForm = () => setOpenForm((prevState) => !prevState)

  const [search, setSearch] = useState(false)

  const onOpenCloseSearch = () => setSearch((prevState) => !prevState)

  const [resultados, setResultados] = useState([])

  const [cotizaciones, setCotizaciones] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/api/cotizaciones/cotizaciones')
        setCotizaciones(res.data)
      } catch (error) {
        console.error(error)
      }
    })()
  }, [reload])

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

        <Title title='cotizaciones' />

        <Add onOpenClose={onOpenCloseForm} />

        <Search
          title='cotización'
          search={search}
          onOpenCloseSearch={onOpenCloseSearch}
          user={user}
          reload={reload}
          onReload={onReload}
          resultados={resultados}
          setResultados={setResultados}
          SearchComponent={SearchCotizacion}
          SearchListComponent={CotizacionListSearch}
          onToastSuccess={onToastSuccess}
        />

        <CotizacionLista reload={reload} onReload={onReload} cotizaciones={cotizaciones} setCotizaciones={setCotizaciones} onToastSuccess={onToastSuccess} onToastSuccessDel={onToastSuccessDel} />

      </BasicLayout>

      <BasicModal title='crear cotización' show={openForm} onClose={onOpenCloseForm}>
        <CotizacionForm reload={reload} onReload={onReload} onToastSuccess={onToastSuccess} onOpenCloseForm={onOpenCloseForm} />
      </BasicModal>

    </ProtectedRoute>

  )
}
