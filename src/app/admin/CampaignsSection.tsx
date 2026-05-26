"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Save, Check, Circle, ImagePlus, X, Upload, Trash2 } from "lucide-react"
import { Spinner } from "@/components/Spinner"
import { useStore } from "@/lib/store"
import { adminT } from "@/lib/admin-translations"

export function CampaignsSection({ token, showToast }: { token: string; showToast: (type: "success" | "error", text: string) => void }) {
  const { lang } = useStore(); const t = adminT[lang]
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [enabled, setEnabled] = useState(true)
  const [titleEn, setTitleEn] = useState("")
  const [titleAr, setTitleAr] = useState("")
  const [subtitleEn, setSubtitleEn] = useState("")
  const [subtitleAr, setSubtitleAr] = useState("")
  const [emptyEn, setEmptyEn] = useState("")
  const [emptyAr, setEmptyAr] = useState("")
  const [bannerUrl, setBannerUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [editLang, setEditLang] = useState<"en" | "ar">("en")
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function loadCampaign() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/settings", { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) { setLoading(false); return }
      const allSettings = await res.json()
      const campaignSetting = (Array.isArray(allSettings) ? allSettings : []).find((s: { key: string }) => s.key === "campaign")
      if (campaignSetting?.value) {
        const v = campaignSetting.value
        setEnabled(v.enabled !== undefined ? v.enabled : true)
        setTitleEn(v.titleEn || "")
        setTitleAr(v.titleAr || "")
        setSubtitleEn(v.subtitleEn || "")
        setSubtitleAr(v.subtitleAr || "")
        setEmptyEn(v.emptyEn || "")
        setEmptyAr(v.emptyAr || "")
        setBannerUrl(v.bannerUrl || "")
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => { loadCampaign() }, []) // eslint-disable-line

  const markDirty = useCallback((val: boolean) => {
    setDirty(val)
    setSaved(false)
  }, [])

  const doSave = useCallback(async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          key: "campaign",
          value: {
            enabled,
            titleEn,
            titleAr,
            subtitleEn,
            subtitleAr,
            emptyEn,
            emptyAr,
            bannerUrl,
          },
        }),
      })
      if (res.ok) {
        setSaved(true)
        setDirty(false)
        showToast("success", t.campaignSaved)
        setTimeout(() => setSaved(false), 3000)
      } else {
        showToast("error", t.campaignSaveFailed)
      }
    } catch {
      showToast("error", "Network error")
    }
    setSaving(false)
  }, [token, showToast, t, enabled, titleEn, titleAr, subtitleEn, subtitleAr, emptyEn, emptyAr, bannerUrl])

  // Debounced auto-save
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    if (dirty) {
      debounceTimer.current = setTimeout(() => {
        doSave()
      }, 2000)
    }
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [dirty, doSave])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      showToast("error", t.onlyImages)
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast("error", t.maxFileSize)
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (data.url) {
        setBannerUrl(data.url)
        markDirty(true)
        showToast("success", t.uploaded)
      } else {
        showToast("error", t.uploadFailed)
      }
    } catch {
      showToast("error", t.uploadFailed)
    }
    setUploading(false)
    e.target.value = ""
  }

  const removeBanner = () => {
    setBannerUrl("")
    markDirty(true)
  }

  function renderBannerUpload() {
    return (
      <div>
        <p className="text-[10px] font-medium uppercase mb-2" style={{ color: "var(--text-muted)" }}>{t.campaignBanner}</p>
        {bannerUrl ? (
          <div className="relative rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <img src={bannerUrl} alt="Campaign Banner" className="w-full h-32 object-cover" />
            <button
              onClick={removeBanner}
              className="absolute top-2 right-2 p-1.5 rounded-lg"
              style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}
              title="Remove banner"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 py-6 rounded-lg cursor-pointer transition-colors"
            style={{ border: "2px dashed var(--border)", background: "var(--surface-2)" }}>
            <ImagePlus size={24} style={{ color: "var(--text-muted)" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{t.dropOrClick}</span>
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
          </label>
        )}
      </div>
    )
  }

  function renderTextField(label: string, value: string, onChange: (v: string) => void, multiline = false) {
    const baseStyle: React.CSSProperties = {
      background: "var(--surface-2)",
      border: "1px solid var(--border)",
      color: "var(--text-primary)",
      direction: editLang === "ar" ? "rtl" : "ltr",
      fontFamily: editLang === "ar" ? '"Noto Sans Arabic", "Tajawal", sans-serif' : undefined,
      width: "100%",
      fontSize: "0.75rem",
      lineHeight: "1.5",
      outline: "none",
      borderRadius: "0.5rem",
      padding: "0.5rem 0.75rem",
      boxSizing: "border-box",
    }
    return (
      <div>
        <p className="text-[10px] font-medium uppercase mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
        {multiline ? (
          <textarea
            value={value}
            onChange={e => { onChange(e.target.value); markDirty(true) }}
            rows={3}
            style={{ ...baseStyle, resize: "vertical" }}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={e => { onChange(e.target.value); markDirty(true) }}
            style={baseStyle}
          />
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size={20} />
      </div>
    )
  }

  return (
    <div>
      <div className="max-w-2xl">
        {/* Enabled toggle */}
        <div className="p-4 rounded-xl mb-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold">{t.campaignEnabled}</h3>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{t.campaignEnabledDesc}</p>
            </div>
            <button
              onClick={() => { setEnabled(!enabled); markDirty(true) }}
              className="relative w-11 h-6 rounded-full transition-colors"
              style={{ background: enabled ? "var(--accent)" : "var(--surface-2)" }}
            >
              <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm"
                style={{ transform: enabled ? "translateX(20px)" : "translateX(0)" }} />
            </button>
          </div>
        </div>

        {/* Content fields */}
        <div className="p-4 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold">{lang === "en" ? "Campaign Content" : "محتوى الحملة"}</h3>
            <div className="flex items-center gap-2">
              {saving ? (
                <Spinner size={12} />
              ) : saved ? (
                <Check size={12} style={{ color: "var(--accent)" }} />
              ) : dirty ? (
                <Circle size={10} fill="var(--accent)" style={{ color: "var(--accent)" }} />
              ) : null}
              <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                <button
                  onClick={() => setEditLang("en")}
                  className="px-2 py-1 text-[10px] font-medium"
                  style={{
                    background: editLang === "en" ? "var(--accent)" : "var(--surface-2)",
                    color: editLang === "en" ? "#fff" : "var(--text-secondary)",
                  }}
                >EN</button>
                <button
                  onClick={() => setEditLang("ar")}
                  className="px-2 py-1 text-[10px] font-medium"
                  style={{
                    background: editLang === "ar" ? "var(--accent)" : "var(--surface-2)",
                    color: editLang === "ar" ? "#fff" : "var(--text-secondary)",
                  }}
                >AR</button>
              </div>
              <button
                onClick={doSave}
                disabled={saving}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium"
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                  opacity: saving ? 0.5 : 1,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                <Save size={10} />
                {t.save}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {renderTextField(
              t.campaignTitle,
              editLang === "en" ? titleEn : titleAr,
              editLang === "en" ? setTitleEn : setTitleAr
            )}
            {renderTextField(
              t.campaignSubtitle,
              editLang === "en" ? subtitleEn : subtitleAr,
              editLang === "en" ? setSubtitleEn : setSubtitleAr,
              true
            )}
            {renderTextField(
              t.campaignEmpty,
              editLang === "en" ? emptyEn : emptyAr,
              editLang === "en" ? setEmptyEn : setEmptyAr,
              true
            )}
          </div>

          {/* Banner upload */}
          <div className="mt-4">
            {renderBannerUpload()}
          </div>
        </div>

        {/* Preview */}
        <div className="mt-4 p-4 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <p className="text-[10px] font-medium mb-3" style={{ color: "var(--text-muted)" }}>{t.preview}</p>
          <div style={{ background: "var(--bg)", borderRadius: "0.5rem", padding: "1.5rem", textAlign: "center" }}>
            {bannerUrl && (
              <img src={bannerUrl} alt="Campaign Banner" className="w-full h-24 object-cover rounded-lg mb-3" />
            )}
            <h2 className="text-lg font-bold mb-1">
              {editLang === "en" ? (titleEn || "Special Offers") : (titleAr || "العروض الخاصة")}
            </h2>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {editLang === "en" ? (subtitleEn || "Discounted products available for a limited time") : (subtitleAr || "منتجات مخفضة متاحة لفترة محدودة")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
