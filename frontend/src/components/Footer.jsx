import { Link } from "react-router-dom"
import { Wrench, Globe, MessageCircle, Share2 } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-[var(--color-amber)] to-[var(--color-orange)]">
              <Wrench className="h-4 w-4 text-[var(--color-ink)]" strokeWidth={2.5} />
            </span>
            <span className="font-display text-base font-semibold">
              Borrow<span className="text-[var(--color-amber)]">Hub</span>
            </span>
          </Link>
          <p className="mt-3 max-w-[24ch] text-sm text-[var(--color-muted)]">
            Rent what you need this week. Skip what you'd only use once.
          </p>
          <div className="mt-5 flex gap-3">
            {[Globe, MessageCircle, Share2].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="grid h-9 w-9 place-items-center rounded-full border border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-amber)] hover:text-[var(--color-amber)]"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <FooterCol
          title="Platform"
          links={["Browse Equipment", "List Your Equipment", "How It Works", "Pricing"]}
        />
        <FooterCol title="Support" links={["Help Center", "Safety", "Contact Us", "Terms of Service"]} />
        <FooterCol title="Company" links={["About", "Careers", "Community Guidelines"]} />
      </div>
      <div className="border-t border-[var(--color-border)] px-4 py-5 text-center text-xs text-[var(--color-muted)]">
        © {new Date().getFullYear()} BorrowHub. All rights reserved.
      </div>
    </footer>
  )
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h4 className="mb-4 text-sm font-semibold text-white">{title}</h4>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="text-sm text-[var(--color-muted)] hover:text-[var(--color-amber)]">
              {l}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
