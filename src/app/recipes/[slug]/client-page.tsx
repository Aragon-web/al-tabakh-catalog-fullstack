"use client"

import { useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { PageTransition } from "@/components/PageTransition"
import { Home, Calendar, User, ArrowLeft, ShoppingCart, MessageSquare, ThumbsUp, Send, Award, Check } from "lucide-react"
import Link from "next/link"
import type { Recipe, Product } from "@/lib/types"

interface Comment {
  id: number; comment: string; customer_name: string; created_at: string
}

export function RecipeDetailClient({ recipe }: { recipe: Recipe | null }) {
  const { lang, addToCart, cart } = useStore()
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loadingRelated, setLoadingRelated] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState("")
  const [submittingComment, setSubmittingComment] = useState(false)
  const [commentMsg, setCommentMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [madeItToday, setMadeItToday] = useState(false)
  const [madeItMsg, setMadeItMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [submittingMadeIt, setSubmittingMadeIt] = useState(false)

  useEffect(() => {
    if (!recipe) return
    fetch(`/api/recipes/${recipe.slug}/comments`).then(r => r.json()).then(setComments).catch(() => {})
  }, [recipe])

  useEffect(() => {
    if (!recipe) return
    let ids: string[] = []
    try {
      const obj = JSON.parse(recipe.content_en)
      if (Array.isArray(obj.relatedProductIds)) ids = obj.relatedProductIds
    } catch {}
    if (ids.length === 0) return
    setLoadingRelated(true) // eslint-disable-line react-hooks/set-state-in-effect
    fetch("/api/products").then(r => r.json()).then((all: Product[]) => {
      setRelatedProducts(all.filter(p => ids.includes(p.id)))
    }).catch(() => {}).finally(() => setLoadingRelated(false))
  }, [recipe])

  if (!recipe) {
    return (
      <PageTransition>
        <Header />
        <main className="flex-1 flex items-center justify-center" style={{ background: "var(--bg)" }}>
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{lang === "en" ? "Recipe not found" : "الوصفة غير موجودة"}</p>
            <Link href="/recipes" className="inline-block mt-4 px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "var(--accent)", color: "#fff" }}>{lang === "en" ? "Back to Recipes" : "العودة إلى الوصفات"}</Link>
          </div>
        </main>
        <Footer />
      </PageTransition>
    )
  }

  const title = lang === "en" ? recipe.title_en : recipe.title_ar
  const content = lang === "en" ? recipe.content_en : recipe.content_ar
  const excerpt = lang === "en" ? recipe.excerpt_en : recipe.excerpt_ar

  async function submitComment() {
    if (!recipe || !commentText.trim()) return
    setSubmittingComment(true); setCommentMsg(null)
    const token = localStorage.getItem("altabakh_customer_token")
    if (!token) { setCommentMsg({ type: "error", text: lang === "en" ? "Please login to comment" : "يرجى تسجيل الدخول للتعليق" }); setSubmittingComment(false); return }
    try {
      const res = await fetch(`/api/recipes/${recipe.slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ comment: commentText.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setCommentMsg({ type: "success", text: lang === "en" ? "Comment posted! +5 points" : "تم نشر التعليق! +٥ نقاط" })
        setCommentText("")
        fetch(`/api/recipes/${recipe.slug}/comments`).then(r => r.json()).then(setComments).catch(() => {})
      } else { setCommentMsg({ type: "error", text: data.error || (lang === "en" ? "Failed to post" : "فشل النشر") }) }
    } catch { setCommentMsg({ type: "error", text: "Network error" }) }
    setSubmittingComment(false)
  }

  async function handleMadeIt() {
    if (!recipe) { setSubmittingMadeIt(false); return }
    setSubmittingMadeIt(true); setMadeItMsg(null)
    const token = localStorage.getItem("altabakh_customer_token")
    if (!token) { setMadeItMsg({ type: "error", text: lang === "en" ? "Please login first" : "يرجى تسجيل الدخول أولاً" }); setSubmittingMadeIt(false); return }
    try {
      const res = await fetch(`/api/recipes/${recipe.slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ comment: "I made this recipe! 🎉" }),
      })
      const data = await res.json()
      if (res.ok) {
        setMadeItToday(true)
        setMadeItMsg({ type: "success", text: lang === "en" ? "Claimed! +5 points" : "تم! +٥ نقاط" })
        fetch(`/api/recipes/${recipe.slug}/comments`).then(r => r.json()).then(setComments).catch(() => {})
      } else { setMadeItMsg({ type: "error", text: data.error || (lang === "en" ? "Already claimed today" : "تم المطالبة اليوم بالفعل") }) }
    } catch { setMadeItMsg({ type: "error", text: "Network error" }) }
    setSubmittingMadeIt(false)
  }

  return (
    <PageTransition>
      <Header />
      <main style={{ background: "var(--bg)" }}>
        {recipe.image_url && (
          <div className="w-full h-48 sm:h-64 md:h-80 overflow-hidden">
            <img src={recipe.image_url} alt={title} loading="lazy" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <nav className="flex items-center gap-1.5 text-xs sm:text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            <Link href="/" className="hover:underline flex items-center gap-1"><Home size={12} />{lang === "en" ? "Home" : "الرئيسية"}</Link>
            <span>/</span>
            <Link href="/recipes" className="hover:underline">{lang === "en" ? "Recipes" : "الوصفات"}</Link>
            <span>/</span>
            <span style={{ color: "var(--text-secondary)" }}>{title}</span>
          </nav>

          <h1 className="heading text-2xl sm:text-3xl font-bold mb-3">{title}</h1>

          <div className="flex items-center gap-4 text-xs sm:text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            {recipe.author && <span className="flex items-center gap-1"><User size={13} />{recipe.author}</span>}
            <span className="flex items-center gap-1"><Calendar size={13} />{new Date(recipe.created_at).toLocaleDateString(lang === "ar" ? "ar-IQ" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
          </div>

          {excerpt && (
            <p className="text-sm sm:text-base leading-relaxed mb-6" style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>{excerpt}</p>
          )}

          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content }} style={{ color: "var(--text-primary)", lineHeight: 1.8 }} />

          {(relatedProducts.length > 0 || loadingRelated) && (
            <div className="mt-10 pt-8" style={{ borderTop: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1 h-5 rounded-full" style={{ background: "var(--accent)" }} />
                <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>{lang === "en" ? "Shop Ingredients" : "اشترِ المكونات"}</h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>{relatedProducts.length} {lang === "en" ? "items" : "منتجات"}</span>
              </div>
              {loadingRelated && relatedProducts.length === 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl overflow-hidden animate-pulse" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                      <div className="aspect-[4/3]" style={{ background: "var(--surface-2)" }} />
                      <div className="p-3 space-y-2">
                        <div className="h-3 rounded" style={{ background: "var(--surface-2)" }} />
                        <div className="h-2 w-1/2 rounded" style={{ background: "var(--surface-2)" }} />
                        <div className="h-8 rounded-lg" style={{ background: "var(--surface-2)" }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {relatedProducts.map(p => {
                  const inCart = cart.some(c => c.product_id === p.id)
                  return (
                    <div key={p.id}
                      className="group rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
                      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                    >
                      <Link href={`/product/${p.id}`} className="block aspect-[4/3] overflow-hidden" style={{ background: "var(--surface-2)" }}>
                        {p.image_url ? (
                          <img src={p.image_url} alt={lang === "en" ? p.name_en : p.name_ar} loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: "var(--text-muted)" }}>
                            {lang === "en" ? "No Image" : "لا توجد صورة"}
                          </div>
                        )}
                      </Link>
                      <div className="p-3 space-y-2">
                        <Link href={`/product/${p.id}`}>
                          <h4 className="text-xs font-semibold leading-snug line-clamp-2 hover:underline" style={{ color: "var(--text-primary)" }}>
                            {lang === "en" ? p.name_en : p.name_ar}
                          </h4>
                        </Link>
                        {p.weight && (
                          <p className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>{p.weight}</p>
                        )}
                        <button
                          onClick={() => addToCart({ product_id: p.id, name_en: p.name_en, name_ar: p.name_ar, quantity: 1, weight: p.weight, pieces_per_carton: p.pieces_per_carton })}
                          className="w-full py-2 rounded-lg text-[11px] font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95"
                          style={{
                            background: inCart ? "var(--accent)" : "var(--surface-2)",
                            color: inCart ? "#fff" : "var(--text-secondary)",
                            boxShadow: inCart ? "none" : "none",
                          }}
                        >
                          <ShoppingCart size={13} className={inCart ? "fill-current" : ""} />
                          {inCart ? (lang === "en" ? "Added ✓" : "أضيف ✓") : (lang === "en" ? "Add to Cart" : "أضف للسلة")}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
              )}
            </div>
          )}

          {/* I Made This! */}
          <div className="mt-6 p-4 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: madeItToday ? "rgba(16,185,129,0.15)" : "var(--surface-2)" }}>
                <Award size={18} style={{ color: madeItToday ? "#10b981" : "var(--accent)" }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{lang === "en" ? "Did you make this recipe?" : "هل جربت هذه الوصفة؟"}</p>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>{lang === "en" ? "Earn 5 points when you try it!" : "احصل على ٥ نقاط عند تجربتها!"}</p>
              </div>
              <button onClick={handleMadeIt} disabled={submittingMadeIt || madeItToday}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
                style={{ background: madeItToday ? "rgba(16,185,129,0.15)" : "var(--accent)", color: madeItToday ? "#10b981" : "#fff" }}>
                {madeItToday ? <Check size={14} /> : <ThumbsUp size={14} />}
                {madeItToday ? (lang === "en" ? "Claimed +5" : "تم +٥") : (lang === "en" ? "I Made It!" : "جربتها!")}
              </button>
            </div>
            {madeItMsg && <p className="text-xs mt-2" style={{ color: madeItMsg.type === "success" ? "#10b981" : "#ef4444" }}>{madeItMsg.text}</p>}
          </div>

          {/* Comments Section */}
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={16} style={{ color: "var(--accent)" }} />
              <h3 className="text-base font-bold">{lang === "en" ? "Comments" : "التعليقات"}</h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>{comments.length}</span>
            </div>

            <div className="space-y-3 mb-4">
              {comments.map(c => (
                <div key={c.id} className="p-3 rounded-lg" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{c.customer_name}</span>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{c.comment}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>{lang === "en" ? "No comments yet. Share your thoughts!" : "لا توجد تعليقات بعد. شاركنا رأيك!"}</p>
              )}
            </div>

            {commentMsg && <div className="mb-3 px-3 py-2 rounded-lg text-xs" style={{ background: commentMsg.type === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: commentMsg.type === "success" ? "#10b981" : "#ef4444" }}>{commentMsg.text}</div>}

            <div className="flex gap-2">
              <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder={lang === "en" ? "Write a comment... (+5 pts)" : "اكتب تعليقًا... (+٥ نقاط)"} maxLength={300}
                className="flex-1 px-3 py-2.5 rounded-lg text-sm outline-none" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)" }} />
              <button onClick={submitComment} disabled={submittingComment || !commentText.trim()}
                className="px-4 py-2.5 rounded-lg text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                style={{ background: "var(--accent)", color: "#fff" }}>
                <Send size={13} /> {lang === "en" ? "Send" : "إرسال"}
              </button>
            </div>
          </div>

          <div className="mt-8 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
            <Link href="/recipes" className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline" style={{ color: "var(--accent)" }}>
              <ArrowLeft size={14} />{lang === "en" ? "Back to Recipes" : "العودة إلى الوصفات"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </PageTransition>
  )
}
