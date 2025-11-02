import styles from './CotizacionPDF.module.css'
import { BiSolidFilePdf } from 'react-icons/bi'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import QRCode from 'qrcode'
import { formatCurrency, formatDateIncDet, getValueOrDefault } from '@/helpers'
import { formatPrice, formatQuantity, formatTipo, formatTotal } from '@/helpers/formatPrice'
import { useState } from 'react'
import { Loading } from '@/components/Layouts'

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CotizacionesDB', 1)

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings')
      }
    };

    request.onsuccess = (e) => resolve(e.target.result)
    request.onerror = (e) => reject(e.target.error)
  })
};

// Función para obtener el valor de toggleIVA desde IndexedDB
const getToggleIVA = async () => {
  const db = await openDB()
  const transaction = db.transaction('settings', 'readonly')
  const store = transaction.objectStore('settings')

  return new Promise((resolve, reject) => {
    const request = store.get('toggleIVA')
    request.onsuccess = (e) => resolve(e.target.result?.toggleIVA || false) 
    request.onerror = (e) => reject(e.target.error)
  })
}

export function CotizacionPDF(props) {

  const { cotizacionData, conceptos, ivaValue } = props

  const [isLoading, setIsLoading] = useState(false)

  const generarPDF = async () => {

    setIsLoading(true)

    if (!cotizacionData) return

    const toggleIVA = await getToggleIVA()

    const doc = new jsPDF(
      {
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      }
    )

    /* const logoImg = 'img/logo.png' */
    const logoImg = 'img/logo1.webp' 
    const logoWidth = 58
    const logoHeight = 16
    const marginRightLogo = 12

    const pageWidth = doc.internal.pageSize.getWidth()

    const xPosition = pageWidth - logoWidth - marginRightLogo

    doc.addImage(logoImg, 'PNG', xPosition, 18, logoWidth, logoHeight)

    doc.setFont('helvetica')

    const marginRight = 12
    const font1 = 12
    const font2 = 10
    const font3 = 9

    /* doc.setFontSize(`${font2}`)
    doc.setTextColor(0, 0, 0)
    doc.text('CLICKNET', 15, 23)
    doc.setFontSize(`${font2}`)
    doc.setTextColor(120, 120, 120)
    doc.text('Punta Este Corporativo', 15, 27)
    doc.text('Calzada Carranza 951,', 15, 31)
    doc.text('Piso 10 Suite 304, Interior "E"', 15, 35)
    doc.text('C.P. 2125', 15, 39)
    doc.setFontSize(`${font3}`)
    doc.setTextColor(0, 0, 0)
    doc.text('Juan Roberto Espinoza Espinoza', 15, 43)
    doc.setFontSize(`${font3}`)
    doc.setTextColor(120, 120, 120)
    doc.text('RFC: EIEJ8906244J3', 15, 47)   */  

    doc.setFontSize(`${font2}`)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(0, 0, 0)
    doc.text('Cliente', 15, 54)
    doc.setFontSize(`${font2}`)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(120, 120, 120)
    doc.text(`${getValueOrDefault(cotizacionData.cliente_nombre)}`, 15, 58)
    doc.setFontSize(`${font2}`)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(0, 0, 0)
    doc.text('Atención a', 15, 64)
    doc.setFontSize(`${font2}`)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(120, 120, 120)
    doc.text(`${getValueOrDefault(cotizacionData.cliente_contacto)}`, 15, 68)

    doc.setFontSize(`${font1}`)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(0, 0, 0)
    doc.text('COTIZACIÓN', doc.internal.pageSize.width - marginRight - doc.getTextWidth('COTIZACIÓN'), 44)
    doc.setFontSize(`${font2}`)
    doc.setTextColor(0, 0, 0)
    doc.text('Folio', doc.internal.pageSize.width - marginRight - doc.getTextWidth('Folio'), 50)
    doc.setFontSize(`${font2}`)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(120, 120, 120)
    doc.text(`${cotizacionData.folio}`, doc.internal.pageSize.width - marginRight - doc.getTextWidth(`${cotizacionData.folio}`), 54)

    doc.setFontSize(`${font2}`)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(0, 0, 0)
    doc.text('Fecha', doc.internal.pageSize.width - marginRight - doc.getTextWidth('Fecha'), 60)
    doc.setFontSize(`${font2}`)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(120, 120, 120)
    doc.text(
      `${formatDateIncDet(cotizacionData.createdAt)}`,
      doc.internal.pageSize.width - 12 - doc.getTextWidth(`${formatDateIncDet(cotizacionData.createdAt)}`),
      64
    )

    autoTable(doc, {
      startY: 75,
      head: [
        [
          { content: 'Tipo', styles: { halign: 'center' } },
          { content: 'Concepto', styles: { halign: 'left' } },
          { content: 'Precio', styles: { halign: 'right' } },
          { content: 'Qty', styles: { halign: 'center' } },
          { content: 'Total', styles: { halign: 'right' } },
        ]
      ],
      styles: {
        cellPadding: 1.5,
        cellWidth: 'auto',
      },
      body: conceptos.map(concepto => {
        return [
          { content: `${formatTipo(concepto.tipo)}`, styles: { halign: 'center' } },
          { content: `${concepto.concepto}`, styles: { halign: 'left' } },
          concepto.tipo !== '.' 
            ? { content: `${formatPrice(concepto.precio)}`, styles: { halign: 'right' } }
            : { content: '', styles: { halign: 'right' } },
          concepto.tipo !== '.' 
            ? { content: `${formatQuantity(concepto.cantidad)}`, styles: { halign: 'center' } }
            : { content: '', styles: { halign: 'center' } },
          concepto.tipo !== '.' 
            ? { content: `${formatTotal(concepto.precio, concepto.cantidad)}`, styles: { halign: 'right' } }
            : { content: '', styles: { halign: 'right' } },
        ]
      }),      
      headStyles: {
        fillColor: [255, 255, 255],
        fontSize: `${font3}`,
        fontStyle: 'bold',
        textColor: [0, 0, 0],
        lineWidth: { bottom: 0.5 },
        lineColor: [80, 100, 255]
      },
      bodyStyles: { fontSize: `${font3}` },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 95 },
        2: { cellWidth: 25 },
        3: { cellWidth: 18 },
        4: { cellWidth: 25 },

        cellPadding: 1.5,
        valign: 'middle'
      },

      margin: { top: 0, left: 15, bottom: 0, right: 12 },

    })

    const calcularTotales = () => {
      const subtotal = conceptos.reduce((acc, curr) => acc + curr.cantidad * curr.precio, 0)
      const iva = subtotal * (ivaValue / 100)
      const total = toggleIVA ? subtotal + iva : subtotal
      return { subtotal, iva, total }
    }
    
    const { subtotal, iva, total } = calcularTotales()

    const top = 235
    const boxWidth = 130
    const boxHeight = 30

    doc.setDrawColor(255, 255, 255)
    doc.rect(marginRight, top, boxWidth, boxHeight)

    doc.setFontSize(`${font3}`)
    doc.setTextColor(0, 0, 0)
    doc.text('Nota:', marginRight, top - 1)

    doc.setFontSize(`${font3}`)
    doc.setTextColor(80, 80, 80)
    const content = cotizacionData.nota === undefined || cotizacionData.nota === null ? (
      ''
    ) : (
      `${cotizacionData.nota}`
    )


    const textX = marginRight
    const textY = top + 4
    const txtWidth = boxWidth - 4

    doc.text(content, textX, textY, { maxWidth: txtWidth })

    const verticalData = [
      ...toggleIVA ? [
        ['Subtotal:', `${formatCurrency(subtotal)}`],
        ['IVA:', `${formatCurrency(iva)}`],
      ] : [],
      ['Total:', `${formatCurrency(total)}`]
    ];

    const pWidth = doc.internal.pageSize.getWidth()
    const mRight = 12
    const tableWidth = 44
    const marginLeft = pWidth - mRight - tableWidth

    autoTable(doc, {
      startY: 230,
      margin: { left: marginLeft, bottom: 0, right: marginRight },
      body: verticalData,
      styles: {
        cellPadding: 1,
        valign: 'middle',
        fontSize: `${font2}`,
      },
      columnStyles: {
        0: { cellWidth: 20, fontStyle: 'bold', halign: 'right' },
        1: { cellWidth: 24, halign: 'right' }
      }
    })


    doc.setFontSize(`${font3}`)
    doc.setTextColor(0, 0, 0)
    doc.text('• Precio en pesos.', 50, 260)
    doc.text('• Se requiere un anticipo del 50%.', 50, 265)
    doc.text('• Todos nuestros equipos cuentan con 1 año de garantía', 50, 270)
    doc.text('  por defecto de fabrica.', 50, 275)
    doc.text('• Esta cotización tiene una vigencia de 15 días.', 50, 280)

    const qrCodeText = 'https://www.facebook.com/clicknet.mx'
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeText)
    doc.addImage(qrCodeDataUrl, 'PNG', 10, 252, 40, 40)

    /* const addFooterText = () => {
      const text = 'www.clicknetmx.com'
      const textWidth = doc.getTextWidth(text)
      const x = (pageWidth - textWidth) / 2
      const y = doc.internal.pageSize.height - 5 // Posición a 10 mm del borde inferior
      doc.setFontSize(8)
      doc.setTextColor(120, 120, 120)
      doc.text(text, x, y)
    }

    addFooterText() */

    doc.save(`cotizacion_${cotizacionData.folio}.pdf`)

    setIsLoading(false)

  }

  return (

    <div className={styles.iconPDF}>
      <div onClick={generarPDF}>
        {isLoading ? (
          <Loading 
            size={30}
            loading={3}
          />
        ) : (
          <BiSolidFilePdf />
        )}
      </div>
    </div>

  )
}
