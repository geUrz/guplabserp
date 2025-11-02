import { BiSolidFilePdf } from 'react-icons/bi'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import QRCode from 'qrcode'
import { formatDateIncDet, getValueOrDefault } from '@/helpers'
import styles from './ReportePDF.module.css'
import { useState } from 'react'
import { Loading } from '@/components/Layouts'

export function ReportePDF(props) {
  const { reporteData, firmaCli, firmaTec, toggleEvi, toggleEviAD, togglePagina2 } = props

  const [isLoading, setIsLoading] = useState(false)

  const generarPDF = async () => {

    setIsLoading(true)

    if (!reporteData) return

    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    })

    /* const addFooterText = () => {
      const text = 'www.clicknetmx.com'
      const textWidth = doc.getTextWidth(text)
      const x = (pageWidth - textWidth) / 2
      const y = doc.internal.pageSize.height - 5
      doc.setFontSize(8)
      doc.setTextColor(120, 120, 120)
      doc.text(text, x, y)
    } */

    const logoImg = 'img/logo1.webp'
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
    doc.text('REPORTE', doc.internal.pageSize.width - marginRight - doc.getTextWidth('REPORTE'), 44)
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

    autoTable(doc, {
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
      body: [[reporteData.descripcion || 'Sin descripción']],
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
    const content = reporteData.nota === undefined || reporteData.nota === null ? (
      ''
    ) : (
      `${reporteData.nota}`
    )


    const textX = marginMain
    const textY = top + 4
    const txtWidth = boxWidth - 4

    doc.text(content, textX, textY, { maxWidth: txtWidth })

    // Firma
    const firmaWidth = 24
    const firmaHeight = 12
    const marginRightFirmaTec = 40
    const marginRightFirmaCli = 110
    const xPos = pageWidth - firmaWidth - marginRightFirmaTec
    const xPosCli = pageWidth - firmaWidth - marginRightFirmaCli

    if (firmaTec) {
      doc.addImage(firmaTec, 'PNG', xPos, 264, firmaWidth, firmaHeight)
    }
    doc.setFontSize(`${font3}`)
    doc.setTextColor(50, 50, 50)
    doc.text('_________________________', doc.internal.pageSize.width - 55 - doc.getTextWidth('Firma Técnico'), 278)
    doc.text('Firma Técnico', doc.internal.pageSize.width - 43.5 - doc.getTextWidth('Firma Técnico'), 282.5)

    if (firmaCli) {
      doc.addImage(firmaCli, 'PNG', xPosCli, 264, firmaWidth, firmaHeight)
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

    //addFooterText()

    if (togglePagina2) {

      doc.addPage()
      autoTable(doc, {
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
        body: [[reporteData.page2 || 'Sin descripción']],
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

    if (toggleEvi) {

      const imgWidth = 35
      const imgHeight = 70
      const spaceBetweenImages = 45
      const imagesPerRow = 4;

      function calculateInitialPosX(docWidth) {
        const totalImagesWidth = imagesPerRow * imgWidth + (imagesPerRow - 1) * (spaceBetweenImages - imgWidth)
        return (docWidth - totalImagesWidth) / 2
      }

      doc.addPage()
      autoTable(doc, {
        startY: 10,
        head: [[{ content: 'Evidencias', styles: { halign: 'left' } }]],
        headStyles: { fillColor: [240, 240, 240], fontSize: font2, textColor: [50, 50, 50] },
        margin: { top: 0, left: marginMain, right: marginMain },
      })

      addFooterText()

      const imgEvi = [
        { img: reporteData.img1, title: reporteData.title1 },
        { img: reporteData.img2, title: reporteData.title2 },
        { img: reporteData.img3, title: reporteData.title3 },
        { img: reporteData.img4, title: reporteData.title4 },
        { img: reporteData.img5, title: reporteData.title5 },
        { img: reporteData.img6, title: reporteData.title6 },
        { img: reporteData.img7, title: reporteData.title7 },
        { img: reporteData.img8, title: reporteData.title8 },
        { img: reporteData.img9, title: reporteData.title9 },
        { img: reporteData.img10, title: reporteData.title10 }
      ]

      let firstRowTopMargin = 26
      let posY = firstRowTopMargin
      let posX = calculateInitialPosX(doc.internal.pageSize.width)

      imgEvi.forEach((item, index) => {
        if (item.img) {
          doc.addImage(item.img, 'PNG', posX, posY, imgWidth, imgHeight, undefined, undefined, 0)

          if (item.title) {
            doc.setFontSize(font3)
            doc.setTextColor(0, 0, 0)
            doc.text(item.title, posX + imgWidth / 2, posY + imgHeight + 5, { maxWidth: imgWidth, align: 'center' })
          }
        }

        posX += spaceBetweenImages

        if ((index + 1) % imagesPerRow === 0) {
          posX = calculateInitialPosX(doc.internal.pageSize.width)
          posY += 88
        }
      })
    }

    if (toggleEviAD) {

      const imgWidth = 35
      const imgHeight = 70
      const spaceBetweenImages = 45
      const imagesPerRow = 4;

      function calculateInitialPosX(docWidth) {
        const totalImagesWidth = imagesPerRow * imgWidth + (imagesPerRow - 1) * (spaceBetweenImages - imgWidth)
        return (docWidth - totalImagesWidth) / 2
      }

      doc.addPage()
      autoTable(doc, {
        startY: 10,
        head: [[{ content: 'Evidencias Antes del Servicio', styles: { halign: 'left' } }]],
        headStyles: { fillColor: [240, 240, 240], fontSize: font2, textColor: [50, 50, 50] },
        margin: { top: 0, left: marginMain, right: marginMain },
      })

      addFooterText()

      const imgAntes = [
        { img: reporteData.img1, title: reporteData.title1 },
        { img: reporteData.img2, title: reporteData.title2 },
        { img: reporteData.img3, title: reporteData.title3 },
        { img: reporteData.img4, title: reporteData.title4 },
        { img: reporteData.img5, title: reporteData.title5 },
        { img: reporteData.img6, title: reporteData.title6 },
        { img: reporteData.img7, title: reporteData.title7 },
        { img: reporteData.img8, title: reporteData.title8 },
        { img: reporteData.img9, title: reporteData.title9 },
        { img: reporteData.img10, title: reporteData.title10 }
      ]

      let firstRowTopMargin = 26
      let posY = firstRowTopMargin
      let posX = calculateInitialPosX(doc.internal.pageSize.width)

      imgAntes.forEach((item, index) => {
        if (item.img) {
          doc.addImage(item.img, 'PNG', posX, posY, imgWidth, imgHeight, undefined, undefined, 0)

          if (item.title) {
            doc.setFontSize(font3)
            doc.setTextColor(0, 0, 0)
            doc.text(item.title, posX + imgWidth / 2, posY + imgHeight + 5, { maxWidth: imgWidth, align: 'center' })
          }
        }

        posX += spaceBetweenImages

        if ((index + 1) % imagesPerRow === 0) {
          posX = calculateInitialPosX(doc.internal.pageSize.width)
          posY += 88
        }
      })

      doc.addPage()
      autoTable(doc, {
        startY: 10,
        head: [[{ content: 'Evidencias Después del Servicio', styles: { halign: 'left' } }]],
        headStyles: { fillColor: [240, 240, 240], fontSize: font2, textColor: [50, 50, 50] },
        margin: { top: 0, left: marginMain, right: marginMain },
      })

      const imgDespues = [
        { img: reporteData.img11, title: reporteData.title11 },
        { img: reporteData.img12, title: reporteData.title12 },
        { img: reporteData.img13, title: reporteData.title13 },
        { img: reporteData.img14, title: reporteData.title14 },
        { img: reporteData.img15, title: reporteData.title15 },
        { img: reporteData.img16, title: reporteData.title16 },
        { img: reporteData.img17, title: reporteData.title17 },
        { img: reporteData.img18, title: reporteData.title18 },
        { img: reporteData.img19, title: reporteData.title19 },
        { img: reporteData.img20, title: reporteData.title20 }
      ]

      posY = firstRowTopMargin
      posX = calculateInitialPosX(doc.internal.pageSize.width) 

      addFooterText()

      imgDespues.forEach((item, index) => {
        if (item.img) {
          doc.addImage(item.img, 'PNG', posX, posY, imgWidth, imgHeight)

          if (item.title) {
            doc.setFontSize(font3)
            doc.setTextColor(0, 0, 0)
            doc.text(item.title, posX + imgWidth / 2, posY + imgHeight + 5, { maxWidth: imgWidth, align: 'center' })
          }
        }

        posX += spaceBetweenImages;

        if ((index + 1) % imagesPerRow === 0) {
          posX = calculateInitialPosX(doc.internal.pageSize.width)
          posY += 88
        }
      })

    }

    doc.save(`reporte_${reporteData.folio}.pdf`)

    setIsLoading(false)

  }

  const compartirPDF = () => {
    generarPDF()
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
