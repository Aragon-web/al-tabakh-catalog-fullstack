"use client"

import { useState, useRef, DragEvent } from "react"
import { Upload, Loader2 } from "lucide-react"

interface Props {
  currentUrl: string
  onUpload: (url: string) => void
  token: string
}

export function UploadDropzone({ currentUrl, onUpload, token }: Props) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Only image files are accepted"); return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Max file size is 10MB"); return
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
      else setError("Upload failed")
    } catch { setError("Network error") }
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
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
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
          <><Loader2 size={22} className="animate-spin mb-2" style={{ color: "var(--accent)" }} /><span className="text-xs" style={{ color: "var(--text-muted)" }}>Uploading...</span></>
        ) : (preview || currentUrl) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <><img src={preview || currentUrl} alt="" className="max-h-[90px] rounded-lg object-contain mb-2" /><span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{preview ? "Uploaded" : "Current"}</span></>
        ) : (
          <><Upload size={22} className="mb-2" style={{ color: "var(--text-muted)" }} /><span className="text-xs text-center" style={{ color: "var(--text-secondary)" }}>Drop or click to upload</span><span className="text-[10px]" style={{ color: "var(--text-muted)" }}>PNG, JPG, WEBP max 10MB</span></>
        )}
        {dragOver && <div className="absolute inset-0 rounded-xl flex items-center justify-center" style={{ background: "rgba(209,29,29,0.1)" }}><span className="text-sm font-semibold" style={{ color: "var(--accent)" }}>Drop</span></div>}
      </div>
      {error && <p className="text-xs" style={{ color: "var(--accent)" }}>{error}</p>}
    </div>
  )
}
