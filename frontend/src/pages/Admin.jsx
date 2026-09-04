import { Link } from "react-router-dom"
import { ShieldAlert, Check, X } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useEquipment } from "../context/EquipmentContext"
import { ADMIN_EMAIL } from "../config"

export default function Admin() {
  const { user } = useAuth()
  const { equipment, approveEquipment, rejectEquipment } = useEquipment()

  const isAdmin = user?.email === ADMIN_EMAIL

  if (!isAdmin) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--color-surface)] text-red-400">
          <ShieldAlert className="h-6 w-6" />
        </span>
        <h1 className="mt-5 font-display text-xl font-semibold">Admins only</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          For this demo, sign up or log in as <span className="text-white/90">{ADMIN_EMAIL}</span> to
          reach the equipment review dashboard.
        </p>
        <Link
          to="/login"
          className="mt-6 rounded-full border border-[var(--color-border)] px-6 py-3 text-sm font-semibold text-white/90 hover:border-[var(--color-amber)]"
        >
          Log In
        </Link>
      </div>
    )
  }

  const pending = equipment.filter((i) => i.status === "PENDING_REVIEW")
  const decided = equipment.filter((i) => i.status === "REJECTED" || (i.status === "APPROVED" && i.ownerId))

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold tracking-tight">Equipment Review</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Check photos, condition, and details before a listing goes live.
      </p>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
        Pending ({pending.length})
      </h2>
      {pending.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--color-muted)]">Nothing waiting on review.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {pending.map((item) => (
            <div key={item.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="flex gap-4">
                <img src={item.image} alt={item.name} className="h-24 w-28 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white/90">{item.name}</p>
                  <p className="text-xs text-[var(--color-muted)]">Owner: {item.ownerName}</p>
                  <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[var(--color-muted)] sm:grid-cols-4">
                    <Row label="Price" value={`$${item.pricePerDay}/day`} />
                    <Row label="Deposit" value={`$${item.deposit}`} />
                    <Row label="Condition" value={item.condition} />
                    <Row label="Location" value={item.location} />
                  </dl>
                  {item.existingDamage && (
                    <p className="mt-2 text-xs text-yellow-400">Noted damage: {item.existingDamage}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => approveEquipment(item.id)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[var(--color-amber)] to-[var(--color-orange)] py-2 text-sm font-semibold text-[var(--color-ink)]"
                >
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                  Approve
                </button>
                <button
                  onClick={() => rejectEquipment(item.id)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[var(--color-border)] py-2 text-sm font-medium text-white/90 hover:border-red-500/60 hover:text-red-400"
                >
                  <X className="h-4 w-4" strokeWidth={2.5} />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {decided.length > 0 && (
        <>
          <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            Recently decided
          </h2>
          <div className="mt-4 space-y-2">
            {decided.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm"
              >
                <span className="text-white/80">{item.name}</span>
                <span className={item.status === "APPROVED" ? "text-green-400" : "text-red-400"}>
                  {item.status === "APPROVED" ? "Approved" : "Rejected"}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wide">{label}</dt>
      <dd className="text-white/80">{value}</dd>
    </div>
  )
}
