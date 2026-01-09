import { BiSolidFilePdf } from 'react-icons/bi'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import QRCode from 'qrcode'
import { formatDateIncDet, getValueOrDefault } from '@/helpers'
import styles from './OrdenservPDF.module.css'

export function OrdenservPDF(props) {
  const { ordserv, firmacli, firmatec, togglePagina2 } = props

  const generarPDF = async () => {
    if (!ordserv) return

    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    })

    const addFooterText = () => {
      const text = 'www.clicknetmx.com'
      const textWidth = doc.getTextWidth(text)
      const x = (pageWidth - textWidth) / 2
      const y = doc.internal.pageSize.height - 5 // Posición a 10 mm del borde inferior
      doc.setFontSize(8)
      doc.setTextColor(120, 120, 120)
      doc.text(text, x, y)
    }

    const logoImg = 'img/logo.png'
    const logoWidth = 58
    const logoHeight = 16
    const marginRightLogo = 12

    const pageWidth = doc.internal.pageSize.getWidth()

    const xPosition = pageWidth - logoWidth - marginRightLogo

    doc.addImage(logoImg, 'PNG', xPosition, 18, logoWidth, logoHeight)

    doc.setFont('helvetica')

    const marginMain = 12
    const marginRight = 12
    const font1 = 12
    const font2 = 10
    const font3 = 9

    doc.setFontSize(`${font2}`)
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
    doc.text('RFC: EIEJ8906244J3', 15, 47)

    doc.setFontSize(`${font2}`)
    doc.setTextColor(0, 0, 0)
    doc.text('Cliente', 15, 54)
    doc.setFontSize(`${font2}`)
    doc.setTextColor(120, 120, 120)
    doc.text(`${getValueOrDefault(reporteData.cliente_nombre)}`, 15, 58)
    doc.setFontSize(`${font2}`)
    doc.setTextColor(0, 0, 0)
    doc.text('Atención a', 15, 64)
    doc.setFontSize(`${font2}`)
    doc.setTextColor(120, 120, 120)
    doc.text(`${getValueOrDefault(reporteData.cliente_contacto)}`, 15, 68)

    doc.setFontSize(`${font1}`)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(0, 0, 0)
    doc.text('ORDEN DE SERVICIO', doc.internal.pageSize.width - marginRight - doc.getTextWidth('ORDEN DE SERVICIO'), 44)
    doc.setFontSize(`${font2}`)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(0, 0, 0)
    doc.text('Folio', doc.internal.pageSize.width - marginRight - doc.getTextWidth('Folio'), 50)
    doc.setFontSize(`${font2}`)
    doc.setTextColor(120, 120, 120)
    doc.text(`${getValueOrDefault(reporteData.folio)}`, doc.internal.pageSize.width - marginRight - doc.getTextWidth(`${getValueOrDefault(reporteData.folio)}`), 54)

    doc.setFontSize(`${font2}`)
    doc.setTextColor(0, 0, 0)
    doc.text('Fecha', doc.internal.pageSize.width - marginRight - doc.getTextWidth('Fecha'), 60)
    doc.setFontSize(`${font2}`)
    doc.setTextColor(120, 120, 120)
    doc.text(
      `${getValueOrDefault(formatDateIncDet(reporteData.createdAt))}`,
      doc.internal.pageSize.width - 12 - doc.getTextWidth(`${getValueOrDefault(formatDateIncDet(reporteData.createdAt))}`),
      64
    )

    doc.autoTable({
      startY: 75,
      head: [
        [
          { content: 'Descripción', styles: { halign: 'left' } }
        ]
      ],
      styles: {
        cellPadding: 2.5,
        cellWidth: 'auto',
      },
      body: [[ordserv.descripcion || 'Sin descripción']],
      headStyles: { fillColor: [240, 240, 240], fontSize: `${font2}`, textColor: [50, 50, 50] },
      bodyStyles: { fontSize: `${font3}` },
      alternateRowStyles: { fillColor: [255, 255, 255] },
      columnStyles: {
        0: {
          halign: 'left', 
          cellWidth: 'auto',
          cellPadding: 2.5,
          valign: 'middle'
        }
      },
      margin: { top: 0, left: marginMain, bottom: 0, right: marginMain },
    })

    const top = 230
    const boxWidth = 185
    const boxHeight = 30

    doc.setDrawColor(255, 255, 255)
    doc.rect(marginMain, top, boxWidth, boxHeight)

    doc.setFontSize(`${font2}`)
    doc.setTextColor(0, 0, 0)
    doc.text('Nota:', marginMain, top - 1)

    doc.setFontSize(`${font3}`)
    doc.setTextColor(80, 80, 80)
    const content = ordserv.nota === undefined || ordserv.nota === null ? (
      ''
    ) : (
      `${ordserv.nota}`
    )


    const textX = marginMain
    const textY = top + 4
    const txtWidth = boxWidth - 4

    doc.text(content, textX, textY, { maxWidth: txtWidth })

    // Firma
    const firmaWidth = 24
    const firmaHeight = 12
    const marginRightFirmatec = 40
    const marginRightFirmaCli = 110
    const xPos = pageWidth - firmaWidth - marginRightFirmatec
    const xPosCli = pageWidth - firmaWidth - marginRightFirmaCli

    if (firmatec) {
      doc.addImage(firmatec, 'PNG', xPos, 264, firmaWidth, firmaHeight)
    }
    doc.setFontSize(`${font3}`)
    doc.setTextColor(50, 50, 50)
    doc.text('_________________________', doc.internal.pageSize.width - 55 - doc.getTextWidth('Firma Técnico'), 278)
    doc.text('Firma Técnico', doc.internal.pageSize.width - 43.5 - doc.getTextWidth('Firma Técnico'), 282.5)

    if (firmacli) {
      doc.addImage(firmacli, 'PNG', xPosCli, 264, firmaWidth, firmaHeight)
    }
    doc.setFontSize(`${font3}`)
    doc.setTextColor(50, 50, 50)
    doc.text('_________________________', doc.internal.pageSize.width - 125 - doc.getTextWidth('Firma Cliente'), 278)
    doc.text('Firma Cliente', doc.internal.pageSize.width - 112 - doc.getTextWidth('Firma Cliente'), 282.5)

    const qrCodeText = 'https://www.facebook.com/clicknet.mx'
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeText)
    doc.addImage(qrCodeDataUrl, 'PNG', 10, 248, 40, 40)

    doc.setFontSize(`${font3}`)
    doc.setTextColor(120, 120, 120)

    addFooterText()

    if (togglePagina2) {

      doc.addPage()
      doc.autoTable({
        startY: 10,
        head: [
          [
            { content: 'Descripción', styles: { halign: 'left' } }
          ]
        ],
        styles: {
          cellPadding: 2.5,
          cellWidth: 'auto',
        },
        body: [[ordserv.page2 || 'Sin descripción']],
        headStyles: { fillColor: [240, 240, 240], fontSize: `${font2}`, textColor: [50, 50, 50] },
        bodyStyles: { fontSize: `${font3}` },
        alternateRowStyles: { fillColor: [255, 255, 255] },
        columnStyles: {
          0: {
            halign: 'left', 
            cellWidth: 'auto',
            cellPadding: 2.5,
            valign: 'middle'
          }
        },
        margin: { top: 0, left: marginMain, bottom: 0, right: marginMain },
      })

      addFooterText()

    }

    doc.save(`ordendeservicio_${ordserv.folio}.pdf`)
  }

  const compartirPDF = () => {
    generarPDF()
  }

  return (
    <div className={styles.iconPDF}>
      <div onClick={compartirPDF}>
        <BiSolidFilePdf />
      </div>
    </div>
  )
}
