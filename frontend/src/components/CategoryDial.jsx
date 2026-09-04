import {
  HardHat, Sprout, Cpu, PartyPopper, Dumbbell, WashingMachine, Stethoscope,
} from "lucide-react"
import { categories } from "../data/categories"

const icons = { HardHat, Sprout, Cpu, PartyPopper, Dumbbell, WashingMachine, Stethoscope }

export default function CategoryDial({ active, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="Equipment category"
      className="flex gap-1 overflow-x-auto rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] p-1"
    >
      {categories.map((cat) => {
        const Icon = icons[cat.icon]
        const isActive = active === cat.id
        return (
          <button
            key={cat.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(cat.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
              isActive
                ? "bg-gradient-to-r from-[var(--color-amber)] to-[var(--color-orange)] text-[var(--color-ink)]"
                : "text-[var(--color-muted)] hover:text-white"
            }`}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
            {cat.name}
          </button>
        )
      })}
    </div>
  )
}
