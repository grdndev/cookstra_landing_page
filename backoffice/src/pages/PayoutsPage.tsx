import { useEffect, useMemo, useState } from "react"
import { useAuth } from "../auth/AuthContext"
import { getPayouts, getHoursDisputes, resolveHoursDispute, getUpcomingPayments } from "../api/api"

type Invoice = {
  id: string
  invoice_number: string
  status: string
  issue_date: string
  amount_total_ttc_cents: number
  commission_amount_ht_cents: number
  currency: string
  employer_company_name: string
  freelance_name: string
  service_start_date: string
  service_end_date: string
}

const statusLabels: Record<string, string> = {
  paid: 'Payée',
  pending: 'En attente',
  failed: 'Échec',
}

const statusColors: Record<string, string> = {
  paid: 'text-green-700 bg-green-50 border-green-200',
  pending: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  failed: 'text-red-600 bg-red-50 border-red-200',
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function PayoutsPage() {
  const { token } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [downloading, setDownloading] = useState<string | null>(null)
  const [hoursDisputes, setHoursDisputes] = useState<any[]>([]);
  const [hoursDisputesLoading, setHoursDisputesLoading] = useState(false);
  const [resolveOpenFor, setResolveOpenFor] = useState<any | null>(null);
  const [resolvedStart, setResolvedStart] = useState('');
  const [resolvedEnd, setResolvedEnd] = useState('');
  const [resolutionDecision, setResolutionDecision] = useState<'employer' | 'freelance'>('employer');
  const [resolutionNote, setResolutionNote] = useState('');
  const [resolveSaving, setResolveSaving] = useState(false)
  const [upcoming, setUpcoming] = useState<any[]>([])
  const [upcomingLoading, setUpcomingLoading] = useState(true)

  const timeOptions = useMemo(() => {
    const opts: string[] = []
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 5) {
        opts.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
      }
    }
    return opts
  }, [])

  useEffect(() => {
    getPayouts(token!).then(r => r.json()).then(d => {
      if (d.success) { setInvoices(d.data ?? []); setTotal(d.total ?? 0) }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const loadHoursDisputes = async () => {
    if (!token) return;
    setHoursDisputesLoading(true);
    try {
      const resp = await getHoursDisputes(token);
      const data = resp instanceof Response ? await resp.json() : resp;
      setHoursDisputes((data?.items ?? data?.data ?? data) ?? []);
    } catch {
      setHoursDisputes([]);
    } finally {
      setHoursDisputesLoading(false);
    }
  };

  useEffect(() => {
    loadHoursDisputes()
  }, [token])

  useEffect(() => {
    if (!token) return
    getUpcomingPayments(token).then(r => r.json()).then(d => {
      if (d.success) setUpcoming(d.data ?? [])
    }).catch(() => {}).finally(() => setUpcomingLoading(false))
  }, [token])

  async function downloadPDF(invoiceId: string, invoiceNumber: string) {
    setDownloading(invoiceId)
    try {
      const res = await fetch(`${API_URL}/api/billing/invoices/${invoiceId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoiceNumber}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(null)
    }
  }

  const openResolve = (d: any) => {
    setResolveOpenFor(d);
    setResolvedStart(d?.employer_actual_start || d?.freelance_actual_start || '');
    setResolvedEnd(d?.employer_actual_end || d?.freelance_actual_end || '');
    setResolutionDecision('employer');
    setResolutionNote('');
  };

  const submitResolve = async () => {
    if (!token || !resolveOpenFor) return;
    setResolveSaving(true);
    try {
      await resolveHoursDispute(token, resolveOpenFor.mission_id, {
        resolved_start: resolvedStart,
        resolved_end: resolvedEnd,
        decision: resolutionDecision,
        note: resolutionNote || undefined,
      });
      setResolveOpenFor(null);
      await loadHoursDisputes();
    } finally {
      setResolveSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse">Chargement...</div>

  return (
    <main className="flex flex-col gap-8">

      {/* Missions à venir */}
      <section className="flex flex-col gap-3">
        <div>
          <h2>Missions à venir <span className="text-base font-normal text-(--text-secondary)">({upcoming.length})</span></h2>
          <p className="text-sm text-(--text-secondary) mt-1">Employers avec une mission planifiée et un freelance assigné.</p>
        </div>
        {upcomingLoading ? (
          <div className="animate-pulse text-sm text-(--text-secondary)">Chargement…</div>
        ) : upcoming.length === 0 ? (
          <p className="text-sm text-(--text-secondary)">Aucune mission à venir.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="text-left border-separate border-spacing-y-1 text-sm w-full">
              <thead>
                <tr className="text-(--text-secondary)">
                  <th className="pr-4 pb-2">Employeur</th>
                  <th className="pr-4 pb-2">Freelance</th>
                  <th className="pr-4 pb-2">Date</th>
                  <th className="pr-4 pb-2">Horaires</th>
                  <th className="pr-4 pb-2">Part freelance</th>
                  <th className="pr-4 pb-2">Commission</th>
                  <th className="pr-4 pb-2">Total TTC</th>
                  <th className="pb-2">Carte</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map(m => (
                  <tr key={m.id} className="border-b border-(--line-soft)">
                    <td className="pr-4 py-1.5 font-medium">{m.employer_company_name}</td>
                    <td className="pr-4">{m.freelance_name || '—'}</td>
                    <td className="pr-4 whitespace-nowrap">{new Date(m.date).toLocaleDateString('fr-FR')}</td>
                    <td className="pr-4 whitespace-nowrap">{m.start_time} – {m.end_time} <span className="text-(--text-secondary)">({m.hours}h)</span></td>
                    <td className="pr-4 font-medium">{(m.amount_freelance_cents / 100).toFixed(2)} €</td>
                    <td className="pr-4 text-(--text-secondary)">{(m.commission_cents / 100).toFixed(2)} €</td>
                    <td className="pr-4 font-semibold">{(m.total_ttc_cents / 100).toFixed(2)} €</td>
                    <td>
                      {m.has_card ? (
                        <span className="rounded-full border px-2 py-0.5 text-xs font-medium text-green-700 bg-green-50 border-green-200">✓ Enregistrée</span>
                      ) : (
                        <span className="rounded-full border px-2 py-0.5 text-xs font-medium text-red-600 bg-red-50 border-red-200">✗ Manquante</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Paiements effectués */}
      <section className="flex flex-col gap-3">
      <div>
        <h2>Paiements <span className="text-base font-normal text-(--text-secondary)">({total})</span></h2>
      </div>

      <div className="overflow-x-auto">
        <table className="text-left border-separate border-spacing-y-1 text-sm w-full">
          <thead>
            <tr className="text-(--text-secondary)">
              <th className="pr-4 pb-2">N° Facture</th>
              <th className="pr-4 pb-2">Employeur</th>
              <th className="pr-4 pb-2">Freelance</th>
              <th className="pr-4 pb-2">Période</th>
              <th className="pr-4 pb-2">Montant TTC</th>
              <th className="pr-4 pb-2">Commission</th>
              <th className="pr-4 pb-2">Statut</th>
              <th className="pb-2">Facture</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id} className="border-b border-(--line-soft)">
                <td className="pr-4 py-1.5 font-mono text-xs">{inv.invoice_number}</td>
                <td className="pr-4">{inv.employer_company_name}</td>
                <td className="pr-4">{inv.freelance_name}</td>
                <td className="pr-4 whitespace-nowrap">
                  {inv.service_start_date ? new Date(inv.service_start_date).toLocaleDateString('fr-FR') : '—'}
                  {inv.service_end_date ? ` → ${new Date(inv.service_end_date).toLocaleDateString('fr-FR')}` : ''}
                </td>
                <td className="pr-4 font-medium">{(inv.amount_total_ttc_cents / 100).toFixed(2)} €</td>
                <td className="pr-4">{(inv.commission_amount_ht_cents / 100).toFixed(2)} €</td>
                <td className="pr-4">
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusColors[inv.status] ?? 'text-(--text-secondary) bg-(--bg-panel-muted) border-(--line-soft)'}`}>
                    {statusLabels[inv.status] ?? inv.status}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => downloadPDF(inv.id, inv.invoice_number)}
                    disabled={downloading === inv.id}
                    className="rounded border border-(--line-soft) px-2 py-0.5 text-xs hover:bg-(--bg-panel) disabled:opacity-50 transition-colors"
                  >
                    {downloading === inv.id ? '...' : '↓ PDF'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {invoices.length === 0 && <p className="text-(--text-secondary)">Aucun paiement.</p>}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Litiges heures</h2>
        <p style={{ opacity: 0.8, marginTop: 4 }}>
          Missions où l'employeur et le freelance ont déclaré des horaires différents.
        </p>

        {hoursDisputesLoading ? (
          <div>Chargement…</div>
        ) : hoursDisputes.length === 0 ? (
          <div>Aucun litige.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px 6px' }}>Mission</th>
                  <th style={{ textAlign: 'left', padding: '8px 6px' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '8px 6px' }}>Employeur</th>
                  <th style={{ textAlign: 'left', padding: '8px 6px' }}>Freelance</th>
                  <th style={{ textAlign: 'left', padding: '8px 6px' }}>Déclaré employeur</th>
                  <th style={{ textAlign: 'left', padding: '8px 6px' }}>Déclaré freelance</th>
                  <th style={{ textAlign: 'left', padding: '8px 6px' }} />
                </tr>
              </thead>
              <tbody>
                {hoursDisputes.map((d) => (
                  <tr key={d.mission_id} style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                    <td style={{ padding: '8px 6px' }}>{d.title ?? `#${d.mission_id}`}</td>
                    <td style={{ padding: '8px 6px' }}>{d.date ?? ''}</td>
                    <td style={{ padding: '8px 6px' }}>{d.employer_company_name ?? ''}</td>
                    <td style={{ padding: '8px 6px' }}>
                      {`${d.freelance_first_name ?? ''} ${d.freelance_last_name ?? ''}`.trim()}
                    </td>
                    <td style={{ padding: '8px 6px' }}>
                      {(d.employer_actual_start && d.employer_actual_end)
                        ? `${d.employer_actual_start} → ${d.employer_actual_end}`
                        : '—'}
                    </td>
                    <td style={{ padding: '8px 6px' }}>
                      {(d.freelance_actual_start && d.freelance_actual_end)
                        ? `${d.freelance_actual_start} → ${d.freelance_actual_end}`
                        : '—'}
                    </td>
                    <td style={{ padding: '8px 6px' }}>
                      <button onClick={() => openResolve(d)}>Trancher</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {resolveOpenFor && (
          <div style={{ marginTop: 16, padding: 12, border: '1px solid rgba(0,0,0,0.12)', borderRadius: 8 }}>
            <h3 style={{ marginTop: 0 }}>Décision admin</h3>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <label>
                Décision
                <select value={resolutionDecision} onChange={(e) => setResolutionDecision(e.target.value as any)} style={{ marginLeft: 8 }}>
                  <option value="employer">Valider employeur</option>
                  <option value="freelance">Valider freelance</option>
                </select>
              </label>
              <label>
                Début
                <select value={resolvedStart} onChange={(e) => setResolvedStart(e.target.value)} style={{ marginLeft: 8 }}>
                  <option value="">--</option>
                  {timeOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label>
                Fin
                <select value={resolvedEnd} onChange={(e) => setResolvedEnd(e.target.value)} style={{ marginLeft: 8 }}>
                  <option value="">--</option>
                  {timeOptions.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'block' }}>
                Note (optionnel)
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  rows={3}
                  style={{ width: '100%', marginTop: 6 }}
                />
              </label>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button onClick={() => setResolveOpenFor(null)} disabled={resolveSaving}>Annuler</button>
              <button onClick={submitResolve} disabled={resolveSaving || !resolvedStart || !resolvedEnd}>
                {resolveSaving ? 'Enregistrement…' : 'Valider'}
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
