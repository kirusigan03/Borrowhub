import { useState } from "react"
import { Link } from "react-router-dom"
import { LogIn, Undo2, Check, X } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useBookings } from "../context/BookingContext"
import StatusBadge from "../components/StatusBadge"

export default function MyBookings() {
  const { user } = useAuth()
  const { bookingsForRenter, bookingsForOwner } = useBookings()

  if (!user) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--color-surface)] text-[var(--color-amber)]">
          <LogIn className="h-6 w-6" />
        </span>
        <h1 className="mt-5 font-display text-xl font-semibold">Log in to see your bookings</h1>
        <Link
          to="/login"
          state={{ from: "/my-bookings" }}
          className="mt-6 rounded-full bg-gradient-to-r from-[var(--color-amber)] to-[var(--color-orange)] px-6 py-3 text-sm font-semibold text-[var(--color-ink)]"
        >
          Log In
        </Link>
      </div>
    )
  }

  const rentals = bookingsForRenter(user.id)
  const rentedOut = bookingsForOwner(user.id)

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold tracking-tight">My Bookings</h1>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
        Things I'm renting
      </h2>
      {rentals.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--color-muted)]">
          No bookings yet —{" "}
          <Link to="/search" className="text-[var(--color-amber)] hover:underline">browse equipment</Link>.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {rentals.map((b) => <RenterCard key={b.id} booking={b} />)}
        </div>
      )}

      {rentedOut.length > 0 && (
        <>
          <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-[var(--color-muted)]">
            My equipment, rented out
          </h2>
          <div className="mt-4 space-y-3">
            {rentedOut.map((b) => <OwnerCard key={b.id} booking={b} />)}
          </div>
        </>
      )}
    </div>
  )
}

function RenterCard({ booking }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-white/90">{booking.equipmentName}</p>
          <p className="text-xs text-[var(--color-muted)]">
            {booking.startDate} → {booking.endDate} · {booking.days} day{booking.days > 1 ? "s" : ""}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-[var(--color-muted)]">
        <span>Ref {booking.paymentRef}</span>
        <span>Total paid ${booking.total}</span>
      </div>
      {booking.status === "COMPLETED" && (
        <p className="mt-2 text-xs text-white/80">
          Deposit refund:{" "}
          <span className={booking.hasDamage ? "text-yellow-400" : "text-green-400"}>
            ${booking.depositRefund}
          </span>
          {booking.hasDamage && ` (damage deduction: $${booking.damageAmount})`}
        </p>
      )}
    </div>
  )
}

function OwnerCard({ booking }) {
  const { markReturned } = useBookings()
  const [inspecting, setInspecting] = useState(false)
  const [hasDamage, setHasDamage] = useState(false)
  const [damageAmount, setDamageAmount] = useState("")

  function handleConfirm() {
    markReturned(booking.id, { hasDamage, damageAmount: hasDamage ? damageAmount : 0 })
    setInspecting(false)
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-white/90">{booking.equipmentName}</p>
          <p className="text-xs text-[var(--color-muted)]">
            Renter: {booking.renterName} · {booking.startDate} → {booking.endDate}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {booking.status === "CONFIRMED" && !inspecting && (
        <button
          onClick={() => setInspecting(true)}
          className="mt-3 flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-4 py-2 text-xs font-medium text-white/90 hover:border-[var(--color-amber)]"
        >
          <Undo2 className="h-3.5 w-3.5" />
          Mark returned & inspect
        </button>
      )}

      {inspecting && (
        <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3">
          <p className="text-xs font-medium text-white/80">Return condition</p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => setHasDamage(false)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-medium ${
                !hasDamage ? "bg-green-500 text-white" : "border border-[var(--color-border)] text-white/80"
              }`}
            >
              <Check className="h-3.5 w-3.5" />
              No damage
            </button>
            <button
              onClick={() => setHasDamage(true)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full py-2 text-xs font-medium ${
                hasDamage ? "bg-red-500 text-white" : "border border-[var(--color-border)] text-white/80"
              }`}
            >
              <X className="h-3.5 w-3.5" />
              Damage found
            </button>
          </div>

          {hasDamage && (
            <div className="mt-3">
              <label className="mb-1 block text-[11px] text-white/70">
                Deduct from ${booking.deposit} deposit (USD)
              </label>
              <input
                type="number"
                min="0"
                max={booking.deposit}
                value={damageAmount}
                onChange={(e) => setDamageAmount(e.target.value)}
                placeholder="0"
                className="input"
              />
            </div>
          )}

          <button
            onClick={handleConfirm}
            className="mt-3 w-full rounded-full bg-gradient-to-r from-[var(--color-amber)] to-[var(--color-orange)] py-2 text-xs font-semibold text-[var(--color-ink)]"
          >
            Confirm & refund deposit
          </button>
        </div>
      )}
    </div>
  )
}
