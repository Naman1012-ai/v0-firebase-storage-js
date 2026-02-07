"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const navLinks = [
  { href: "/#about", label: "About" },
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/donor", label: "Donor Portal" },
  { href: "/hospital", label: "Hospital Portal" },
]

export function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[4.5rem] items-center justify-between py-3">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blood-500 to-blood-700 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-blood-500/50">
              <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.5 7 6 10.5 6 14a6 6 0 1012 0c0-3.5-2.5-7-6-12z" />
              </svg>
            </div>
            <div>
              <span className="text-2xl font-bold text-blood-600">BioLynk</span>
              <p className="-mt-1 text-xs text-gray-500">Save Lives Instantly</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {/* CTA buttons - visible on larger screens */}
            <Link
              href="/donor"
              className={`hidden cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 font-semibold transition-all duration-300 sm:flex ${
                pathname === "/donor"
                  ? "bg-blood-50 text-blood-700"
                  : "text-blood-600 hover:bg-blood-50"
              }`}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.5 7 6 10.5 6 14a6 6 0 1012 0c0-3.5-2.5-7-6-12z" />
              </svg>
              Donor Portal
            </Link>
            <Link
              href="/hospital"
              className="hidden cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-blood-500 to-blood-600 px-5 py-2.5 font-semibold text-white shadow-lg transition-all duration-300 hover:from-blood-600 hover:to-blood-700 hover:shadow-blood-500/40 sm:flex"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Hospital Login
            </Link>

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition-all hover:bg-gray-50 hover:text-blood-600"
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              <svg
                className={`h-5 w-5 transition-transform duration-300 ${menuOpen ? "rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      <div
        className={`overflow-hidden border-t border-gray-100 bg-white/98 shadow-lg backdrop-blur-lg transition-all duration-300 ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-all hover:bg-blood-50 hover:text-blood-600 ${
                  pathname === link.href ? "bg-blood-50 text-blood-600" : "text-gray-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
