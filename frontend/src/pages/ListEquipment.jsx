import { useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { PackagePlus, LoaderCircle, LogIn, Clock, ImagePlus, X } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { useEquipment } from "../context/EquipmentContext"
import { categories } from "../data/categories"

const CONDITIONS = ["New", "Like New", "Good", "Fair", "Damaged"]

const initialForm = {
  name: "",
  category: categories[0].id,
  pricePerDay: "",
  deposit: "",
  location: "",
  image: "",
  condition: "Good",
  existingDamage: "",
  description: "",
}

export default function ListEquipment() {
  const { user } = useAuth()
  const { addEquipment } = useEquipment()
  const navigate = useNavigate()

  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [photoError, setPhotoError] = useState("")
  const fileInputRef = useRef(null)

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  function handlePhotoPick(e) {
    const file = e.target.files?.[0]
    e.target.value = "" // allow re-picking the same file later
    if (!file) return

    setPhotoError("")
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please choose an image file.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("Image must be smaller than 5MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = () => setForm((f) => ({ ...f, image: reader.result }))
    reader.onerror = () => setPhotoError("Couldn't read that file — please try another.")
    reader.readAsDataURL(file)
  }

  function removePhoto() {
    setForm((f) => ({ ...f, image: "" }))
  }

  if (!user) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--color-surface)] text-[var(--color-amber)]">
          <LogIn className="h-6 w-6" />
        </span>
        <h1 className="mt-5 font-display text-xl font-semibold">Log in to list equipment</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          You'll need an account to list equipment for others to rent.
        </p>
        <Link
          to="/login"
          state={{ from: "/list-equipment" }}
          className="mt-6 rounded-full bg-gradient-to-r from-[var(--color-amber)] to-[var(--color-orange)] px-6 py-3 text-sm font-semibold text-[var(--color-ink)]"
        >
          Log In
        </Link>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center sm:px-6">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-[var(--color-surface)] text-[var(--color-amber)]">
          <Clock className="h-6 w-6" />
        </span>
        <h1 className="mt-5 font-display text-xl font-semibold">Submitted for review</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Your listing won't be visible to renters until an admin checks the photos, condition,
          and details. You'll find it under "My Listings" with its current status.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            to="/my-listings"
            className="rounded-full bg-gradient-to-r from-[var(--color-amber)] to-[var(--color-orange)] px-5 py-2.5 text-sm font-semibold text-[var(--color-ink)]"
          >
            View My Listings
          </Link>
          <button
            onClick={() => { setForm(initialForm); setSubmitted(false) }}
            className="rounded-full border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium text-white/90 hover:border-[var(--color-amber)]"
          >
            List another item
          </button>
        </div>
      </div>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")

    if (!form.name.trim() || !form.location.trim() || !form.pricePerDay) {
      setError("Please fill in the item name, price, and location.")
      return
    }
    if (Number(form.pricePerDay) <= 0) {
      setError("Price per day must be greater than 0.")
      return
    }
    if (form.deposit && Number(form.deposit) < 0) {
      setError("Security deposit can't be negative.")
      return
    }

    setSubmitting(true)
    try {
      addEquipment(form, user)
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <div className="mb-8 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[var(--color-amber)] to-[var(--color-orange)] text-[var(--color-ink)]">
          <PackagePlus className="h-5 w-5" strokeWidth={2.25} />
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">List Your Equipment</h1>
          <p className="text-sm text-[var(--color-muted)]">
            Add an item for your neighbors to rent by the day. New listings go through a quick
            admin review before they go live.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <Field label="Item name" htmlFor="name">
          <input
            id="name"
            required
            value={form.name}
            onChange={update("name")}
            placeholder="e.g. Mini Excavator"
            className="input"
          />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Category" htmlFor="category">
            <select id="category" value={form.category} onChange={update("category")} className="input">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Condition" htmlFor="condition">
            <select id="condition" value={form.condition} onChange={update("condition")} className="input">
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Price per day (USD)" htmlFor="pricePerDay">
            <input
              id="pricePerDay"
              type="number"
              min="1"
              step="1"
              required
              value={form.pricePerDay}
              onChange={update("pricePerDay")}
              placeholder="25"
              className="input"
            />
          </Field>

          <Field label="Security deposit (USD)" htmlFor="deposit" optional>
            <input
              id="deposit"
              type="number"
              min="0"
              step="1"
              value={form.deposit}
              onChange={update("deposit")}
              placeholder="Defaults to 2.5× daily rate"
              className="input"
            />
          </Field>
        </div>

        <Field label="Location" htmlFor="location">
          <input
            id="location"
            required
            value={form.location}
            onChange={update("location")}
            placeholder="e.g. Colombo"
            className="input"
          />
        </Field>

        <Field label="Photo" htmlFor="image" optional>
          <input
            ref={fileInputRef}
            id="image"
            type="file"
            accept="image/*"
            onChange={handlePhotoPick}
            className="hidden"
          />

          {form.image ? (
            <div className="flex items-center gap-3">
              <img
                src={form.image}
                alt="Selected equipment"
                className="h-20 w-20 shrink-0 rounded-lg border border-[var(--color-border)] object-cover"
              />
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-full border border-[var(--color-border)] px-4 py-2 text-xs font-medium text-white/90 hover:border-[var(--color-amber)]"
                >
                  <ImagePlus className="h-3.5 w-3.5" />
                  Change photo
                </button>
                <button
                  type="button"
                  onClick={removePhoto}
                  className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-[var(--color-muted)] hover:text-red-400"
                >
                  <X className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface-2)] py-8 text-sm text-white/80 hover:border-[var(--color-amber)] hover:text-white"
            >
              <ImagePlus className="h-5 w-5 text-[var(--color-amber)]" />
              Choose a photo from your device
            </button>
          )}
          {photoError && <p className="mt-1.5 text-xs text-red-400">{photoError}</p>}
          {!form.image && !photoError && (
            <p className="mt-1.5 text-xs text-[var(--color-muted)]">
              If you skip this, a placeholder photo will be used until you add real photos later.
            </p>
          )}
        </Field>

        <Field label="Existing damage" htmlFor="existingDamage" optional>
          <input
            id="existingDamage"
            value={form.existingDamage}
            onChange={update("existingDamage")}
            placeholder="e.g. Small scratch on the side"
            className="input"
          />
        </Field>

        <Field label="Description" htmlFor="description" optional>
          <textarea
            id="description"
            rows={4}
            value={form.description}
            onChange={update("description")}
            placeholder="Accessories included, pickup notes…"
            className="input resize-none"
          />
        </Field>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-amber)] to-[var(--color-orange)] py-3 text-sm font-semibold text-[var(--color-ink)] disabled:opacity-60"
        >
          {submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
          {submitting ? "Submitting…" : "Submit for Review"}
        </button>
      </form>
    </div>
  )
}

function Field({ label, htmlFor, optional, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-medium text-white/80">
        {label} {optional && <span className="text-[var(--color-muted)]">(optional)</span>}
      </label>
      {children}
    </div>
  )
}
