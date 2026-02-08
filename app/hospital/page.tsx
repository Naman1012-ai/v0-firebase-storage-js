"use client"

import React, { useState, useCallback, useEffect, type FormEvent } from "react"
import { findHospitalByEmailAndLicense } from "@/lib/store"
import Link from "next/link"
import { HospitalRegistration } from "@/components/hospital/hospital-registration"
import { HospitalDashboard } from "@/components/hospital/hospital-dashboard"
import { Footer } from "@/components/footer"

interface HospitalData {
  id: string
  name: string
  location: { lat: number; lng: number }
  [key: string]: unknown
}

function loadHospitalSession(): HospitalData | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem("biolynk_hospital_session")
    if (!raw) return null
    const parsed = JSON.parse(raw) as HospitalData
    return parsed
  } catch {
    return null
  }
}

function saveHospitalSession(hospital: HospitalData | null) {
  if (typeof window === "undefined") return
  if (hospital) {
    sessionStorage.setItem("biolynk_hospital_session", JSON.stringify(hospital))
  } else {
    sessionStorage.removeItem("biolynk_hospital_session")
  }
}

export default function HospitalPage() {
  const [hospital, setHospitalState] = useState<HospitalData | null>(null)
  const [view, setView] = useState<"hero" | "login" | "register">("hero")
  const [loginEmail, setLoginEmail] = useState("")
  const [loginLicense, setLoginLicense] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  const setHospital = useCallback((value: HospitalData | null) => {
    setHospitalState(value)
    saveHospitalSession(value)
  }, [])

  // Restore session on mount
  useEffect(() => {
    const restored = loadHospitalSession()
    if (restored) {
      setHospitalState(restored)
    }
    setHydrated(true)
  }, [])

  const handleLogin = (e: FormEvent) => {
    e.preventDefault()
    setLoginError("")
    setLoginLoading(true)
    try {
      const found = findHospitalByEmailAndLicense(loginEmail.trim(), loginLicense.trim())

      if (!found) {
        setLoginError("No hospital found. Please check your email and license number.")
        setLoginLoading(false)
        return
      }

      if (found.password === loginPassword) {
        setHospital(found as HospitalData)
      } else {
        setLoginError("Incorrect password.")
      }
    } catch {
      setLoginError("Login failed.")
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    setHospital(null)
    setView("hero")
  }

  // Wait for session restore
  if (!hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blood-200 border-t-blood-600" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </main>
    )
  }

  // Dashboard
  if (hospital) {
    return (
      <main className="min-h-screen bg-gray-100">
        <nav className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 to-gray-800 shadow-xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-20 items-center justify-between">
              <Link href="/" className="group flex items-center gap-3">
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blood-500 to-blood-700 shadow-lg transition-all duration-300 group-hover:scale-105">
                    <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.5 7 6 10.5 6 14a6 6 0 1012 0c0-3.5-2.5-7-6-12z" />
                    </svg>
                  </div>
                  <div className="absolute -right-1 -top-1 h-4 w-4 animate-pulse rounded-full border-2 border-gray-900 bg-green-500" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-white">BioLynk</span>
                  <p className="-mt-1 text-xs text-gray-400">Hospital Dashboard</p>
                </div>
              </Link>
              <div className="flex items-center gap-4">
                <div className="hidden items-center gap-3 rounded-xl bg-gray-700/50 px-4 py-2 sm:flex">
                  <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="font-medium text-white">{hospital.name}</span>
                </div>
                <button onClick={handleLogout} className="rounded-xl bg-gray-700 px-4 py-2 text-white transition-all hover:bg-red-600">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
        <HospitalDashboard hospital={hospital} />
        <Footer />
      </main>
    )
  }

  // Auth views
  return (
    <main className="min-h-screen bg-gray-100">
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 to-gray-800 shadow-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="group flex items-center gap-3">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blood-500 to-blood-700 shadow-lg transition-all duration-300 group-hover:scale-105">
                  <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.5 7 6 10.5 6 14a6 6 0 1012 0c0-3.5-2.5-7-6-12z" />
                  </svg>
                </div>
              </div>
              <div>
                <span className="text-2xl font-bold text-white">BioLynk</span>
                <p className="-mt-1 text-xs text-gray-400">Hospital Portal</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/" className="hidden text-gray-300 transition-colors hover:text-white md:block">Home</Link>
              <Link href="/donor" className="flex items-center gap-2 rounded-xl bg-blood-600 px-4 py-2 text-white transition-all hover:bg-blood-700">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.5 7 6 10.5 6 14a6 6 0 1012 0c0-3.5-2.5-7-6-12z" /></svg>
                <span className="hidden sm:inline">Donor Portal</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative flex min-h-[85vh] items-center overflow-hidden py-12">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-float absolute -right-40 -top-40 h-80 w-80 rounded-full bg-blood-500/10 blur-3xl" />
          <div className="animate-float absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: Hero */}
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex animate-pulse items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-bold text-blood-700">
                <span className="h-2 w-2 animate-ping rounded-full bg-blood-600" />
                Hospital Portal Access
              </div>
              <h1 className="text-balance text-5xl font-bold leading-tight text-gray-900">
                Emergency Blood <br />
                <span className="bg-gradient-to-r from-blood-600 to-blood-800 bg-clip-text text-transparent">Coordination Center</span>
              </h1>
              <p className="text-pretty text-xl text-gray-600">
                Secure portal for hospitals to broadcast emergency blood requests to nearby verified donors in real-time.
              </p>

              {view === "hero" && (
                <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                  <button onClick={() => setView("login")}
                    className="rounded-2xl bg-gradient-to-r from-blood-600 to-blood-700 px-8 py-4 font-bold text-white shadow-lg shadow-blood-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <span className="flex items-center gap-2">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3H7a3 3 0 013 3v1" /></svg>
                      Login to Portal
                    </span>
                  </button>
                  <button onClick={() => setView("register")}
                    className="rounded-2xl border border-gray-100 bg-white px-8 py-4 font-bold text-gray-700 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-gray-50">
                    <span className="flex items-center gap-2">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                      Register Hospital
                    </span>
                  </button>
                </div>
              )}

              <div className="mt-8 grid grid-cols-3 gap-6 border-t border-gray-200 pt-8">
                <div className="text-center transition-transform hover:scale-110">
                  <div className="bg-gradient-to-br from-blood-600 to-blood-800 bg-clip-text text-4xl font-bold text-transparent">24/7</div>
                  <div className="mt-1 text-sm text-gray-500">Emergency Support</div>
                </div>
                <div className="text-center transition-transform hover:scale-110">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-800 bg-clip-text text-4xl font-bold text-transparent">15km</div>
                  <div className="mt-1 text-sm text-gray-500">Donor Radius</div>
                </div>
                <div className="text-center transition-transform hover:scale-110">
                  <div className="bg-gradient-to-br from-green-600 to-green-800 bg-clip-text text-4xl font-bold text-transparent">100%</div>
                  <div className="mt-1 text-sm text-gray-500">Verified Donors</div>
                </div>
              </div>
            </div>

            {/* Right: Forms */}
            <div className="relative">
              {view === "login" && (
                <div className="rounded-3xl border border-gray-100/50 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
                  <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 animate-float items-center justify-center rounded-2xl bg-gradient-to-br from-blood-100 to-blood-200 shadow-lg">
                      <svg className="h-10 w-10 text-blood-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Hospital Login</h2>
                    <p className="mt-2 text-gray-500">Access your dashboard</p>
                  </div>
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                        </span>
                        <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required
                          className="w-full rounded-xl border-2 border-gray-200 py-3 pl-12 pr-4 font-medium transition-all focus:border-blood-500 focus:ring-2 focus:ring-blood-500" placeholder="hospital@example.com" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">License Number</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </span>
                        <input type="text" value={loginLicense} onChange={e => setLoginLicense(e.target.value)} required
                          className="w-full rounded-xl border-2 border-gray-200 py-3 pl-12 pr-4 font-medium transition-all focus:border-blood-500 focus:ring-2 focus:ring-blood-500" placeholder="LIC-12345" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </span>
                        <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required
                          className="w-full rounded-xl border-2 border-gray-200 py-3 pl-12 pr-4 font-medium transition-all focus:border-blood-500 focus:ring-2 focus:ring-blood-500" placeholder="Enter password" />
                      </div>
                    </div>
                    {loginError && <div className="rounded-lg bg-red-50 p-3 text-center text-sm font-medium text-red-500">{loginError}</div>}
                    <button type="submit" disabled={loginLoading}
                      className="w-full rounded-xl bg-gradient-to-r from-blood-600 to-blood-700 py-4 font-bold text-white shadow-lg transition-all hover:from-blood-700 hover:to-blood-800 disabled:opacity-60">
                      {loginLoading ? "Logging in..." : "Secure Login"}
                    </button>
                  </form>
                  <p className="mt-6 text-center text-sm text-gray-500">
                    Not registered? <button onClick={() => setView("register")} className="font-bold text-blood-600 hover:underline">Register New Hospital</button>
                  </p>
                </div>
              )}

              {view === "register" && (
                <HospitalRegistration
                  onRegistered={(h) => { setHospital(h as HospitalData) }}
                  onSwitchToLogin={() => setView("login")}
                />
              )}

              {view === "hero" && (
                <div className="flex items-center justify-center rounded-3xl border border-gray-100/50 bg-white/60 p-8 text-center shadow-xl backdrop-blur-xl">
                  <div className="mx-auto flex h-20 w-20 animate-float items-center justify-center rounded-2xl bg-gradient-to-br from-blood-100 to-blood-200 shadow-lg">
                    <svg className="h-10 w-10 text-blood-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
