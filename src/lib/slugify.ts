export function slugify(text: string): string {
  if (!text) return ""
  // Transliterate common Arabic characters to Latin
  const map: Record<string, string> = {
    "أ": "a", "إ": "e", "ا": "a", "ب": "b", "ت": "t", "ث": "th",
    "ج": "j", "ح": "h", "خ": "kh", "د": "d", "ذ": "dh", "ر": "r",
    "ز": "z", "س": "s", "ش": "sh", "ص": "s", "ض": "d", "ط": "t",
    "ظ": "z", "ع": "a", "غ": "gh", "ف": "f", "ق": "q", "ك": "k",
    "ل": "l", "م": "m", "ن": "n", "ه": "h", "و": "w", "ي": "y",
    "ة": "h", "ى": "a", "ئ": "e", "ؤ": "w", " ": "-", "آ": "a",
  }
  let result = ""
  for (const ch of text.toLowerCase()) {
    result += map[ch] || ch
  }
  result = result.replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "").replace(/-+/g, "-")
  return result || "cat"
}

export function categorySlug(cat: { id: string; name_en?: string }): string {
  const slug = slugify(cat.name_en || "")
  return slug || cat.id
}
