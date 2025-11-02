import { BiSolidFilePdf } from 'react-icons/bi'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import QRCode from 'qrcode'
import { formatCurrency, formatDateIncDet, getValueOrDefault } from '@/helpers'
import styles from './ReciboPDF.module.css'
import { useEffect, useState } from 'react'
import { Loading } from '@/components/Layouts'
import { useSelector } from 'react-redux'
import { selectConceptos, selectDiscount, selectIVA, selectIVAEnabled, selectRecibo } from '@/store/recibos/reciboSelectors'

export function ReciboPDF() {

  const recibo = useSelector(selectRecibo)
  const conceptos = useSelector(selectConceptos)
  const ivaValue = useSelector(selectIVA)
  const toggleIVA = useSelector(selectIVAEnabled)
  const discount = useSelector(selectDiscount)
  const [discountValue, setDiscountValue] = useState(0)
  
  const [isLoading, setIsLoading] = useState(false)

  const calcularTotales = (discount) => {
    const subtotal = recibo?.conceptos?.reduce((acc, curr) => acc + curr.cantidad * curr.precio, 0) || 0
    const descuentoValor = (discount / 100) * subtotal
    const subtotalConDescuento = subtotal - descuentoValor
    const iva = subtotalConDescuento * (ivaValue / 100)
    const total = toggleIVA ? subtotalConDescuento + iva : subtotalConDescuento

    if (descuentoValor !== discountValue) {
      setDiscountValue(descuentoValor)
    }

    return { subtotal, iva, total };
  };

  useEffect(() => {
    const { subtotal, iva, total } = calcularTotales(discount)
  }, [discount, recibo, ivaValue, toggleIVA])

  const generarPDF = async () => {

    setIsLoading(true)

    if (!recibo) return

    const { subtotal, iva, total } = calcularTotales(discount)

    const doc = new jsPDF(
      {
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      }
    )

    const logoImg = 'img/logo.png'
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

    function capitalize(str) {
      return str.replace(/\b\w/g, char => char.toUpperCase());
    }

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
    doc.setFont("helvetica", "bold")
    doc.setTextColor(0, 0, 0)
    doc.text('Cliente', 15, 54)
    doc.setFontSize(`${font2}`)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(120, 120, 120)
    doc.text(`${capitalize(getValueOrDefault(recibo.cliente_nombre))}`, 15, 58)
    doc.setFontSize(`${font2}`)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(0, 0, 0)
    doc.text('Atención a', 15, 64)
    doc.setFontSize(`${font2}`)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(120, 120, 120)
    doc.text(`${capitalize(getValueOrDefault(recibo.cliente_contacto))}`, 15, 68)

    doc.setFontSize(`${font1}`)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(0, 0, 0)
    doc.text('RECIBO', doc.internal.pageSize.width - marginRight - doc.getTextWidth('RECIBO'), 44)
    doc.setFontSize(`${font2}`)
    doc.setTextColor(0, 0, 0)
    doc.text('Folio', doc.internal.pageSize.width - marginRight - doc.getTextWidth('Folio'), 50)
    doc.setFontSize(`${font2}`)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(120, 120, 120)
    doc.text(`${getValueOrDefault(recibo.folio)}`, doc.internal.pageSize.width - marginRight - doc.getTextWidth(`${getValueOrDefault(recibo.folio)}`), 54)

    doc.setFontSize(`${font2}`)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(0, 0, 0)
    doc.text('Fecha', doc.internal.pageSize.width - marginRight - doc.getTextWidth('Fecha'), 60)
    doc.setFontSize(`${font2}`)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(120, 120, 120)
    doc.text(
      `${formatDateIncDet(getValueOrDefault(recibo.createdAt))}`,
      doc.internal.pageSize.width - 12 - doc.getTextWidth(`${formatDateIncDet(getValueOrDefault(recibo.createdAt))}`),
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
      body: conceptos.map(concepto => [
        { content: `${getValueOrDefault(concepto.tipo)}`, styles: { halign: 'center' } },
        { content: `${getValueOrDefault(concepto.concepto)}`, styles: { halign: 'left' } },
        { content: `${getValueOrDefault(formatCurrency(concepto.precio * 1))}`, styles: { halign: 'right' } },
        { content: `${getValueOrDefault(concepto.cantidad)}`, styles: { halign: 'center' } },
        { content: `${getValueOrDefault(formatCurrency(concepto.precio * concepto.cantidad))}`, styles: { halign: 'right' } },
      ]),
      headStyles: {
        fillColor: [255, 255, 255],
        fontSize: `${font3}`,
        fontStyle: 'bold',
        textColor: [0, 0, 0],
        lineWidth: { bottom: 1 },
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

    const top = 230
    const boxWidth = 130
    const boxHeight = 30

    doc.setDrawColor(255, 255, 255)
    doc.rect(marginRight, top, boxWidth, boxHeight)

    doc.setFontSize(`${font2}`)
    doc.setTextColor(0, 0, 0);
    doc.text('Nota:', marginRight, top - 1)

    doc.setFontSize(`${font3}`)
    doc.setTextColor(80, 80, 80)
    const content = recibo.nota === undefined || recibo.nota === null ? (
      ''
    ) : (
      `${recibo.nota}`
    )


    const textX = marginRight
    const textY = top + 4
    const txtWidth = boxWidth - 4

    doc.text(content, textX, textY, { maxWidth: txtWidth })

    const verticalData = [
      ['Subtotal:', `${formatCurrency(subtotal)}`],
      [`${recibo?.discount}% Desc:`, `- ${formatCurrency(discountValue)}`],
      ...toggleIVA ? [
        [`${recibo?.iva}% IVA:`, `${formatCurrency(iva)}`],
      ] : [['% IVA:', `${formatCurrency('0')}`]],
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
    doc.text('• Este documento no es un comprobante fiscal válido.', 50, 265)
    doc.text('• Para efectos fiscales, se requiere una factura electrónica.', 50, 270)

    const qrCodeText = 'https://www.facebook.com/clicknet.mx'
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeText)
    doc.addImage(qrCodeDataUrl, 'PNG', 10, 248, 40, 40)

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

    doc.save(`recibo_${recibo.folio}.pdf`)

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

