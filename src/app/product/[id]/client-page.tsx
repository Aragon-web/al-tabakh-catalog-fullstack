"use client"

import { useEffect, useState, useMemo } from "react"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { ProductCard } from "@/components/ProductCard"
import { useStore } from "@/lib/store"
import { ShoppingCart, ArrowLeft, Home, Weight, Package, Edit, X, Star, Camera, Upload, Check, MessageSquare } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { categorySlug } from "@/lib/slugify"
import { getRelatedProducts } from "@/lib/product-similarity"

interface Review {
  id: number; rating: number; comment: string; image_url: string | null; customer_name: string; created_at: string
}

export function ProductClient({ productId }: { productId: string }) {
  const { lang, products, categories, cart, addToCart, updateQuantity, cartIds } = useStore()
  const [imgError, setImgError] = useState(false)
  const [zoomImage, setZoomImage] = useState(false)
  const [qtyInput, setQtyInput] = useState("")
  const [qtyError, setQtyError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")
  const [reviewImage, setReviewImage] = useState<File | null>(null)
  const [reviewImagePreview, setReviewImagePreview] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewMsg, setReviewMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const qty = qtyInput === "" ? 0 : parseInt(qtyInput, 10)

  useEffect(() => {
    fetch(`/api/reviews?product_id=${productId}`).then(r => r.json()).then(setReviews).catch(() => {})
  }, [productId])

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setQtyInput(raw)
    if (raw.includes(".") || raw.includes(",")) {
      setQtyError(lang === "en" ? "Whole numbers only" : "الأعداد الصحيحة فقط")
    } else {
      setQtyError(null)
    }
  }

  const product = useMemo(() => products.find(p => p.id === productId), [products, productId])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [productId])

  if (!product) {
    return (
      <>
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-4 pt-28 sm:pt-32 pb-8 text-center">
          <p className="text-lg" style={{ color: "var(--text-muted)" }}>
            {lang === "en" ? "Product not found" : "المنتج غير موجود"}
          </p>
          <Link href="/" className="inline-block mt-4 px-6 py-2.5 rounded-lg text-sm font-medium" style={{ background: "var(--accent)", color: "#fff" }}>
            {lang === "en" ? "Back to Home" : "العودة إلى الرئيسية"}
          </Link>
        </main>
        <Footer />
      </>
    )
  }

  const name = lang === "en" ? product.name_en : product.name_ar
  const desc = lang === "en" ? product.desc_en : product.desc_ar
  const cat = categories.find(c => c.id === product.category_id)
  const inCart = cartIds.has(product.id)
  const outOfStock = product.stock === 0
  const cartItem = cart.find(i => i.product_id === product.id)
  const currentQty = cartItem?.quantity ?? 0

  const t = {
    en: { home: "Home", add: "Add to Cart", remove: "Remove", edit: "Edit", save: "Save", related: "Related Products", share: "Share", weight: "Weight", pieces: "Pieces per carton" },
    ar: { home: "الرئيسية", add: "أضف إلى السلة", remove: "إزالة", edit: "تعديل", save: "حفظ", related: "منتجات ذات صلة", share: "مشاركة", weight: "الوزن", pieces: "قطعة لكل كرتون" },
  }[lang]

  const related = getRelatedProducts(product, products)

  async function submitReview() {
    if (!product || !reviewComment.trim()) return
    setSubmittingReview(true)
    setReviewMsg(null)
    const token = localStorage.getItem("altabakh_customer_token")
    if (!token) { setReviewMsg({ type: "error", text: lang === "en" ? "Please login to review" : "يرجى تسجيل الدخول للمراجعة" }); setSubmittingReview(false); return }
    try {
      let image_url = ""
      if (reviewImage) {
        const formData = new FormData()
        formData.append("file", reviewImage)
        const uploadRes = await fetch("/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData })
        if (uploadRes.ok) { const upData = await uploadRes.json(); image_url = upData.url || "" }
      }
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: product.id, rating: reviewRating, comment: reviewComment.trim(), image_url: image_url || undefined }),
      })
      const data = await res.json()
      if (res.ok) {
        setReviewMsg({ type: "success", text: lang === "en" ? `Review submitted! +${image_url ? "35" : "10"} points earned` : `تم تقديم المراجعة! +${image_url ? "٣٥" : "١٠"} نقطة` })
        setShowReviewForm(false)
        setReviewComment("")
        setReviewRating(5)
        setReviewImage(null)
        setReviewImagePreview("")
        fetch(`/api/reviews?product_id=${productId}`).then(r => r.json()).then(setReviews).catch(() => {})
      } else {
        setReviewMsg({ type: "error", text: data.error || (lang === "en" ? "Failed to submit" : "فشل التقديم") })
      }
    } catch { setReviewMsg({ type: "error", text: "Network error" }) }
    setSubmittingReview(false)
  }

  function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
    return <div className="flex items-center gap-0.5">{Array.from({ length: 5 }).map((_, i) => {
      const filled = i < value
      return onChange ? (
        <button key={i} onClick={() => onChange(i + 1)} className="p-0.5 min-touch" aria-label={`${i + 1} star`}>
          <Star size={18} fill={filled ? "var(--accent)" : "none"} style={{ color: "var(--accent)", opacity: filled ? 1 : 0.3 }} />
        </button>
      ) : (
        <span key={i}><Star size={14} fill={filled ? "var(--accent)" : "none"} style={{ color: "var(--accent)", opacity: filled ? 1 : 0.3 }} /></span>
      )
    })}</div>
  }

  return (
    <>
      <Header />
      <main className="flex-1 pb-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-24 sm:pt-28">
          <div className="flex items-center gap-2 text-xs sm:text-sm mb-4 sm:mb-6" style={{ color: "var(--text-muted)" }}>
            <Link href="/" className="hover:underline flex items-center gap-1"><Home size={12} />{t.home}</Link>
            {cat && <><span>/</span><Link href={`/category/${categorySlug(cat)}`} className="hover:underline">{lang === "en" ? cat.name_en : cat.name_ar}</Link></>}
            <span>/</span>
            <span style={{ color: "var(--text-secondary)" }}>{name}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 mb-12 sm:mb-16">
            <div className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden relative cursor-pointer" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              onClick={() => product.image_url && !imgError && setZoomImage(true)}>
              {product.image_url && !imgError ? (
                <Image
                  src={product.image_url}
                  alt={name}
                  fill
                  className="object-contain"
                  onError={() => setImgError(true)}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl sm:text-6xl" style={{ color: "var(--text-muted)" }}>
                  {name.charAt(0)}
                </div>
              )}
            </div>

            <div className="flex flex-col justify-center space-y-5 sm:space-y-6">
              <div>
                {product.is_new && (
                  <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold mb-3" style={{ background: "var(--accent)", color: "#fff" }}>
                    {lang === "en" ? "NEW" : "جديد"}
                  </span>
                )}
                {cat && (
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--accent)" }}>
                    {lang === "en" ? cat.name_en : cat.name_ar}
                  </p>
                )}
                <h1 className="heading text-2xl sm:text-3xl md:text-4xl font-bold">{name}</h1>
              </div>

              {desc && (
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {desc}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3" style={{ color: "var(--text-secondary)" }}>
                {product.weight && (
                  <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
                    <Weight size={16} style={{ color: "var(--accent)" }} />
                    <div>
                      <p className="text-[11px] uppercase font-medium" style={{ color: "var(--text-muted)" }}>{t.weight}</p>
                      <p className="text-sm font-medium">{product.weight}</p>
                    </div>
                  </div>
                )}
                {product.pieces_per_carton && (
                  <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
                    <Package size={16} style={{ color: "var(--accent)" }} />
                    <div>
                      <p className="text-[11px] uppercase font-medium" style={{ color: "var(--text-muted)" }}>{t.pieces}</p>
                      <p className="text-sm font-medium">{product.pieces_per_carton}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 pt-2">
                {outOfStock && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "var(--accent)", color: "#fff", opacity: 0.7 }}>
                    {lang === "en" ? "Out of Stock" : "نفذ من المخزون"}
                  </span>
                )}
                {product.stock != null && product.stock > 0 && (
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {lang === "en" ? `${product.stock} in stock` : `المتبقي ${product.stock}`}
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {!inCart ? (
                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <div className="flex gap-3">
                      <input type="number" step="1" min="1" value={qtyInput} placeholder={lang === "en" ? "Qty" : "الكمية"}
                        onChange={handleQtyChange}
                        style={{ background: "var(--surface-2)", border: "none", padding: "16px 20px", width: "130px", textAlign: "center", fontSize: "16px", fontWeight: 700, borderRadius: "9999px", outline: "none", MozAppearance: "textfield" }}
                      />
                      <button onClick={() => { if (qtyError || qtyInput === "" || qty < 1) return; addToCart({ product_id: product.id, name_en: product.name_en, name_ar: product.name_ar, quantity: qty, weight: product.weight, pieces_per_carton: product.pieces_per_carton }); setQtyInput("") }}
                        className="flex-1 flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold transition-all active:scale-95 shadow-lg hover:shadow-xl"
                        style={{ background: outOfStock || qtyInput === "" || qtyError || qty < 1 ? "var(--surface-2)" : "var(--accent)", color: outOfStock || qtyInput === "" || qtyError || qty < 1 ? "var(--text-muted)" : "#fff", cursor: outOfStock || qtyInput === "" || qtyError || qty < 1 ? "not-allowed" : "pointer" }}
                        disabled={outOfStock}>
                        <ShoppingCart size={18} /> {outOfStock ? (lang === "en" ? "Unavailable" : "غير متوفر") : t.add}
                      </button>
                    </div>
                    {qtyError && <p className="text-xs text-center" style={{ color: "#ef4444" }}>{qtyError}</p>}
                  </div>
                ) : !editing ? (
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold heading" style={{ color: "var(--text-secondary)" }}>
                      {lang === "en" ? `Qty: ${currentQty}` : `الكمية: ${currentQty}`}
                    </span>
                    <button onClick={() => { setQtyInput(String(currentQty)); setEditing(true) }}
                      className="flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all active:scale-95 min-touch"
                      style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>
                      <Edit size={16} /> {t.edit}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <div className="flex gap-3">
                      <input type="number" step="1" min="1" value={qtyInput}
                        onChange={handleQtyChange}
                        style={{ background: "var(--surface-2)", border: "none", padding: "16px 20px", width: "130px", textAlign: "center", fontSize: "16px", fontWeight: 700, borderRadius: "9999px", outline: "none", MozAppearance: "textfield" }}
                      />
                      <button onClick={() => { if (qtyError || qtyInput === "" || qty < 1) return; updateQuantity(product.id, qty); setQtyInput(""); setEditing(false) }}
                        className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold transition-all active:scale-95 shadow-lg hover:shadow-xl"
                        style={{ background: qtyInput === "" || qtyError || qty < 1 ? "var(--surface-2)" : "var(--accent)", color: qtyInput === "" || qtyError || qty < 1 ? "var(--text-muted)" : "#fff", cursor: qtyInput === "" || qtyError || qty < 1 ? "not-allowed" : "pointer" }}>
                        {t.save}
                      </button>
                    </div>
                    {qtyError && <p className="text-xs text-center" style={{ color: "#ef4444" }}>{qtyError}</p>}
                  </div>
                )}
              </div>

              <button onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: name, url: window.location.href }).catch(() => {})
                } else {
                  navigator.clipboard.writeText(window.location.href).catch(() => {})
                }
              }}
                className="flex items-center justify-center gap-1.5 mt-3 text-sm transition-colors w-full py-3 min-touch rounded-lg"
                style={{ color: "var(--text-muted)", background: "var(--surface-2)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                {t.share}
              </button>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mb-12 sm:mb-16">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <MessageSquare size={18} style={{ color: "var(--accent)" }} />
                <h2 className="heading text-xl sm:text-2xl font-bold">{lang === "en" ? "Reviews" : "المراجعات"}</h2>
                {reviews.length > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
                    {reviews.length} {lang === "en" ? "reviews" : "مراجعة"}
                  </span>
                )}
              </div>
              <button onClick={() => setShowReviewForm(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95"
                style={{ background: "var(--accent)", color: "#fff" }}>
                <Star size={13} /> {lang === "en" ? "Write Review" : "اكتب مراجعة"}
              </button>
            </div>

            {reviews.length > 0 && (
              <div className="flex items-center gap-3 mb-4 p-3 rounded-lg" style={{ background: "var(--surface-2)" }}>
                <div className="flex items-center gap-1">
                  <StarRating value={Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length)} />
                </div>
                <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  ({reviews.length} {lang === "en" ? "reviews" : "مراجعات"})
                </span>
              </div>
            )}

            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="p-3 sm:p-4 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
                        {r.customer_name.charAt(0)}
                      </div>
                      <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{r.customer_name}</span>
                    </div>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  <StarRating value={r.rating} />
                  <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>{r.comment}</p>
                  {r.image_url && (
                    <img src={r.image_url} alt="Review" className="mt-2 rounded-lg max-h-48 object-cover" />
                  )}
                </div>
              ))}
              {reviews.length === 0 && (
                <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>
                  {lang === "en" ? "No reviews yet. Be the first!" : "لا توجد مراجعات بعد. كن أول من يقيم!"}
                </p>
              )}
            </div>
          </div>

          {/* Review Form Modal */}
          {showReviewForm && (
            <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => { if (!submittingReview) setShowReviewForm(false) }}>
              <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden animate-slide-up" style={{ background: "var(--surface)" }} onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
                  <h3 className="font-bold text-sm">{lang === "en" ? "Write a Review" : "اكتب مراجعة"}</h3>
                  <button onClick={() => setShowReviewForm(false)} className="p-1 rounded-lg hover:bg-surface-2 min-touch" style={{ color: "var(--text-muted)" }}><X size={16} /></button>
                </div>
                <div className="p-5 space-y-4">
                  {reviewMsg && (
                    <div className="px-3 py-2 rounded-lg text-xs" style={{ background: reviewMsg.type === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: reviewMsg.type === "success" ? "#10b981" : "#ef4444" }}>
                      {reviewMsg.text}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>{lang === "en" ? "Rating" : "التقييم"}</p>
                    <StarRating value={reviewRating} onChange={setReviewRating} />
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>{lang === "en" ? "Your Review" : "مراجعتك"}</p>
                    <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder={lang === "en" ? "Share your experience..." : "شارك تجربتك..."} rows={4} maxLength={500}
                      className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)", resize: "vertical" }} />
                    <div className="flex justify-end mt-1"><span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{reviewComment.length}/500</span></div>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-2" style={{ color: "var(--text-muted)" }}>{lang === "en" ? "Photo (optional)" : "صورة (اختياري)"}</p>
                    <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer text-xs font-medium transition-colors hover:opacity-80" style={{ background: "var(--surface-2)", border: "1px dashed var(--border)", color: "var(--text-secondary)" }}>
                      <Camera size={15} />
                      {reviewImagePreview ? (lang === "en" ? "Change photo" : "تغيير الصورة") : (lang === "en" ? "Add photo (+25 pts)" : "إضافة صورة (+٢٥ نقطة)" )}
                      <input type="file" accept="image/*" className="hidden" onChange={e => {
                        const f = e.target.files?.[0]; if (!f) return;
                        setReviewImage(f); setReviewImagePreview(URL.createObjectURL(f))
                      }} />
                    </label>
                    {reviewImagePreview && (
                      <div className="relative mt-2 inline-block">
                        <img src={reviewImagePreview} alt="Preview" className="h-24 rounded-lg object-cover" />
                        <button onClick={() => { setReviewImage(null); setReviewImagePreview("") }} className="absolute -top-2 -right-2 p-0.5 rounded-full" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}><X size={12} /></button>
                      </div>
                    )}
                  </div>
                  <button onClick={submitReview} disabled={submittingReview || !reviewComment.trim()}
                    className="w-full py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
                    style={{ background: "var(--accent)", color: "#fff" }}>
                    {submittingReview ? (lang === "en" ? "Submitting..." : "جاري التقديم...") : (lang === "en" ? "Submit Review" : "تقديم المراجعة")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {related.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="heading text-xl sm:text-2xl md:text-3xl">{t.related}</h2>
                {cat && (
                  <Link href={`/category/${categorySlug(cat)}`} className="text-sm font-medium" style={{ color: "var(--accent)" }}>
                    {lang === "en" ? "View All →" : "عرض الكل ←"}
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                {related.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}

          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              <ArrowLeft size={14} />
              {lang === "en" ? "Back to All Products" : "العودة إلى جميع المنتجات"}
            </Link>
          </div>
        </div>
      </main>

      {zoomImage && product.image_url && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setZoomImage(false)} role="dialog" aria-modal="true" aria-label="Product image">
          <button onClick={() => setZoomImage(false)} className="absolute top-4 right-4 p-2 rounded-full" style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }} aria-label="Close zoom">
            <X size={24} />
          </button>
          <img src={product.image_url} alt={name} loading="lazy" className="max-w-full max-h-full object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}

      <Footer />
    </>
  )
}
