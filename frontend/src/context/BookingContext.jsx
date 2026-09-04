import { createContext, useContext, useEffect, useState } from "react"
import { PLATFORM_FEE_RATE } from "../config"

const BookingContext = createContext(null)

const BOOKINGS_KEY = "borrowhub_bookings"

function readBookings() {
  try {
    return JSON.parse(localStorage.getItem(BOOKINGS_KEY)) || []
  } catch {
    return []
  }
}

function writeBookings(bookings) {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings))
}

export function calcTotals({ pricePerDay, deposit, days }) {
  const rentalTotal = pricePerDay * days
  const platformFee = Math.round(rentalTotal * PLATFORM_FEE_RATE)
  const total = rentalTotal + deposit + platformFee
  return { rentalTotal, platformFee, deposit, total }
}

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState(() => readBookings())

  useEffect(() => {
    writeBookings(bookings)
  }, [bookings])

  // Simulates PayHere's Sandbox checkout + server-side payment
  // notification: the "payment" resolves first, and only once it succeeds
  // do we flip the booking to CONFIRMED — mirroring the recommended
  // "don't trust the frontend" callback flow.
  function payAndBook({ equipment, renter, startDate, endDate, days }) {
    return new Promise((resolve) => {
      const totals = calcTotals({
        pricePerDay: equipment.pricePerDay,
        deposit: equipment.deposit,
        days,
      })

      setTimeout(() => {
        const booking = {
          id: crypto.randomUUID(),
          equipmentId: equipment.id,
          equipmentName: equipment.name,
          ownerId: equipment.ownerId,
          ownerName: equipment.ownerName,
          renterId: renter.id,
          renterName: renter.name,
          startDate,
          endDate,
          days,
          ...totals,
          paymentMethod: "PayHere Sandbox",
          paymentRef: `SANDBOX-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
          status: "CONFIRMED",
          createdAt: new Date().toISOString(),
        }
        setBookings((prev) => [booking, ...prev])
        resolve(booking)
      }, 1400) // simulated PayHere round trip
    })
  }

  function markReturned(bookingId, { hasDamage, damageAmount = 0 }) {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b
        const refund = hasDamage ? Math.max(0, b.deposit - Number(damageAmount)) : b.deposit
        return {
          ...b,
          status: "COMPLETED",
          hasDamage,
          damageAmount: hasDamage ? Number(damageAmount) : 0,
          depositRefund: refund,
          returnedAt: new Date().toISOString(),
        }
      })
    )
  }

  function bookingsForRenter(userId) {
    return bookings.filter((b) => b.renterId === userId)
  }

  function bookingsForOwner(userId) {
    return bookings.filter((b) => b.ownerId === userId)
  }

  return (
    <BookingContext.Provider
      value={{ bookings, payAndBook, markReturned, bookingsForRenter, bookingsForOwner }}
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
