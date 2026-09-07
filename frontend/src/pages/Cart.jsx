import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Minus, Plus, ShoppingCart, Trash2, LoaderCircle } from "lucide-react"
import { useCart } from "../context/CartContext"
import { api } from "../api/client"
import { calcTotals } from "../context/BookingContext"

export default function Cart() {
  const { items, removeFromCart, updateDays } = useCart()
  const [equipmentById, setEquipmentById] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    if (items.length === 0) {
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.all(
      items.map((i) =>
        api.get(`/equipment/${i.equipmentId}`).catch(() => null)
      )
    ).then((results) => {
      if (cancelled) return
      const map = {}
      results.forEach((eq) => { if (eq) map[eq.id] = eq })
      setEquipmentById(map)
      setLoading(false)
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length])

  const lines = items
    .map((i) => ({ ...i, equipment: equipmentById[i.equipmentId] }))
    .filter((i) => i.equipment)

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoaderCircle className="h-6 w-6 animate-spin text-[var(--color-muted)]" />
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold tracking-tight">Your Cart</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        {lines.length} item{lines.length > 1 ? "s" : ""} saved. Complete payment for one item at a
        time via PayHere on its listing page.
      </p>

      <div className="mt-8 space-y-3">
        {lines.map((line) => (
          <CartLine
            key={line.equipmentId}
            line={line}
            onRemove={() => removeFromCart(line.equipmentId)}
            onDaysChange={(days) => updateDays(line.equipmentId, days)}
          />
        ))}
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
            <span className="text-xs text-[var(--color-muted)]">Days (estimate)</span>
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
            ~${totals.total}
            <span className="ml-1 text-xs font-normal text-[var(--color-muted)]">
              (incl. ${totals.deposit} deposit)
            </span>
          </p>
        </div>

        <Link
          to={`/equipment/${equipment.id}`}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[var(--color-amber)] hover:underline"
        >
          Pick dates & pay with PayHere
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}