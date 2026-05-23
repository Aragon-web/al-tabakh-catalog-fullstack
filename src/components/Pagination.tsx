"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  lang: "en" | "ar"
}

export function Pagination({ currentPage, totalPages, onPageChange, lang }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages: (number | string)[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...")
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8 sm:mt-10">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="p-2 rounded-lg disabled:opacity-30 min-touch flex items-center justify-center transition-colors"
        style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
        aria-label={lang === "en" ? "Previous page" : "الصفحة السابقة"}
      >
        <ChevronLeft size={18} />
      </button>
      {pages.map((p, i) =>
        typeof p === "number" ? (
          <button
            key={i}
            onClick={() => onPageChange(p)}
            className="w-11 h-11 rounded-lg text-sm font-medium flex items-center justify-center transition-colors"
            style={{
              background: p === currentPage ? "var(--accent)" : "var(--surface-2)",
              color: p === currentPage ? "#fff" : "var(--text-secondary)",
            }}
          >
            {p}
          </button>
        ) : (
          <span key={i} className="px-1" style={{ color: "var(--text-muted)" }}>...</span>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-2 rounded-lg disabled:opacity-30 min-touch flex items-center justify-center transition-colors"
        style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
        aria-label={lang === "en" ? "Next page" : "الصفحة التالية"}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
