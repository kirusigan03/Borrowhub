import { Link } from "react-router-dom"
import { ShieldCheck, HandCoins, PackageCheck } from "lucide-react"
import SearchBar from "../components/SearchBar"
import EquipmentCard from "../components/EquipmentCard"
import { useEquipment } from "../context/EquipmentContext"
import { categories } from "../data/categories"
import {
  HardHat, Sprout, Cpu, PartyPopper, Dumbbell, WashingMachine, Stethoscope,
} from "lucide-react"

const icons = { HardHat, Sprout, Cpu, PartyPopper, Dumbbell, WashingMachine, Stethoscope }

export default function Home() {
  const { liveEquipment } = useEquipment()

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--color-border)]">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-[var(--color-amber)]/10 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="mb-4 inline-block rounded-full border border-[var(--color-amber)]/40 px-3 py-1 text-xs font-medium text-[var(--color-amber)]">
            Rented by your neighbors, not a warehouse
          </p>
          <h1 className="max-w-2xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Borrow it for the job. <span className="text-[var(--color-amber)]">Skip the purchase.</span>
          </h1>
          <p className="mt-5 max-w-lg text-[var(--color-muted)]">
            From excavators to espresso machines — find equipment sitting idle nearby,
            reserve it for the days you need, and hand it back.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              to="/search"
              className="rounded-full bg-gradient-to-r from-[var(--color-amber)] to-[var(--color-orange)] px-6 py-3 text-sm font-semibold text-[var(--color-ink)]"
            >
              Browse Equipment
            </Link>
            <Link
              to="/list-equipment"
              className="rounded-full border border-[var(--color-border)] px-6 py-3 text-sm font-semibold text-white hover:border-[var(--color-amber)]"
            >
              List Your Equipment
            </Link>
          </div>
        </div>
        <SearchBar variant="docked" />
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="font-display text-xl font-semibold">Browse by category</h2>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {categories.map((cat) => {
            const Icon = icons[cat.icon]
            return (
              <Link
                key={cat.id}
                to={`/search?category=${cat.id}`}
                className="flex flex-col items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-5 text-center hover:border-[var(--color-amber)]/60"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-amber)]">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <span className="text-xs font-medium text-white/90">{cat.name}</span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Featured equipment */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-xl font-semibold">Available near you</h2>
          <Link to="/search" className="text-sm font-medium text-[var(--color-amber)]">
            View all →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {liveEquipment.slice(0, 6).map((item) => (
            <EquipmentCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:grid-cols-3">
          <Trust icon={ShieldCheck} title="Verified listings" body="Every owner and item is checked before it goes live." />
          <Trust icon={HandCoins} title="Pay per day" body="Only pay for the days you actually use the equipment." />
          <Trust icon={PackageCheck} title="Condition guaranteed" body="Rate and review keep quality honest on both sides." />
        </div>
      </section>
    </div>
  )
}

function Trust({ icon: Icon, title, body }) {
  return (
    <div className="flex gap-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[var(--color-amber)] to-[var(--color-orange)] text-[var(--color-ink)]">
        <Icon className="h-5 w-5" strokeWidth={2.25} />
      </span>
      <div>
        <h3 className="font-display text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-[var(--color-muted)]">{body}</p>
      </div>
    </div>
  )
}
