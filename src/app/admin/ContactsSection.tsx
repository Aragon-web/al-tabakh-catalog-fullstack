"use client"

import { useState } from "react"
import { Mail, User, Calendar, FileText, ChevronDown, ExternalLink } from "lucide-react"
import { useStore } from "@/lib/store"
import { adminT } from "@/lib/admin-translations"

interface Contact {
  id: number; name: string; email: string; subject: string; message: string; file_url: string | null; created_at: string
}

export function ContactsSection({ contacts }: { contacts: Contact[] }) {
  const { lang } = useStore(); const t = adminT[lang]
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <div>
      <h2 className="text-base sm:text-lg font-bold mb-3">{t.messages} ({contacts.length})</h2>
      {contacts.length === 0 ? (
        <p className="text-center py-12 text-sm" style={{ color: "var(--text-muted)" }}>{t.noMessages}</p>
      ) : (
        <div className="space-y-2">
          {contacts.map(c => (
            <div key={c.id} className="rounded-lg overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <button onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                className="flex items-center gap-3 w-full text-left px-4 py-3 min-h-[52px]">
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: "var(--surface-2)", color: "var(--accent)" }}>
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.subject}</p>
                  <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>{c.name} &middot; {new Date(c.created_at).toLocaleDateString()}</p>
                </div>
                <ChevronDown size={15} style={{ color: "var(--text-muted)", transform: expanded === c.id ? "rotate(180deg)" : "" }} />
              </button>
              {expanded === c.id && (
                <div className="px-4 pb-4 space-y-3" style={{ borderTop: "1px solid var(--border)" }}>
                  <div className="pt-3 grid grid-cols-2 gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <div className="flex items-center gap-1.5"><User size={12} /> {c.name}</div>
                    <div className="flex items-center gap-1.5"><Mail size={12} /> {c.email}</div>
                    <div className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(c.created_at).toLocaleString()}</div>
                    {c.file_url && (
                      <a href={c.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5" style={{ color: "var(--accent)" }}>
                        <FileText size={12} /> {t.viewFile} <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{c.message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}