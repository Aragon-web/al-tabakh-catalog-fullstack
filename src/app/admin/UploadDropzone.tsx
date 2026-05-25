"use client"

import { useState, useRef, DragEvent } from "react"
import { Upload } from "lucide-react"
import { Spinner } from "@/components/Spinner"
import { useStore } from "@/lib/store"
import { adminT } from "@/lib/admin-translations"

interface Props {
  currentUrl: string
  onUpload: (url: string) => void
  token: string
}

export function UploadDropzone({ currentUrl, onUpload, token }: Props) {
  const { lang } = useStore(); const t = adminT[lang]
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError(t.onlyImages); return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(t.maxFileSize); return
    }
    setError("")
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    try {
      const res = await fetch("/api/upload", { method: "POST", headers: { Authorization: "Bearer " + token }, body: fd })
      const data = await res.json()
      if (data.url) onUpload(data.url)
      else setError(t.uploadFailed)
    } catch { setError(t.networkError) }
    setUploading(false)
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-2">
      <div onClick={() => inputRef.current?.click()}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click() } }}
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        role="button" tabIndex={0} aria-label="Upload image"
        className="relative flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all min-h-[110px] p-4"
        style={{
          background: dragOver ? "var(--surface-3)" : "var(--surface-2)",
          border: "2px dashed " + (dragOver ? "var(--accent)" : "var(--border)"),
          opacity: uploading ? 0.6 : 1,
        }}>
        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          disabled={uploading}
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = "" }} />
        {uploading ? (
          <><Spinner size={22} className="mb-2" /><span className="text-xs" style={{ color: "var(--text-muted)" }}>{t.uploading}</span></>
        ) : (preview || currentUrl) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <><img src={preview || currentUrl} alt="" loading="lazy" className="max-h-[90px] rounded-lg object-contain mb-2" /><span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{preview ? t.uploaded : t.current}</span></>
        ) : (
          <><Upload size={22} className="mb-2" style={{ color: "var(--text-muted)" }} /><span className="text-xs text-center" style={{ color: "var(--text-secondary)" }}>{t.dropOrClick}</span><span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{t.fileLimit}</span></>
        )}
        {dragOver && <div className="absolute inset-0 rounded-xl flex items-center justify-center" style={{ background: "rgba(209,29,29,0.1)" }}><span className="text-sm font-semibold" style={{ color: "var(--accent)" }}>{t.drop}</span></div>}
      </div>
      {error && <p className="text-xs" style={{ color: "var(--accent)" }}>{error}</p>}
    </div>
  )
}
