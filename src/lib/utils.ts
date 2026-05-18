import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | string) {
  const num = typeof price === "string" ? parseFloat(price) : price
  return isNaN(num) ? "0" : num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

export function getWhatsAppUrl(phone: string, message: string) {
  const text = encodeURIComponent(message)
  return `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${text}`
}
