import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, MapPin, Star, ShieldCheck, LoaderCircle, ShieldQuestion } from "lucide-react"
import { api } from "../api/client"
import { useBookings, calcTotals } from "../context/BookingContext"
import { useAuth } from "../context/AuthContext"
import StatusBadge from "../components/StatusBadge"

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function addDaysISO(iso, days) {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function daysBetween(startIso, endIso) {
  const ms = new Date(endIso) - new Date(startIso)
  return Math.max(1, Math.round(ms / 86400000))
}

/** Builds a hidden form matching PayHere's expected field names and submits
 *  it, navigating the browser to PayHere's checkout page. */
function redirectToPayHere(checkout) {
  const fields = {
    merchant_id: checkout.merchantId,
    return_url: checkout.returnUrl,
    cancel_url: checkout.cancelUrl,
    notify_url: checkout.notifyUrl,
    order_id: checkout.orderId,
    items: checkout.itemsDescription,
    currency: checkout.currency,
    amount: checkout.amount,
    first_name: checkout.firstName,
    last_name: checkout.lastName,
    email: checkout.email,
    phone: checkout.phone,
    address: checkout.address,
    city: checkout.city,
    country: checkout.country,
    hash: checkout.hash,
  }

  const form = document.createElement("form")
  form.method = "POST"
  form.action = checkout.checkoutUrl

  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement("input")
    input.type = "hidden"
    input.name = name
    input.value = value ?? ""
    form.appendChild(input)
  })

  document.body.appendChild(form)
  form.submit()
}

export default function EquipmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { initiateCheckout } = useBookings()
  const { user } = useAuth()

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [startDate, setStartDate] = useState(todayISO())
  const [endDate, setEndDate] = useState(addDaysISO(todayISO(), 1))
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api.get(`/equipment/${id}`)
      .then((data) => { if (!cancelled) setItem(data) })
      .catch(() => { if (!cancelled) setNotFound(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [id])

  const days = useMemo(() => daysBetween(startDate, endDate), [startDate, endDate])

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <LoaderCircle className="h-6 w-6 animate-spin text-[var(--color-muted)]" />
      </div>
    )
  }

  if (notFound || !item) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <p className="text-lg font-medium">We couldn't find that listing.</p>
        <Link to="/search" className="mt-4 inline-block text-sm font-medium text-[var(--color-amber)] hover:underline">
          ← Back to browse
        </Link>
      </div>
    )
  }

  const notLive = item.status && item.status !== "APPROVED"
  const totals = calcTotals({ pricePerDay: item.pricePerDay, deposit: item.deposit ?? 0, days })

  async function handlePay() {
    setError("")
    if (new Date(endDate) <= new Date(startDate)) {
      setError("Return date must be after the pickup date.")
      return
    }
    if (!phone.trim() || !address.trim() || !city.trim()) {
      setError("PayHere needs your phone, address, and city to process payment.")
      return
    }

    setPaying(true)
    try {
      const checkout = await initiateCheckout({
        equipmentId: item.id,
        startDate,
        endDate,
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
      })
      redirectToPayHere(checkout) // navigates away to PayHere's page
    } catch (err) {
      setError(err.message || "Couldn't start checkout. Please try again.")
      setPaying(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-[var(--color-muted)] hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {notLive && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2.5 text-sm text-yellow-400">
          <ShieldQuestion className="h-4 w-4 shrink-0" />
          This listing hasn't been approved yet — only you can preview it.
          <StatusBadge status={item.status} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
          </div>

          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold">About this item</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              {item.description || `A well-maintained ${item.name.toLowerCase()}, ready to rent by the day.`}
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-[var(--color-muted)]">Condition</dt>
                <dd className="text-white/90">{item.condition || "Good"}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-muted)]">Security deposit</dt>
                <dd className="text-white/90">${item.deposit ?? 0}</dd>
              </div>
            </dl>
            {item.existingDamage && (
              <p className="mt-3 text-xs text-yellow-400">Noted by owner: {item.existingDamage}</p>
            )}
          </div>

          <div className="mt-8 flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[var(--color-amber)] to-[var(--color-orange)] text-xs font-semibold text-[var(--color-ink)]">
              {(item.ownerName || "B")[0].toUpperCase()}
            </span>
            <div>
              <p className="text-sm font-medium text-white/90">Listed by {item.ownerName || "BorrowHub"}</p>
              <p className="flex items-center gap-1 text-xs text-[var(--color-muted)]">
                <ShieldCheck className="h-3.5 w-3.5 text-[var(--color-amber)]" />
                Verified lister
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <div className="flex items-start justify-between gap-2">
              <h1 className="font-display text-xl font-bold tracking-tight">{item.name}</h1>
              <div className="flex shrink-0 items-center gap-1 text-sm text-[var(--color-muted)]">
                <Star className="h-4 w-4 fill-[var(--color-amber)] text-[var(--color-amber)]" />
                {item.rating || "New"}
                {item.reviews > 0 && <span>({item.reviews})</span>}
              </div>
            </div>
            <p className="mt-1 flex items-center gap-1 text-sm text-[var(--color-muted)]">
              <MapPin className="h-3.5 w-3.5" />
              {item.location}
            </p>

            <p className="mt-4 text-2xl font-bold text-[var(--color-amber)]">
              ${item.pricePerDay}
              <span className="text-sm font-normal text-[var(--color-muted)]"> / day</span>
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/80">Pickup</label>
                <input
                  type="date"
                  value={startDate}
                  min={todayISO()}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    if (new Date(endDate) <= new Date(e.target.value)) {
                      setEndDate(addDaysISO(e.target.value, 1))
                    }
                  }}
                  className="input"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/80">Return</label>
                <input
                  type="date"
                  value={endDate}
                  min={addDaysISO(startDate, 1)}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            <div className="mt-3 space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/80">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07XXXXXXXX"
                  className="input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/80">Address</label>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street address"
                    className="input"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/80">City</label>
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Colombo"
                    className="input"
                  />
                </div>
              </div>
            </div>

            {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

            <div className="mt-5 space-y-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] px-4 py-3 text-sm">
              <Line label={`Rental (${days} day${days > 1 ? "s" : ""})`} value={`$${totals.rentalTotal}`} />
              <Line label="Platform fee" value={`$${totals.platformFee}`} />
              <Line label="Security deposit (refundable)" value={`$${totals.deposit}`} />
              <div className="my-1.5 border-t border-[var(--color-border)]" />
              <Line label="Total due today" value={`$${totals.total}`} bold />
            </div>

            <button
              onClick={handlePay}
              disabled={paying || !item.available || notLive || !user}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-amber)] to-[var(--color-orange)] py-3 text-sm font-semibold text-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {paying && <LoaderCircle className="h-4 w-4 animate-spin" />}
              {paying
                ? "Redirecting to PayHere…"
                : user
                  ? "Pay & Book with PayHere"
                  : "Log in to book"}
            </button>
            {!user && (
              <Link
                to="/login"
                state={{ from: `/equipment/${item.id}` }}
                className="mt-2 block text-center text-xs font-medium text-[var(--color-amber)] hover:underline"
              >
                Log in to continue
              </Link>
            )}
            <p className="mt-3 text-center text-[11px] text-[var(--color-muted)]">
              You'll be taken to PayHere's secure checkout page to pay. Deposit is refunded after
              return if the equipment comes back undamaged.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Line({ label, value, bold }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "font-semibold text-white" : "text-[var(--color-muted)]"}`}>
      <span>{label}</span>
      <span className={bold ? "text-white" : "text-white/80"}>{value}</span>
    </div>
  )
}