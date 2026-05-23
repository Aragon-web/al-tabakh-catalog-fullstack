import type { Product } from "./types"

function getKeywords(s: string): string[] {
  return s.split(/\s+/).filter(w => w.length > 2)
}

function countShared(aWords: string[], bWords: string[]): number {
  const set = new Set(aWords.map(w => w.toLowerCase()))
  return bWords.filter(w => set.has(w.toLowerCase())).length
}

export function getRelatedProducts(product: Product, all: Product[]): Product[] {
  const scored = all
    .filter(p => p.id !== product.id)
    .map(p => {
      let score = 0
      if (p.category_id && p.category_id !== "all" && p.category_id === product.category_id) {
        score += 50
      }
      const enWords = getKeywords(p.name_en)
      const arWords = getKeywords(p.name_ar)
      const curEnWords = getKeywords(product.name_en)
      const curArWords = getKeywords(product.name_ar)
      score += Math.min(countShared(enWords, curEnWords) * 10, 15)
      score += Math.min(countShared(arWords, curArWords) * 10, 15)
      if (p.pieces_per_carton && p.pieces_per_carton === product.pieces_per_carton) {
        score += 5
      }
      return { product: p, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)

  if (scored.length > 0 && scored[0].score > 0) {
    return scored.map(s => s.product)
  }

  return all.filter(p => p.category_id === product.category_id && p.id !== product.id).slice(0, 6)
}
