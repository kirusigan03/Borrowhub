import { createContext, useContext } from "react"
import { api } from "../api/client"
import { PLATFORM_FEE_RATE } from "../config"

const BookingContext = createContext(null)

// Client-side preview only — for showing an estimated total before the
// renter hits "Pay & Book". The backend recalculates authoritatively when
// /bookings/checkout actually runs, so this never has to be exact.
export function calcTotals({ pricePerDay, deposit, days }) {
  const rentalTotal = pricePerDay * days
  const platformFee = Math.round(rentalTotal * PLATFORM_FEE_RATE)
  const total = rentalTotal + deposit + platformFee
  return { rentalTotal, platformFee, deposit, total }
}

export function BookingProvider({ children }) {
  function initiateCheckout({ equipmentId, startDate, endDate, phone, address, city }) {
    return api.post("/bookings/checkout", { equipmentId, startDate, endDate, phone, address, city })
  }

  function getBooking(id) {
    return api.get(`/bookings/${id}`)
  }

  function getForRenter() {
    return api.get("/bookings/mine")
  }

  function getForOwner() {
    return api.get("/bookings/owner")
  }

  function markReturned(bookingId, { hasDamage, damageAmount }) {
    return api.patch(`/bookings/${bookingId}/return`, {
      hasDamage,
      damageAmount: hasDamage ? Number(damageAmount) || 0 : 0,
    })
  }

  return (
    <BookingContext.Provider
      value={{ initiateCheckout, getBooking, getForRenter, getForOwner, markReturned }}
    >
      {children}
    </BookingContext.Provider>
  )
}

export function useBookings() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error("useBookings must be used within a BookingProvider")
  return ctx
}