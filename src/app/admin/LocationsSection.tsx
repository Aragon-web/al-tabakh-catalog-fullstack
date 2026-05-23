"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, X, Check, Globe, MapPin, Download, ChevronDown, ChevronRight, Map } from "lucide-react"
import type { LocationCountry, CityInfo, VendorLocation } from "@/lib/cities"
import { COUNTRIES as staticCountries } from "@/lib/cities"
import { slugify } from "@/lib/slugify"
import { ConfirmDialog } from "./ConfirmDialog"

function parseMapsUrl(url: string): { lat: number; lng: number } | null {
  if (!url) return null
  const at = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
  if (at) return { lat: parseFloat(at[1]), lng: parseFloat(at[2]) }
  const q = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/)
  if (q) return { lat: parseFloat(q[1]), lng: parseFloat(q[2]) }
  const ll = url.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/)
  if (ll) return { lat: parseFloat(ll[1]), lng: parseFloat(ll[2]) }
  const d3 = url.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/)
  if (d3) return { lat: parseFloat(d3[1]), lng: parseFloat(d3[2]) }
  return null
}

const EMPTY_VENDOR: VendorLocation = { name_en: "", name_ar: "", lat: 0, lng: 0, type: "grocery", phone: "", address_en: "", address_ar: "" }
const EMPTY_CITY: CityInfo = { slug: "", name_en: "", name_ar: "", description_en: "", description_ar: "", seoTitle_en: "", seoTitle_ar: "", region: "", lat: 0, lng: 0, vendors: [] }
const EMPTY_COUNTRY: LocationCountry = { slug: "", name_en: "", name_ar: "", cities: [] }

function VendorEditor({ value, onChange, onDelete, index }: { value: VendorLocation; onChange: (v: VendorLocation) => void; onDelete: () => void; index: number }) {
  const [mapsUrl, setMapsUrl] = useState(
    value.lat && value.lng ? `https://www.google.com/maps?q=${value.lat},${value.lng}` : ""
  )
  const handleMapsUrl = (url: string) => {
    setMapsUrl(url)
    const coords = parseMapsUrl(url)
    if (coords) onChange({ ...value, lat: coords.lat, lng: coords.lng })
  }
  return (
    <div className="p-2 rounded-lg" style={{ border: "1px solid var(--border)", background: "var(--surface-2)" }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>#{index + 1}</span>
        <button onClick={onDelete} className="p-0.5 rounded" style={{ color: "#EF4444" }} aria-label="Delete vendor"><Trash2 size={10} /></button>
      </div>
      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
        <input placeholder="Name EN" aria-label="City name English" value={value.name_en} onChange={e => onChange({ ...value, name_en: e.target.value })} className="px-1.5 py-1 rounded" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
        <input placeholder="Name AR" aria-label="City name Arabic" value={value.name_ar} onChange={e => onChange({ ...value, name_ar: e.target.value })} className="px-1.5 py-1 rounded" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
        <div className="col-span-2 flex items-center gap-1">
          <Map size={12} style={{ color: "var(--text-muted)" }} />
          <input placeholder="Paste Google Maps link here" aria-label="Google Maps URL" value={mapsUrl} onChange={e => handleMapsUrl(e.target.value)} className="flex-1 px-1.5 py-1 rounded" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
        </div>
        <input placeholder="Phone" aria-label="City phone" value={value.phone} onChange={e => onChange({ ...value, phone: e.target.value })} className="px-1.5 py-1 rounded" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
        <input placeholder="Address EN" aria-label="Address English" value={value.address_en} onChange={e => onChange({ ...value, address_en: e.target.value })} className="px-1.5 py-1 rounded col-span-2" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
        <input placeholder="Address AR" aria-label="Address Arabic" value={value.address_ar} onChange={e => onChange({ ...value, address_ar: e.target.value })} className="px-1.5 py-1 rounded col-span-2" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
      </div>
    </div>
  )
}

function VendorsEditor({ vendors, onChange }: { vendors: VendorLocation[]; onChange: (v: VendorLocation[]) => void }) {
  const addVendor = () => onChange([...vendors, { ...EMPTY_VENDOR }])
  const updateVendor = (i: number, v: VendorLocation) => {
    const next = [...vendors]
    next[i] = v
    onChange(next)
  }
  const removeVendor = (i: number) => {
    const next = vendors.filter((_, idx) => idx !== i)
    onChange(next)
  }
  return (
    <div className="space-y-2 ml-4 mt-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">Vendors ({vendors.length})</span>
        <button onClick={addVendor} className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px]" style={{ background: "var(--accent)", color: "#fff" }}>
          <Plus size={10} /> Add
        </button>
      </div>
      {vendors.map((v, i) => (
        <VendorEditor key={i} index={i} value={v} onChange={nv => updateVendor(i, nv)} onDelete={() => removeVendor(i)} />
      ))}
    </div>
  )
}

