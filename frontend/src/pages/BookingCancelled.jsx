import { Link } from "react-router-dom"
import { X } from "lucide-react"

export default function BookingCancelled() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--color-surface)] text-[var(--color-muted)]">
        <X className="h-6 w-6" />
      </span>
      <h1 className="mt-4 font-display text-xl font-semibold">Checkout cancelled</h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        No payment was made — nothing was booked.
      </p>
      <Link
        to="/search"
        className="mt-6 rounded-full bg-gradient-to-r from-[var(--color-amber)] to-[var(--color-orange)] px-5 py-2.5 text-sm font-semibold text-[var(--color-ink)]"
      >
        Browse Equipment
      </Link>
    </div>
  )
}