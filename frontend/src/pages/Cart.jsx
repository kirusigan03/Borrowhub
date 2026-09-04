import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { LoaderCircle, LogIn, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"
import { useCart } from "../context/CartContext"
import { useEquipment } from "../context/EquipmentContext"
import { useAuth } from "../context/AuthContext"
import { useBookings, calcTotals } from "../context/BookingContext"

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function addDaysISO(iso, days) {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export default function Cart() {
  const { user } = useAuth()
  const { items, removeFromCart, updateDays, clearCart } = useCart()
  const { getById } = useEquipment()
  const { payAndBook } = useBookings()
  const navigate = useNavigate()

  const [checkingOut, setCheckingOut] = useState(false)
  const [error, setError] = useState("")

  // Join cart entries with live equipment data; drop any that no longer exist.
  const lines = useMemo(
    () =>
      items
        .map((i) => ({ ...i, equipment: getById(i.equipmentId) }))
        .filter((i) => i.equipment),
    [items, getById]
  )

  const summary = useMemo(() => {
    return lines.reduce(
      (acc, line) => {
        const totals = calcTotals({
          pricePerDay: line.equipment.pricePerDay,
          deposit: line.equipment.deposit ?? 0,
          days: line.days,
        })
        acc.rentalTotal += totals.rentalTotal
        acc.platformFee += totals.platformFee
        acc.deposit += totals.deposit
        acc.total += totals.total
        return acc
      },
      { rentalTotal: 0, platformFee: 0, deposit: 0, total: 0 }
    )
  }, [lines])

  if (!user) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--color-surface)] text-[var(--color-amber)]">
          <LogIn className="h-6 w-6" />
        </span>
        <h1 className="mt-5 font-display text-xl font-semibold">Log in to see your cart</h1>
        <Link
          to="/login"
          state={{ from: "/cart" }}
          className="mt-6 rounded-full bg-gradient-to-r from-[var(--color-amber)] to-[var(--color-orange)] px-6 py-3 text-sm font-semibold text-[var(--color-ink)]"
        >
          Log In
        </Link>
      </div>
    )
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--color-surface)] text-[var(--color-amber)]">
          <ShoppingCart className="h-6 w-6" />
        </span>
        <h1 className="mt-5 font-display text-xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Add equipment from the browse page and it'll show up here.
        </p>
        <Link
          to="/search"
          className="mt-6 rounded-full bg-gradient-to-r from-[var(--color-amber)] to-[var(--color-orange)] px-6 py-3 text-sm font-semibold text-[var(--color-ink)]"
        >
          Browse Equipment
        </Link>
      </div>
    )
  }

  async function handleCheckout() {
    setError("")
    setCheckingOut(true)
    try {
      // Each cart line gets its own simulated PayHere payment + booking,
      // starting today for however many days the renter chose.
      for (const line of lines) {
        const startDate = todayISO()
        const endDate = addDaysISO(startDate, line.days)
        // eslint-disable-next-line no-await-in-loop
        await payAndBook({
          equipment: line.equipment,
          renter: user,
          startDate,
          endDate,
          days: line.days,
        })
      }
      clearCart()
      navigate("/my-bookings")
    } catch {
      setError("Something went wrong while checking out. Please try again.")
    } finally {
      setCheckingOut(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold tracking-tight">Your Cart</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        {lines.length} item{lines.length > 1 ? "s" : ""} ready to book
      </p>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-5">
        <div className="space-y-3 lg:col-span-3">
          {lines.map((line) => (
            <CartLine
              key={line.equipmentId}
              line={line}
              onRemove={() => removeFromCart(line.equipmentId)}
              onDaysChange={(days) => updateDays(line.equipmentId, days)}
            />
          ))}
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <h2 className="font-display text-lg font-semibold">Order summary</h2>
            <div className="mt-4 space-y-1.5 text-sm">
              <Line label="Rental subtotal" value={`$${summary.rentalTotal}`} />
              <Line label="Platform fee" value={`$${summary.platformFee}`} />
              <Line label="Security deposits (refundable)" value={`$${summary.deposit}`} />
              <div className="my-2 border-t border-[var(--color-border)]" />
              <Line label="Total due today" value={`$${summary.total}`} bold />
            </div>

            {error && (
              <p className="mt-3 text-xs text-red-400">{error}</p>
            )}

            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-amber)] to-[var(--color-orange)] py-3 text-sm font-semibold text-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {checkingOut && <LoaderCircle className="h-4 w-4 animate-spin" />}
              {checkingOut ? "Processing with PayHere Sandbox…" : "Pay & Book All"}
            </button>
            <p className="mt-3 text-center text-[11px] text-[var(--color-muted)]">
              Each item is booked starting today for the number of days you set. Deposits
              are refunded after return if the equipment comes back undamaged.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function CartLine({ line, onRemove, onDaysChange }) {
  const { equipment, days } = line
  const totals = calcTotals({
    pricePerDay: equipment.pricePerDay,
    deposit: equipment.deposit ?? 0,
    days,
  })

  return (
    <div className="flex gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <Link
        to={`/equipment/${equipment.id}`}
        className="h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-[var(--color-surface-2)]"
      >
        <img src={equipment.image} alt={equipment.name} className="h-full w-full object-cover" />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/equipment/${equipment.id}`} className="min-w-0">
            <p className="truncate font-medium text-white/90">{equipment.name}</p>
            <p className="text-xs text-[var(--color-muted)]">{equipment.location}</p>
          </Link>
          <button
            onClick={onRemove}
            aria-label="Remove from cart"
            className="shrink-0 rounded-full p-1.5 text-[var(--color-muted)] hover:bg-[var(--color-surface-2)] hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-muted)]">Days</span>
            <div className="flex items-center rounded-full border border-[var(--color-border)]">
              <button
                onClick={() => onDaysChange(days - 1)}
                disabled={days <= 1}
                aria-label="Decrease days"
                className="grid h-7 w-7 place-items-center text-white/80 disabled:opacity-30"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-medium">{days}</span>
              <button
                onClick={() => onDaysChange(days + 1)}
                aria-label="Increase days"
                className="grid h-7 w-7 place-items-center text-white/80"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <p className="text-sm font-semibold text-[var(--color-amber)]">
            ${totals.total}
            <span className="ml-1 text-xs font-normal text-[var(--color-muted)]">
              (incl. ${totals.deposit} deposit)
            </span>
          </p>
        </div>
      </div>
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
