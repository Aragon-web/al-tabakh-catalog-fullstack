import crypto from "crypto"

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

export function generatePromoCode(): string {
  const bytes = crypto.randomBytes(8)
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += CHARS[bytes[i] % CHARS.length]
  }
  return code
}

export function generatePromoCodes(count: number): string[] {
  const codes = new Set<string>()
  while (codes.size < count) {
    codes.add(generatePromoCode())
  }
  return Array.from(codes)
}