function CityEditor({ city, onChange, onDelete, countryName }: { city: CityInfo; onChange: (c: CityInfo) => void; onDelete: () => void; countryName: string }) {
  const [expanded, setExpanded] = useState(false)
  const [mapsUrl, setMapsUrl] = useState(
    city.lat && city.lng ? `https://www.google.com/maps?q=${city.lat},${city.lng}` : ""
  )

  const handleNameEn = (name: string) => {
    onChange({ ...city, name_en: name, slug: slugify(name) })
  }
  const handleMapsUrl = (url: string) => {
    setMapsUrl(url)
    const coords = parseMapsUrl(url)
    if (coords) onChange({ ...city, lat: coords.lat, lng: coords.lng })
  }

  const derivedSlug = slugify(city.name_en)
  const derivedRegion = countryName

  return (
    <div className="rounded-lg p-2.5" style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
      <div className="flex items-center justify-between">
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1.5 text-sm font-medium">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <MapPin size={14} style={{ color: "var(--accent)" }} />
          {city.name_en || "New City"} / {city.name_ar || "..."}
          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>{city.vendors.length}</span>
        </button>
        <button onClick={onDelete} className="p-1 rounded" style={{ color: "#EF4444" }} aria-label="Delete city"><Trash2 size={12} /></button>
      </div>
      {expanded && (
        <div className="mt-2 space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-1.5">
            <input placeholder="Name EN" value={city.name_en} onChange={e => handleNameEn(e.target.value)} className="px-1.5 py-1 rounded" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            <input placeholder="Name AR" value={city.name_ar} onChange={e => onChange({ ...city, name_ar: e.target.value })} className="px-1.5 py-1 rounded" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            <div className="col-span-2 flex items-center gap-1">
              <Map size={12} style={{ color: "var(--text-muted)" }} />
              <input placeholder="Paste Google Maps link here" value={mapsUrl} onChange={e => handleMapsUrl(e.target.value)} className="flex-1 px-1.5 py-1 rounded" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
            </div>
          </div>
          <div className="flex gap-3 text-[10px] px-1" style={{ color: "var(--text-muted)" }}>
            <span>Slug: <strong>{derivedSlug}</strong></span>
            <span>Region: <strong>{derivedRegion}</strong></span>
          </div>
          <VendorsEditor vendors={city.vendors} onChange={v => onChange({ ...city, vendors: v })} />
        </div>
      )}
    </div>
  )
}

