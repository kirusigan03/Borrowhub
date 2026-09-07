import { useEffect, useRef, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { Check, LoaderCircle, X } from "lucide-react"
import { useBookings } from "../context/BookingContext"

const POLL_INTERVAL_MS = 2000
const MAX_POLLS = 15 // ~30s — PayHere's notify webhook is usually near-instant, but give it room

export default function BookingSuccess() {
  const [params] = useSearchParams()
  const bookingId = params.get("bookingId")
  const { getBooking } = useBookings()

  const [booking, setBooking] = useState(null)
  const [error, setError] = useState("")
  const pollCount = useRef(0)

  useEffect(() => {
    if (!bookingId) return
    let cancelled = false
    let timer

    async function poll() {
      try {
        const data = await getBooking(bookingId)
        if (cancelled) return
        setBooking(data)

        if (data.status === "PENDING_PAYMENT" && pollCount.current < MAX_POLLS) {
          pollCount.current += 1
          timer = setTimeout(poll, POLL_INTERVAL_MS)
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "Couldn't load your booking.")
      }
    }

    poll()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId])

  if (!bookingId) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <p className="text-white/90">No booking reference found.</p>
        <Link to="/search" className="mt-4 inline-block text-sm font-medium text-[var(--color-amber)] hover:underline">
          Browse equipment
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
      {!booking && !error && (
        <>
          <LoaderCircle className="h-8 w-8 animate-spin text-[var(--color-muted)]" />
          <p className="mt-4 text-sm text-[var(--color-muted)]">Loading your booking…</p>
        </>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {booking && booking.status === "PENDING_PAYMENT" && (
        <>
          <LoaderCircle className="h-8 w-8 animate-spin text-[var(--color-amber)]" />
          <h1 className="mt-4 font-display text-xl font-semibold">Confirming your payment…</h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            PayHere is finalizing the transaction. This page will update automatically.
          </p>
        </>
      )}

      {booking && booking.status === "CONFIRMED" && (
        <>
          <span className="grid h-12 w-12 place-items-center rounded-full bg-green-500 text-white">
            <Check className="h-6 w-6" strokeWidth={2.5} />
          </span>
          <h1 className="mt-4 font-display text-xl font-semibold">Booking confirmed</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Paid via PayHere · Ref {booking.paymentRef}
          </p>
          <div className="mt-5 w-full space-y-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-left text-sm">
            <Line label="Rental" value={`$${booking.rentalTotal}`} />
            <Line label="Platform fee" value={`$${booking.platformFee}`} />
            <Line label="Security deposit" value={`$${booking.deposit}`} />
            <div className="my-2 border-t border-[var(--color-border)]" />
            <Line label="Total paid" value={`$${booking.total}`} bold />
          </div>
          <Link
            to="/my-bookings"
            className="mt-6 w-full rounded-full bg-gradient-to-r from-[var(--color-amber)] to-[var(--color-orange)] py-3 text-sm font-semibold text-[var(--color-ink)]"
          >
            View My Bookings
          </Link>
        </>
      )}

      {booking && booking.status === "FAILED" && (
        <>
          <span className="grid h-12 w-12 place-items-center rounded-full bg-red-500 text-white">
            <X className="h-6 w-6" strokeWidth={2.5} />
          </span>
          <h1 className="mt-4 font-display text-xl font-semibold">Payment didn't go through</h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            PayHere reported this payment as unsuccessful. No booking was made — you can try again.
          </p>
          <Link
            to={`/equipment/${booking.equipmentId}`}
            className="mt-6 rounded-full border border-[var(--color-border)] px-6 py-3 text-sm font-semibold text-white/90 hover:border-[var(--color-amber)]"
          >
            Try again
          </Link>
        </>
      )}
    </div>
  )
}

function Line({ label, value, bold }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "font-semibold text-white" : "text-[var(--color-muted)]"}`}>
      <span>{label}</span>
      <span className={bold ? "text-white" : "text-white/80"}>{value}</span>
    </div>
  )
}