import { createContext, useContext, useEffect, useState } from "react"
import { equipment as seedEquipment } from "../data/equipment"

const EquipmentContext = createContext(null)

const LISTINGS_KEY = "borrowhub_listings"

// --- tiny localStorage "database" -------------------------------------
// Swap this for a real API call later (e.g. fetch("/api/equipment"))
// and nothing in the pages/components that consume useEquipment() has to change.

function readListings() {
  try {
    return JSON.parse(localStorage.getItem(LISTINGS_KEY)) || []
  } catch {
    return []
  }
}

function writeListings(listings) {
  localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings))
}

// Seed catalog items are treated as already vetted so the browse page
// isn't empty on first load.
const seedWithStatus = seedEquipment.map((item) => ({
  ...item,
  status: "APPROVED",
  condition: item.condition || "Good",
  deposit: item.deposit ?? Math.round(item.pricePerDay * 2.5),
  existingDamage: item.existingDamage || "",
  ownerId: null,
  ownerName: "BorrowHub",
}))

export function EquipmentProvider({ children }) {
  const [listings, setListings] = useState(() => readListings())

  useEffect(() => {
    writeListings(listings)
  }, [listings])

  // Owner-added listings + seed catalog, newest first
  const equipment = [...listings, ...seedWithStatus]

  // What renters are allowed to browse/book
  const liveEquipment = equipment.filter((item) => item.status === "APPROVED")

  function addEquipment(item, owner) {
    const newItem = {
      id: crypto.randomUUID(),
      name: item.name.trim(),
      category: item.category,
      pricePerDay: Number(item.pricePerDay),
      deposit: Number(item.deposit) || Math.round(Number(item.pricePerDay) * 2.5),
      location: item.location.trim(),
      description: item.description?.trim() || "",
      condition: item.condition || "Good",
      existingDamage: item.existingDamage?.trim() || "",
      rating: 0,
      reviews: 0,
      available: true,
      status: "PENDING_REVIEW",
      image:
        item.image?.trim() ||
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop",
      ownerId: owner?.id ?? null,
      ownerName: owner?.name ?? "You",
      createdAt: new Date().toISOString(),
    }
    setListings((prev) => [newItem, ...prev])
    return newItem
  }

  function setStatus(id, status) {
    setListings((prev) =>
      prev.map((item) => (String(item.id) === String(id) ? { ...item, status } : item))
    )
  }

  function approveEquipment(id) {
    setStatus(id, "APPROVED")
  }

  function rejectEquipment(id) {
    setStatus(id, "REJECTED")
  }

  function getById(id) {
    return equipment.find((item) => String(item.id) === String(id))
  }

  function myListings(userId) {
    return listings.filter((item) => item.ownerId === userId)
  }

  return (
    <EquipmentContext.Provider
      value={{
        equipment,
        liveEquipment,
        addEquipment,
        approveEquipment,
        rejectEquipment,
        getById,
        myListings,
      }}
    >
      {children}
    </EquipmentContext.Provider>
  )
}

export function useEquipment() {
  const ctx = useContext(EquipmentContext)
  if (!ctx) throw new Error("useEquipment must be used within an EquipmentProvider")
  return ctx
}
