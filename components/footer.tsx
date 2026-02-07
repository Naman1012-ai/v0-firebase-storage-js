import Link from "next/link"

const navLinks = [
  { href: "/#about", label: "About" },
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/donor", label: "Donor Portal" },
  { href: "/hospital", label: "Hospital Portal" },
]

export function Footer() {
  return (
    <footer className="bg-gray-950 py-16 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blood-500 to-blood-700">
                <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.5 7 6 10.5 6 14a6 6 0 1012 0c0-3.5-2.5-7-6-12z" />
                </svg>
              </div>
              <div>
                <span className="text-2xl font-bold text-white">BioLynk</span>
                <p className="text-xs text-gray-500">Save Lives Instantly</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-gray-500">
              Real-Time Blood Emergency Coordination. Connecting donors with hospitals when every second counts.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Navigation</h4>
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal & Info */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Legal</h4>
            <div className="flex flex-col gap-2">
              <Link href="/terms" className="text-sm text-gray-400 transition-colors hover:text-white">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-sm text-gray-400 transition-colors hover:text-white">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-8 text-center text-sm">
          <p>
            &copy; 2026 BioLynk. Real-Time Blood Emergency Coordination.{" "}
            <span className="text-blood-400">Built to save lives.</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
