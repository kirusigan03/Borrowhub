import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Box, MapPin, CalendarDays, Search } from "lucide-react"
import CategoryDial from "./CategoryDial"

export default function SearchBar({ variant = "docked" }) {
  const [category, setCategory] = useState("construction")
  const [term, setTerm] = useState("")
  const [location, setLocation] = useState("")
  const navigate = useNavigate()

  function handleSearch() {
    const params = new URLSearchParams({ category, term, location })
    navigate(`/search?${params.toString()}`)
  }

  return (
    <div
      className={
        variant === "docked"
          ? "border-t border-[var(--color-border)] bg-[var(--color-surface)]"
          : "rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl shadow-black/40"
      }
    >
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
        <div className="mb-3">
          <CategoryDial active={category} onChange={setCategory} />
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Field icon={Box} label="Equipment" value={term} onChange={setTerm} placeholder="What do you need?" />
          <Divider />
          <Field icon={MapPin} label="Location" value={location} onChange={setLocation} placeholder="Where?" />
          <Divider />
          <div className="flex items-center gap-2 px-1 py-1">
            <CalendarDays className="h-4 w-4 text-[var(--color-muted)]" />
            <div>
              <div className="text-[11px] font-medium text-[var(--color-muted)]">Dates</div>
              <div className="text-sm text-white">Select dates</div>
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="ml-auto flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-amber)] to-[var(--color-orange)] px-6 py-3 text-sm font-semibold text-[var(--color-ink)] transition-transform hover:scale-[1.02]"
          >
            <Search className="h-4 w-4" strokeWidth={2.5} />
            Search
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ icon: Icon, label, value, onChange, placeholder }) {
  return (
    <div className="flex flex-1 items-center gap-2 px-1 py-1">
      <Icon className="h-4 w-4 text-[var(--color-muted)]" />
      <div className="flex-1">
        <label className="block text-[11px] font-medium text-[var(--color-muted)]">{label}</label>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-white placeholder:text-[var(--color-muted)]/70 focus:outline-none"
        />
      </div>
    </div>
  )
}

function Divider() {
  return <div className="hidden h-8 w-px bg-[var(--color-border)] md:block" />
}
