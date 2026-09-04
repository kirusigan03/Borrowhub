import { useState } from "react"
import { Link } from "react-router-dom"
import { Star, Plus, Check } from "lucide-react"
import { useCart } from "../context/CartContext"

export default function EquipmentCard({ item }) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  function handleAdd(e) {
    e.preventDefault()
    e.stopPropagation()
    if (!item.available) return
    addToCart(item.id)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <Link
      to={`/equipment/${item.id}`}
      className="group block overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors hover:border-[var(--color-amber)]/60"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-surface-2)]">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {!item.available && (
          <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white">
            Currently rented
          </span>
        )}
        {item.available && (
          <button
            aria-label="Add to cart"
            onClick={handleAdd}
            className={`absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full text-[var(--color-ink)] transition-opacity ${
              added ? "opacity-100 bg-green-500" : "opacity-0 bg-gradient-to-br from-[var(--color-amber)] to-[var(--color-orange)] group-hover:opacity-100"
            }`}
          >
            {added ? (
              <Check className="h-4 w-4" strokeWidth={2.5} />
            ) : (
              <Plus className="h-4 w-4" strokeWidth={2.5} />
            )}
          </button>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-sm font-semibold text-white">{item.name}</h3>
          <div className="flex shrink-0 items-center gap-1 text-xs text-[var(--color-muted)]">
            <Star className="h-3.5 w-3.5 fill-[var(--color-amber)] text-[var(--color-amber)]" />
            {item.rating}
          </div>
        </div>
        <p className="mt-1 text-xs text-[var(--color-muted)]">{item.location}</p>
        <p className="mt-3 text-sm font-semibold text-[var(--color-amber)]">
          ${item.pricePerDay}
          <span className="font-normal text-[var(--color-muted)]"> / day</span>
        </p>
      </div>
    </Link>
  )
}
