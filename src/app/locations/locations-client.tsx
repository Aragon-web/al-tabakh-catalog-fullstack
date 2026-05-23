"use client"

import { useEffect, useRef, useState } from "react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { useStore } from "@/lib/store"
import { type LocationCountry, type CityInfo } from "@/lib/cities"
import { MapPin, Phone, Store, Navigation, Globe } from "lucide-react"

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}
import L from "leaflet"
import "leaflet/dist/leaflet.css"

function getMarkerIconUrl(): string {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 31 31'%3E%3Ccircle cx='15.5' cy='15.5' r='14.5' fill='%232563EB' stroke='white' stroke-width='2'/%3E%3C/svg%3E`
}

function renderMarkers(map: L.Map, vendors: CityInfo["vendors"], lang: "en" | "ar") {
  map.eachLayer((layer: L.Layer) => { if (layer instanceof L.Marker) layer.remove() })
  vendors.forEach(v => {
    const icon = L.icon({
      iconUrl: getMarkerIconUrl(),
      iconSize: [31, 31],
      iconAnchor: [15, 15],
      popupAnchor: [0, -16],
    })
    const marker = L.marker([v.lat, v.lng], { icon }).addTo(map)
    const label = escapeHtml(lang === "en" ? v.name_en : v.name_ar)
    const addr = escapeHtml(lang === "en" ? v.address_en : v.address_ar)
    const phone = escapeHtml(v.phone)
    marker.bindPopup(`
      <div style="font-family:sans-serif;min-width:180px">
        <strong>${label}</strong><br/>
        <span style="font-size:11px">${addr}</span><br/>
        <a href="tel:${phone}" style="font-size:11px;color:#2563EB">${phone}</a>
      </div>
    `)
  })
}

