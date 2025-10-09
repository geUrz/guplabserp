import { Add, ListMap, Loading, Search, Title, ToastDelete, ToastSuccess } from '@/components/Layouts'
import ProtectedRoute from '@/components/Layouts/ProtectedRoute/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { BasicLayout, BasicModal } from '@/layouts'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { ReporteDetalles, ReporteForm, ReporteList, ReportesListSearch, SearchReporte } from '@/components/Reportes'
import { FaClipboard, FaSearch } from 'react-icons/fa'
import styles from './reportes.module.css'


export default function Reportes() {

  const { user, loading } = useAuth()

  const [reload, setReload] = useState(false)

  const onReload = () => setReload((prevState) => !prevState)

  const [openForm, setOpenForm] = useState(false)

  const onOpenCloseForm = () => setOpenForm((prevState) => !prevState)

  const [search, setSearch] = useState(false)

  const onOpenCloseSearch = () => setSearch((prevState) => !prevState)

  const [resultados, setResultados] = useState([])

  const [reportes, setReportes] = useState(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`/api/reportes/reportes`);
        setReportes(res.data);
      } catch (error) {
        console.error(error);
      }
    })()
  }, [reload, user])

  const [toastSuccess, setToastSuccessReportes] = useState(false)
  const [toastSuccessMod, setToastSuccessReportesMod] = useState(false)
  const [toastSuccessDel, setToastSuccessReportesDel] = useState(false)

  const onToastSuccess = () => {
    setToastSuccessReportes(true)
    setTimeout(() => {
      setToastSuccessReportes(false)
    }, 3000)
  }

  const onToastSuccessMod = () => {
    setToastSuccessReportesMod(true)
    setTimeout(() => {
      setToastSuccessReportesMod(false)
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

        {toastSuccess && <ToastSuccess onClose={() => setToastSuccessReportes(false)} />}

        {toastSuccessMod && <ToastSuccess onClose={() => setToastSuccessReportesMod(false)} />}

        {toastSuccessDel && <ToastDelete onClose={() => setToastSuccessReportesDel(false)} />}

        <Title title='reportes' />

        <Add onOpenClose={onOpenCloseForm} />

        <Search
          title='reporte'
          search={search}
          onOpenCloseSearch={onOpenCloseSearch}
          user={user}
          reload={reload}
          onReload={onReload}
          resultados={resultados}
          setResultados={setResultados}
          SearchComponent={SearchReporte}
          SearchListComponent={ReportesListSearch}
          onToastSuccessMod={onToastSuccessMod}
        />

        {/* <ReporteList reload={reload} onReload={onReload} reportes={reportes} onToastSuccessMod={onToastSuccessMod} onToastSuccessDel={onToastSuccessDel} /> */}

        <ListMap
          loading={loading}
          reload={reload}
          onReload={onReload}
          onToastSuccessMod={onToastSuccessMod}
          onToastSuccessDel={onToastSuccessDel}
          ModuleDetalles={ReporteDetalles}
          title='detalles del reporte'
          modules={reportes}
          icon={<FaClipboard />}
          header1='Reporte'
          header2='Cliente'
          column1='reporte'
          column2='cliente_nombre'
        />

      </BasicLayout>

      <BasicModal title='crear Reporte' show={openForm} onClose={onOpenCloseForm}>
        <ReporteForm reload={reload} onReload={onReload} onOpenCloseForm={onOpenCloseForm} onToastSuccess={onToastSuccess} />
      </BasicModal>

    </ProtectedRoute>

  )
}
