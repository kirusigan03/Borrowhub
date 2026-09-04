import { useState } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { Search, ShoppingCart, Menu, X, Wrench, User, LogOut, ChevronDown, PackageSearch, CalendarCheck, ShieldCheck } from "lucide-react"
import { useAuth } from "../context/AuthContext"
import { ADMIN_EMAIL } from "../config"

const links = [
  { to: "/", label: "Home" },
  { to: "/search", label: "Browse Equipment" },
  { to: "/list-equipment", label: "List Your Equipment" },
]

export default function Navbar({ cartCount = 0 }) {
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.email === ADMIN_EMAIL

  function handleLogout() {
    logout()
    setMenuOpen(false)
    navigate("/")
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-ink)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-[var(--color-amber)] to-[var(--color-orange)]">
            <Wrench className="h-5 w-5 text-[var(--color-ink)]" strokeWidth={2.5} />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            Borrow<span className="text-[var(--color-amber)]">Hub</span>
          </span>
        </Link>

        <div className="relative hidden flex-1 max-w-md md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            type="text"
            placeholder="Search equipment…"
            className="w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-[var(--color-muted)] focus:border-[var(--color-amber)]"
          />
        </div>

        <nav className="ml-auto hidden items-center gap-6 lg:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-[var(--color-amber)]" : "text-white/80 hover:text-white"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <Link
          to="/cart"
          className="relative ml-2 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-amber)]"
          aria-label="View cart"
        >
          <ShoppingCart className="h-4.5 w-4.5" />
          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-[var(--color-amber)] text-[11px] font-semibold text-[var(--color-ink)]">
              {cartCount}
            </span>
          )}
        </Link>

        {user ? (
          <div className="relative ml-1 hidden sm:block">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] py-1.5 pl-1.5 pr-3 hover:border-[var(--color-amber)]"
              aria-expanded={menuOpen}
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-[var(--color-amber)] to-[var(--color-orange)] text-xs font-semibold text-[var(--color-ink)]">
                {user.name?.[0]?.toUpperCase() || "U"}
              </span>
              <span className="max-w-[9ch] truncate text-sm font-medium text-white/90">
                {user.name.split(" ")[0]}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-[var(--color-muted)]" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
                <Link
                  to="/my-listings"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-white/80 hover:bg-[var(--color-surface-2)] hover:text-white"
                >
                  <PackageSearch className="h-4 w-4" />
                  My Listings
                </Link>
                <Link
                  to="/my-bookings"
                  onClick={() => setMenuOpen(false)}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-white/80 hover:bg-[var(--color-surface-2)] hover:text-white"
                >
                  <CalendarCheck className="h-4 w-4" />
                  My Bookings
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-white/80 hover:bg-[var(--color-surface-2)] hover:text-white"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Admin Review
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 border-t border-[var(--color-border)] px-4 py-3 text-left text-sm text-white/80 hover:bg-[var(--color-surface-2)] hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="ml-1 hidden items-center gap-2 sm:flex">
            <Link
              to="/login"
              className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-white/90 hover:border-[var(--color-amber)]"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-gradient-to-r from-[var(--color-amber)] to-[var(--color-orange)] px-4 py-2 text-sm font-semibold text-[var(--color-ink)]"
            >
              Sign Up
            </Link>
          </div>
        )}

        <button
          className="ml-1 grid h-10 w-10 place-items-center rounded-full border border-[var(--color-border)] lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-[var(--color-border)] px-4 py-3 lg:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm font-medium text-white/80 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-3 border-t border-[var(--color-border)] pt-3">
            {user ? (
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-white/90">
                    <User className="h-4 w-4 text-[var(--color-amber)]" />
                    {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-[var(--color-amber)]"
                  >
                    Log out
                  </button>
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  <Link to="/my-listings" onClick={() => setOpen(false)} className="text-sm text-white/80">
                    My Listings
                  </Link>
                  <Link to="/my-bookings" onClick={() => setOpen(false)} className="text-sm text-white/80">
                    My Bookings
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setOpen(false)} className="text-sm text-white/80">
                      Admin Review
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-full border border-[var(--color-border)] py-2 text-center text-sm font-medium text-white/90"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-full bg-gradient-to-r from-[var(--color-amber)] to-[var(--color-orange)] py-2 text-center text-sm font-semibold text-[var(--color-ink)]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
