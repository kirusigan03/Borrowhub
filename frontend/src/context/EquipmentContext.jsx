import { createContext, useContext, useEffect, useState } from "react"
import { api } from "../api/client"

const EquipmentContext = createContext(null)

export function EquipmentProvider({ children }) {
  const [liveEquipment, setLiveEquipment] = useState([])
  const [loading, setLoading] = useState(true)

  async function refreshLive() {
    try {
      const data = await api.get("/equipment")
      setLiveEquipment(data)
    } catch {
      // Browse page shows an empty state if this fails — nothing else to do here.
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshLive()
  }, [])

  /** Submits a new listing — comes back as PENDING_REVIEW, not yet in liveEquipment. */
  async function addEquipment(form) {
    return api.post("/equipment", {
      name: form.name,
      category: form.category,
      pricePerDay: Number(form.pricePerDay),
      deposit: form.deposit ? Number(form.deposit) : null,
      location: form.location,
      image: form.image,
      condition: form.condition,
      existingDamage: form.existingDamage,
      description: form.description,
    })
  }

  async function approveEquipment(id) {
    const updated = await api.patch(`/equipment/${id}/approve`)
    await refreshLive()
    return updated
  }

  async function rejectEquipment(id) {
    return api.patch(`/equipment/${id}/reject`)
  }

  return (
    <EquipmentContext.Provider
      value={{ liveEquipment, loading, refreshLive, addEquipment, approveEquipment, rejectEquipment }}
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