"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between py-3">
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

          <div className="hidden items-center gap-8 md:flex">
            <Link href="/#features" className="nav-link font-medium text-gray-700 transition-colors hover:text-blood-600">
              Features
            </Link>
            <Link href="/#how-it-works" className="nav-link font-medium text-gray-700 transition-colors hover:text-blood-600">
              How It Works
            </Link>
            <Link href="/#about" className="nav-link font-medium text-gray-700 transition-colors hover:text-blood-600">
              About
            </Link>
          </div>

          <div className="flex items-center gap-3">
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
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-blood-500 to-blood-600 px-5 py-2.5 font-semibold text-white shadow-lg transition-all duration-300 hover:from-blood-600 hover:to-blood-700 hover:shadow-blood-500/40"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Hospital Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
