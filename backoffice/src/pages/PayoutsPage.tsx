import { useEffect, useState } from "react"
import { useAuth } from "../auth/AuthContext"
import { getPayouts } from "../api/api"

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

export default function PayoutsPage() {
  const { token } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    getPayouts(token!).then(r => r.json()).then(d => {
      if (d.success) { setInvoices(d.data); setTotal(d.total) }
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="animate-pulse">Chargement...</div>

  return (
    <main className="flex flex-col gap-4">
      <div>
        <h2>Paiements <span className="text-base font-normal text-(--text-secondary)">({total})</span></h2>
      </div>

      <table className="text-left border-separate border-spacing-y-2 text-sm">
        <thead>
          <tr>
            <th>N° Facture</th>
            <th>Employeur</th>
            <th>Freelance</th>
            <th>Période</th>
            <th>Montant TTC</th>
            <th>Commission</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(inv => (
            <tr key={inv.id}>
              <td className="pr-4">{inv.invoice_number}</td>
              <td className="pr-4">{inv.employer_company_name}</td>
              <td className="pr-4">{inv.freelance_name}</td>
              <td className="pr-4">
                {new Date(inv.service_start_date).toLocaleDateString('fr-FR')} → {new Date(inv.service_end_date).toLocaleDateString('fr-FR')}
              </td>
              <td className="pr-4">{(inv.amount_total_ttc_cents / 100).toFixed(2)} €</td>
              <td className="pr-4">{(inv.commission_amount_ht_cents / 100).toFixed(2)} €</td>
              <td>{statusLabels[inv.status] ?? inv.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {invoices.length === 0 && <p className="text-(--text-secondary)">Aucun paiement.</p>}
    </main>
  )
}