export function LocationsClient() {
  const { lang } = useStore()
  const [countries, setCountries] = useState<LocationCountry[]>([])
  const [selectedCountry, setSelectedCountry] = useState<LocationCountry | null>(null)
  const [selectedCity, setSelectedCity] = useState<CityInfo | null>(null)
  const [activeVendor, setActiveVendor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)

  useEffect(() => {
    fetch("/api/locations")
      .then(r => r.json())
      .then(data => {
        setCountries(data)
        if (data.length > 0) {
          setSelectedCountry(data[0])
          if (data[0].cities.length > 0) setSelectedCity(data[0].cities[0])
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!mapRef.current || !selectedCity) return
    const el = mapRef.current
    ;(async () => {
      try {
        if (!mapInstance.current) {
          const map = L.map(el, { zoomControl: true }).setView([selectedCity.lat, selectedCity.lng], 11)
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
          }).addTo(map)
          mapInstance.current = map
          renderMarkers(map, selectedCity.vendors, lang)
          setTimeout(() => map.invalidateSize(), 100)
        } else {
          renderMarkers(mapInstance.current, selectedCity.vendors, lang)
          mapInstance.current.setView([selectedCity.lat, selectedCity.lng], 11, { animate: true })
        }
      } catch (err) {
        console.error("Map initialization failed:", err)
      }
    })()
  }, [selectedCity, lang])

  useEffect(() => {
    if (!selectedCity && mapInstance.current) {
      mapInstance.current.remove()
      mapInstance.current = null
    }
  }, [selectedCity])

  useEffect(() => {
    return () => { if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null } }
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} /></div>

  const t = {
    en: { title: "Our Locations", subtitle: "Find Al-Tabakh vendors near you", vendors: "Vendors", call: "Call", directions: "Directions", noVendors: "No vendors listed yet", selectCountry: "Select Country", selectCity: "Select City" },
    ar: { title: "فروعنا", subtitle: "اعثر على باعة مالك الطباخ بالقرب منك", vendors: "الباعة", call: "اتصال", directions: "اتجاهات", noVendors: "لا يوجد باعة مدرجون بعد", selectCountry: "اختر الدولة", selectCity: "اختر المدينة" },
  }[lang]

  return (
    <><Header />
    <main style={{ background: "var(--bg)" }}>
      <div className="pt-20 sm:pt-24 pb-6" style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <MapPin size={22} style={{ color: "var(--accent)" }} />
            <Store size={22} style={{ color: "var(--wa)" }} />
          </div>
          <h1 className="heading text-2xl sm:text-3xl font-bold mb-1">{t.title}</h1>
          <p className="text-xs sm:text-sm" style={{ color: "var(--text-secondary)" }}>{t.subtitle}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-6 pb-12 space-y-5">

        {/* Countries row */}
        <div className="flex flex-wrap gap-2">
          {countries.map(c => {
            const active = selectedCountry?.slug === c.slug
            return (
              <button key={c.slug} onClick={() => { setSelectedCountry(c); setSelectedCity(c.cities[0] || null); setActiveVendor(null) }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: active ? "var(--accent)" : "var(--surface)",
                  color: active ? "#fff" : "var(--text-secondary)",
                  border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                  boxShadow: active ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
                }}>
                <Globe size={16} />
                {lang === "en" ? c.name_en : c.name_ar}
                <span className="text-[10px] opacity-70 ml-1">{c.cities.length}</span>
              </button>
            )
          })}
        </div>

        {/* Cities row */}
        {selectedCountry && (
          <div className="flex flex-wrap gap-1.5">
            {selectedCountry.cities.length === 0 ? (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{lang === "en" ? "No cities added yet" : "لا توجد مدن مضافة بعد"}</p>
            ) : selectedCountry.cities.map(c => {
              const active = selectedCity?.slug === c.slug
              return (
                <button key={c.slug} onClick={() => { setSelectedCity(c); setActiveVendor(null) }}
                  className="px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-all"
                  style={{
                    background: active ? "color-mix(in srgb, var(--accent) 15%, var(--surface))" : "var(--surface-2)",
                    color: active ? "var(--accent)" : "var(--text-muted)",
                    border: `1px solid ${active ? "var(--accent)" : "transparent"}`,
                    fontWeight: active ? 600 : 400,
                  }}>
                  {lang === "en" ? c.name_en : c.name_ar}
                  <span className="ml-1 text-[10px] opacity-60">({c.vendors.length})</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Map */}
        {selectedCity && (
          <div ref={mapRef} className="w-full rounded-xl overflow-hidden" style={{ height: "400px", border: "1px solid var(--border)", minHeight: "400px" }} />
        )}

        {/* Vendor cards */}
        {selectedCity && (
          <div>
            <h2 className="text-base font-bold mb-3 flex items-center gap-1.5" style={{ color: "var(--accent)" }}>
              <Store size="16" /> {t.vendors} ({selectedCity.vendors.length})
            </h2>
            {selectedCity.vendors.length === 0 ? (
              <p className="text-sm py-8 text-center" style={{ color: "var(--text-muted)" }}>{t.noVendors}</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {selectedCity.vendors.map((v, i) => {
                  const isActive = activeVendor === v.name_en
                  return (
                    <div key={i} onMouseEnter={() => setActiveVendor(v.name_en)} onMouseLeave={() => setActiveVendor(null)}
                      className="rounded-xl p-3.5 transition-all duration-200"
                      style={{
                        background: isActive ? "color-mix(in srgb, var(--accent) 5%, var(--surface))" : "var(--surface)",
                        border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
                      }}>
                      <div className="flex items-start justify-between mb-1.5">
                        <div>
                          <p className="text-sm font-semibold">{lang === "en" ? v.name_en : v.name_ar}</p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <a href={`tel:${v.phone}`} className="p-1.5 rounded-lg transition-colors" style={{ background: "var(--surface-2)", color: "var(--accent)" }} title={t.call}>
                            <Phone size="14" />
                          </a>
                          <a href={`https://www.google.com/maps/dir/?api=1&destination=${v.lat},${v.lng}`} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 rounded-lg transition-colors" style={{ background: "var(--surface-2)", color: "#2563EB" }} title={t.directions}>
                            <Navigation size="14" />
                          </a>
                        </div>
                      </div>
                      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{lang === "en" ? v.address_en : v.address_ar}</p>
                      <p className="text-[11px] font-mono mt-1" style={{ color: "var(--text-muted)" }}>{v.phone}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
    <Footer /></>
  )
}
