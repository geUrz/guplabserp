import styles from './Menu.module.css'
import { Image } from 'semantic-ui-react'
import { FaBars, FaBuilding, FaHome, FaMoon, FaSun, FaTimes, FaUserCircle } from 'react-icons/fa'
import { useState } from 'react'
import { FaClipboard, FaFileAlt, FaFileContract, FaFileInvoice, FaFileInvoiceDollar, FaUser, FaUsers } from 'react-icons/fa'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { useTheme } from '@/contexts'
import { usePermissions } from '@/hooks'

export function Menu() {

  const { user } = useAuth()

  const router = useRouter()

  const {isAdmin} = usePermissions()

  const { theme, toggleTheme } = useTheme()

  const [menu, setMenu] = useState(false)

  const onMenu = () => setMenu((prevState) => !prevState)

  return (

    <>

      <div className={styles.mainTop}>
        <Link href='/'>
          <Image src={theme != 'dark' ? 'img/logoB.webp' : 'img/logoW.webp'} />
        </Link>
        <div className={styles.iconBar} onClick={onMenu}>
          {menu ? (
            <FaTimes />
          ) : (
            <FaBars />
          )}
        </div>
      </div>

      <div className={styles.mainMenuSide} style={{ left: menu ? '0' : '-100%' }} onClick={onMenu}>
        <div className={styles.menuTop} onClick={() => router.push('usuario')}>
          <FaUserCircle />
          <h1>{user.usuario}</h1>
        </div>
        <div className={styles.menuList}>
          <Link href='/'>
            <FaHome />
            <h1>Panel</h1>
          </Link>
          <Link href='recibos'>
            <FaFileInvoice />
            <h1>Recibos</h1>
          </Link>
          <Link href='cotizaciones'>
            <FaFileContract />
            <h1>Cotizaciones</h1>
          </Link>
          <Link href='ordenserv'>
            <FaFileAlt />
            <h1>Órdenes de servicio</h1>
          </Link>
          <Link href='reportes'>
            <FaClipboard />
            <h1>Reportes</h1>
          </Link>
          <Link href='cuentas'>
            <FaFileInvoiceDollar />
            <h1>Cuentas</h1>
          </Link>
          <Link href='clientes'>
            <FaUsers />
            <h1>Clientes</h1>
          </Link>
          <Link href='usuarios'>
            <FaUser />
            <h1>Usuarios</h1>
          </Link>

          {isAdmin &&
            <Link href='negocios'>
              <FaBuilding />
              <h1>Negocios</h1>
            </Link>
          }

        </div>

        <div className={styles.toggleTheme}>
          {theme != 'dark' ?
            <div className={styles.iconThemeSun}>
              <FaSun onClick={toggleTheme} />
            </div> :
            <div className={styles.iconThemeMoon}>
              <FaMoon onClick={toggleTheme} />
            </div>
          }
        </div>

      </div>

    </>

  )
}