export function LocationsSection({ token }: { token?: string }) {
  const [countries, setCountries] = useState<LocationCountry[]>([])
  const [loading, setLoading] = useState(true)
  const [saveMsg, setSaveMsg] = useState("")
  const [editingCountry, setEditingCountry] = useState<LocationCountry | null>(null)
  const [showCountryForm, setShowCountryForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{ type: "country"; slug: string } | { type: "city"; countrySlug: string; cityIdx: number } | null>(null)

  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {}
  const load = async () => {
    try {
      const res = await fetch("/api/admin/locations", { headers, credentials: "include" })
      if (res.ok) { const data = await res.json(); setCountries(data) }
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [token]) // eslint-disable-line react-hooks/set-state-in-effect,react-hooks/exhaustive-deps

  const saveAll = async (data: LocationCountry[]) => {
    setSaveMsg("")
    try {
      const res = await fetch("/api/admin/locations", { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(data), credentials: "include" })
      if (res.ok) { setSaveMsg("Saved!"); setCountries(data); setTimeout(() => setSaveMsg(""), 2000) }
      else setSaveMsg("Failed to save")
    } catch { setSaveMsg("Network error") }
  }

  const importStatic = () => saveAll(staticCountries)

  const addCountry = () => {
    setEditingCountry({ ...EMPTY_COUNTRY })
    setShowCountryForm(true)
  }

  const deleteCountry = (slug: string) => {
    setConfirmDelete({ type: "country", slug })
  }

  const confirmDeleteCountry = () => {
    if (!confirmDelete || confirmDelete.type !== "country") return
    saveAll(countries.filter(c => c.slug !== confirmDelete.slug))
    setConfirmDelete(null)
  }

  const saveCountry = () => {
    if (!editingCountry || !editingCountry.name_en.trim()) return
    const slug = slugify(editingCountry.name_en)
    const data = { ...editingCountry, slug }
    const exists = countries.findIndex(c => c.slug === slug)
    const next = [...countries]
    if (exists >= 0) next[exists] = data
    else next.push(data)
    saveAll(next)
    setShowCountryForm(false)
    setEditingCountry(null)
  }

  const addCityToCountry = (countrySlug: string) => {
    saveAll(countries.map(c => c.slug === countrySlug ? { ...c, cities: [...c.cities, { ...EMPTY_CITY, slug: `city-${c.cities.length + 1}` }] } : c))
  }

  const updateCity = (countrySlug: string, cityIdx: number, city: CityInfo) => {
    saveAll(countries.map(c => c.slug === countrySlug ? { ...c, cities: c.cities.map((cc, i) => i === cityIdx ? { ...city, slug: slugify(city.name_en), region: c.name_en } : cc) } : c))
  }

  const deleteCity = (countrySlug: string, cityIdx: number) => {
    setConfirmDelete({ type: "city", countrySlug, cityIdx })
  }

  const confirmDeleteCity = () => {
    if (!confirmDelete || confirmDelete.type !== "city") return
    saveAll(countries.map(c => c.slug === confirmDelete.countrySlug ? { ...c, cities: c.cities.filter((_, i) => i !== confirmDelete.cityIdx) } : c))
    setConfirmDelete(null)
  }

  const totalCities = countries.reduce((sum, c) => sum + c.cities.length, 0)
  const totalVendors = countries.reduce((sum, c) => sum + c.cities.reduce((s2, ct) => s2 + ct.vendors.length, 0), 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
          <Globe size={18} /> Locations
        </h2>
        <div className="flex gap-2">
          <button onClick={importStatic} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs" style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>
            <Download size={12} /> Import Default
          </button>
          <button onClick={addCountry} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs" style={{ background: "var(--accent)", color: "#fff" }}>
            <Plus size={12} /> Add Country
          </button>
        </div>
      </div>
      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
        {countries.length} countries · {totalCities} cities · {totalVendors} vendors
      </p>

      {saveMsg && <p className="text-xs" style={{ color: saveMsg === "Saved!" ? "#10B981" : "#EF4444" }}>{saveMsg}</p>}

      {loading ? (
        <p className="text-center py-8 text-sm" style={{ color: "var(--text-muted)" }}>Loading...</p>
      ) : (
        <div className="space-y-3">
          {/* Country editor form */}
          {showCountryForm && editingCountry && (
            <div className="rounded-xl p-3 space-y-2" style={{ border: "1px solid var(--accent)", background: "var(--surface)" }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">{editingCountry.name_en || "New Country"}</span>
                <div className="flex gap-1">
                  <button onClick={saveCountry} className="flex items-center gap-1 px-2 py-1 rounded text-xs" style={{ background: "#10B981", color: "#fff" }}><Check size={12} /> Save</button>
                  <button onClick={() => { setShowCountryForm(false); setEditingCountry(null) }} className="flex items-center gap-1 px-2 py-1 rounded text-xs" style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}><X size={12} /> Cancel</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input placeholder="Name EN" value={editingCountry.name_en} onChange={e => setEditingCountry({ ...editingCountry, name_en: e.target.value })} className="px-2 py-1 rounded" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
                <input placeholder="Name AR" value={editingCountry.name_ar} onChange={e => setEditingCountry({ ...editingCountry, name_ar: e.target.value })} className="px-2 py-1 rounded" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              </div>
              {editingCountry.name_en && (
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Slug: <strong>{slugify(editingCountry.name_en)}</strong></p>
              )}
            </div>
          )}

          {/* Country list */}
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {countries.map(country => (
              <div key={country.slug} className="rounded-xl p-3" style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Globe size={16} style={{ color: "var(--accent)" }} />
                    <span className="text-sm font-bold">{country.name_en} / {country.name_ar}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>{country.cities.length} cities</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => addCityToCountry(country.slug)} className="flex items-center gap-1 px-2 py-1 rounded text-[10px]" style={{ background: "var(--surface-2)", color: "var(--accent)" }}>
                      <Plus size={10} /> City
                    </button>
                    <button onClick={() => deleteCountry(country.slug)} className="p-1 rounded" style={{ color: "#EF4444" }} aria-label="Delete country"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {country.cities.map((city, ci) => (
                    <CityEditor key={ci} city={city} onChange={c => updateCity(country.slug, ci, c)} onDelete={() => deleteCity(country.slug, ci)} countryName={country.name_en} />
                  ))}
                  {country.cities.length === 0 && (
                    <p className="text-[11px] text-center py-3" style={{ color: "var(--text-muted)" }}>No cities yet</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title={confirmDelete?.type === "country" ? "Delete Country" : "Delete City"}
        message={confirmDelete?.type === "country" ? `Delete country "${confirmDelete.slug}" and all its cities?` : "Delete this city?"}
        confirmLabel="Delete"
        onConfirm={confirmDelete?.type === "country" ? confirmDeleteCountry : confirmDeleteCity}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
