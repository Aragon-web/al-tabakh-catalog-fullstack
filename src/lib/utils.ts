import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getWhatsAppUrl(phone: string, message: string) {
  const text = encodeURIComponent(message)
  return `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${text}`
}

export async function downloadCartInvoice(cart: { product_id: string; name_en: string; name_ar: string; quantity: number; weight?: string | null; pieces_per_carton?: string | null }[], lang: "en" | "ar") {
  const name = (i: { name_en: string; name_ar: string }) => lang === "en" ? i.name_en : i.name_ar
  const date = new Date()
  const dd = String(date.getDate()).padStart(2, "0")
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const yyyy = date.getFullYear()
  const dateStr = `${dd}-${mm}-${yyyy}`
  const filename = lang === "ar" ? `فاتورة ${dateStr}` : `invoice-${dateStr}`
  const totalQty = cart.reduce((s, i) => s + i.quantity, 0)

  const head = lang === "ar"
    ? ["#", "الرمز", "الاسم", "الكمية", "الوزن", "قطعة/كرتون"]
    : ["#", "Code", "Name", "Qty", "Weight", "Pcs/Ctn"]

  const td = "padding:7px 8px;border:1px solid #d0d0d0"
  const rows = cart.map((item, i) =>
    `<tr><td style="${td};text-align:center">${i + 1}</td><td style="${td};text-align:center;font-family:monospace;font-size:11px">${item.product_id}</td><td style="${td};text-align:${lang === "ar" ? "right" : "left"}">${name(item)}</td><td style="${td};text-align:center">${item.quantity}</td><td style="${td};text-align:center">${item.weight || "—"}</td><td style="${td};text-align:center">${item.pieces_per_carton || "—"}</td></tr>`
  ).join("")

  const html = `<div style="width:800px;margin:0 auto;padding:30px;background:#fff;font-family:Arial,sans-serif;font-size:12px;color:#222;line-height:1.4">
<h1 style="font-size:20px;margin:0 0 4px;text-align:center">${lang === "ar" ? "الفاتورة" : "Invoice"}</h1>
<div style="text-align:center;color:#666;font-size:11px;margin-bottom:20px">${dateStr}</div>
<table style="width:100%;border-collapse:collapse;margin-bottom:16px">
<thead><tr>${head.map(h => `<th style="background:#f5f5f5;padding:8px;border:1px solid #ccc;font-size:11px;text-align:center;font-weight:600">${h}</th>`).join("")}</tr></thead>
<tbody>${rows}</tbody>
</table>
<div style="font-weight:700;font-size:13px;text-align:center;padding:8px 0">${lang === "ar" ? "المجموع" : "Total"}: ${totalQty}</div>
<div style="text-align:center;font-size:10px;color:#999;margin-top:24px;padding-top:12px;border-top:1px solid #eee">Al-Tabakh — ${lang === "ar" ? "شريكك الموثوق في الغذاء منذ ١٩٩٩" : "Your trusted food partner since 1999"}</div>
</div>`

  const el = document.createElement("div")
  el.innerHTML = html
  el.style.cssText = "width:800px;margin:0 auto;background:#fff;"
  document.body.appendChild(el)

  try {
    await new Promise(r => requestAnimationFrame(r))
    const mod = await import("html2canvas")
    const canvas = await mod.default(el, { scale: 2, useCORS: true, logging: false })
    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error("canvas empty")
    }
    const imgData = canvas.toDataURL("image/jpeg", 0.95)
    const jspdf = await import("jspdf")
    const pdf = new jspdf.default("p", "mm", "a4")
    const pw = pdf.internal.pageSize.getWidth()
    const ph = (canvas.height * pw) / canvas.width
    pdf.addImage(imgData, "JPEG", 0, 0, pw, ph)
    pdf.save(`${filename}.pdf`)
  } finally {
    el.remove()
  }
}

export async function downloadCartExcel(cart: { product_id: string; name_en: string; name_ar: string; quantity: number; weight?: string | null; pieces_per_carton?: string | null }[], lang: "en" | "ar") {
  const XLSX = await import("xlsx")
  const name = (i: { name_en: string; name_ar: string }) => lang === "en" ? i.name_en : i.name_ar
  const date = new Date()
  const dd = String(date.getDate()).padStart(2, "0")
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const yyyy = date.getFullYear()
  const dateStr = `${dd}-${mm}-${yyyy}`
  const filename = lang === "ar" ? `فاتورة-${dateStr}` : `invoice-${dateStr}`

  const headers = lang === "ar"
    ? ["#", "الرمز", "الاسم", "الكمية", "قطع/كرتون", "إجمالي القطع", "الوزن"]
    : ["#", "Code", "Name", "Qty", "Pcs/Ctn", "Total Pcs", "Weight"]

  const rows = cart.map((item, i) => [
    i + 1,
    item.product_id,
    name(item),
    item.quantity,
    item.pieces_per_carton || "—",
    item.pieces_per_carton ? item.quantity * parseInt(item.pieces_per_carton) : "—",
    item.weight || "—",
  ])

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
  ws["!cols"] = [
    { wch: 5 }, { wch: 10 }, { wch: 30 }, { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 10 },
  ]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, lang === "ar" ? "الفاتورة" : "Invoice")
  XLSX.writeFile(wb, `${filename}.xlsx`)
}
