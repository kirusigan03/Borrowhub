import { useMemo, useState } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { SlidersHorizontal, PackageSearch } from "lucide-react"
import CategoryDial from "../components/CategoryDial"
import EquipmentCard from "../components/EquipmentCard"
import { useEquipment } from "../context/EquipmentContext"

const SORTS = [
  { id: "relevance", label: "Relevance" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Top Rated" },
]

export default function Search() {
  const { liveEquipment: equipment } = useEquipment()
  const [params, setParams] = useSearchParams()
  const [sort, setSort] = useState("relevance")

  const category = params.get("category") || ""
  const term = params.get("term") || ""
  const location = params.get("location") || ""

  function setCategory(next) {
    const p = new URLSearchParams(params)
    if (next) p.set("category", next)
    else p.delete("category")
    setParams(p)
  }

  const results = useMemo(() => {
    let list = equipment.filter((item) => {
      const matchesCategory = !category || item.category === category
      const matchesTerm =
        !term || item.name.toLowerCase().includes(term.toLowerCase())
      const matchesLocation =
        !location || item.location.toLowerCase().includes(location.toLowerCase())
      return matchesCategory && matchesTerm && matchesLocation
    })

    if (sort === "price-asc") list = [...list].sort((a, b) => a.pricePerDay - b.pricePerDay)
    if (sort === "price-desc") list = [...list].sort((a, b) => b.pricePerDay - a.pricePerDay)
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating)

    return list
  }, [equipment, category, term, location, sort])

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Browse Equipment
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {results.length} item{results.length === 1 ? "" : "s"}
            {location && <> in <span className="text-white/90">{location}</span></>}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[var(--color-muted)]" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-white focus:border-[var(--color-amber)] focus:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6">
        <CategoryDial active={category} onChange={setCategory} />
      </div>

      {results.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((item) => (
            <EquipmentCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--color-surface)] text-[var(--color-muted)]">
            <PackageSearch className="h-6 w-6" />
          </span>
          <p className="text-white/90">No equipment matches your search.</p>
          <p className="text-sm text-[var(--color-muted)]">
            Try a different category, term, or{" "}
            <Link to="/list-equipment" className="text-[var(--color-amber)] hover:underline">
              list your own
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  )
}
