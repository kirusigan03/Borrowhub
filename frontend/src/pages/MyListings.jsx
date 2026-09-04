import { Link } from "react-router-dom"
import { PackagePlus, LogIn } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useEquipment } from "../context/EquipmentContext"
import StatusBadge from "../components/StatusBadge"

export default function MyListings() {
  const { user } = useAuth()
  const { myListings } = useEquipment()

  if (!user) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--color-surface)] text-[var(--color-amber)]">
          <LogIn className="h-6 w-6" />
        </span>
        <h1 className="mt-5 font-display text-xl font-semibold">Log in to see your listings</h1>
        <Link
          to="/login"
          state={{ from: "/my-listings" }}
          className="mt-6 rounded-full bg-gradient-to-r from-[var(--color-amber)] to-[var(--color-orange)] px-6 py-3 text-sm font-semibold text-[var(--color-ink)]"
        >
          Log In
        </Link>
      </div>
    )
  }

  const items = myListings(user.id)

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight">My Listings</h1>
        <Link
          to="/list-equipment"
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[var(--color-amber)] to-[var(--color-orange)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)]"
        >
          <PackagePlus className="h-4 w-4" />
          List Item
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="mt-10 text-center text-sm text-[var(--color-muted)]">
          You haven't listed anything yet.
        </p>
      ) : (
        <div className="mt-8 space-y-3">
          {items.map((item) => (
            <Link
              key={item.id}
              to={item.status === "APPROVED" ? `/equipment/${item.id}` : "#"}
              className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
            >
              <img
                src={item.image}
                alt={item.name}
                className="h-16 w-20 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white/90">{item.name}</p>
                <p className="text-xs text-[var(--color-muted)]">
                  ${item.pricePerDay}/day · {item.location}
                </p>
                {item.status === "REJECTED" && (
                  <p className="mt-1 text-xs text-red-400">
                    Not approved — review the details and try listing again.
                  </p>
                )}
              </div>
              <StatusBadge status={item.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
