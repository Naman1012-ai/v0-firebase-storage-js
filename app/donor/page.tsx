"use client"

import React, { useState, useCallback, useEffect, type FormEvent } from "react"
import { findDonorByName } from "@/lib/store"
import { DonorNavbar } from "@/components/donor/donor-navbar"
import { DonorRegistration } from "@/components/donor/donor-registration"
import { DonorDashboard } from "@/components/donor/donor-dashboard"
import { Footer } from "@/components/footer"

interface DonorData {
  id: string
  name: string
  bloodGroup: string
  status: string
  location?: { lat: number; lng: number }
  [key: string]: unknown
}

function loadSession(): DonorData | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem("biolynk_donor_session")
    if (!raw) return null
    return JSON.parse(raw) as DonorData
  } catch {
    return null
  }
}

function saveSession(donor: DonorData | null) {
  if (typeof window === "undefined") return
  if (donor) {
    sessionStorage.setItem("biolynk_donor_session", JSON.stringify(donor))
  } else {
    sessionStorage.removeItem("biolynk_donor_session")
  }
}

export default function DonorPage() {
  const [donor, setDonorState] = useState<DonorData | null>(null)
  const [view, setView] = useState<"register" | "login">("register")
  const [loginName, setLoginName] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Wrapper that syncs to session storage
  const setDonor = useCallback((value: DonorData | null | ((prev: DonorData | null) => DonorData | null)) => {
    setDonorState(prev => {
      const next = typeof value === "function" ? value(prev) : value
      saveSession(next)
      return next
    })
  }, [])

  // Restore session on mount
  useEffect(() => {
    const restored = loadSession()
    if (restored) {
      setDonorState(restored)
    }
    setHydrated(true)
  }, [])

  const handleLogin = (e: FormEvent) => {
    e.preventDefault()
    setLoginError("")
    setLoginLoading(true)

    try {
      const found = findDonorByName(loginName.trim())
      if (!found) {
        setLoginError("No donor found with this name. Please check your name or register.")
        setLoginLoading(false)
        return
      }

      if (found.password === loginPassword) {
        setDonor(found as DonorData)
      } else {
        setLoginError("Incorrect password. Please try again.")
      }
    } catch {
      setLoginError("Login failed. Please try again.")
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    setDonor(null)
    setView("login")
    setLoginName("")
    setLoginPassword("")
  }

  const handleRegistered = (newDonor: Record<string, unknown>) => {
    setDonor(newDonor as DonorData)
  }

  const handleLocationUpdate = useCallback((loc: { lat: number; lng: number }) => {
    setDonorState(prev => {
      if (!prev) return prev
      const next = { ...prev, location: loc }
      saveSession(next)
      return next
    })
  }, [])

  const handleStatusChange = useCallback((status: string) => {
    setDonorState(prev => {
      const next = prev ? { ...prev, status } : null
      saveSession(next)
      return next
    })
  }, [])

  // Wait for session restore before rendering
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

  // Dashboard view
  if (donor) {
    return (
      <main className="min-h-screen bg-gray-100">
        <DonorNavbar isLoggedIn donorName={donor.name} bloodGroup={donor.bloodGroup} donorId={donor.id} onLogout={handleLogout} />
        <DonorDashboard
          donor={donor}
          onStatusChange={handleStatusChange}
          onLocationUpdate={handleLocationUpdate}
          onLogout={handleLogout}
        />
        <Footer />
      </main>
    )
  }

  // Login / Register view
  return (
    <main className="min-h-screen bg-gray-100">
      <DonorNavbar isLoggedIn={false} onLogout={handleLogout} />

      <section className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: Benefits */}
            <div className="flex flex-col justify-center lg:pr-8">
              <div className="mb-8">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-600">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.5 7 6 10.5 6 14a6 6 0 1012 0c0-3.5-2.5-7-6-12z" />
                  </svg>
                  Join the Life-Saving Network
                </div>
                <h1 className="mb-4 text-balance text-4xl font-bold leading-tight text-gray-900 lg:text-5xl">
                  Your Blood Can Be <br />
                  <span className="bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                    {"Someone's Miracle"}
                  </span>
                </h1>
                <p className="text-pretty text-lg leading-relaxed text-gray-600">
                  Register as a blood donor and receive instant alerts when nearby hospitals need your blood type.{" "}
                  <span className="font-semibold text-gray-800">Your response could save up to 3 lives.</span>
                </p>
              </div>

              <div className="space-y-4">
                <div className="group flex items-start gap-4 rounded-2xl bg-white p-5 shadow-md transition-all hover:shadow-lg">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 transition-transform group-hover:scale-110">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Instant Notifications</h3>
                    <p className="text-sm text-gray-600">Receive immediate alerts when hospitals near you need your blood type urgently.</p>
                  </div>
                </div>
                <div className="group flex items-start gap-4 rounded-2xl bg-white p-5 shadow-md transition-all hover:shadow-lg">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-green-200 transition-transform group-hover:scale-110">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Location-Based Matching</h3>
                    <p className="text-sm text-gray-600">Only get alerts from hospitals within 15km of your location.</p>
                  </div>
                </div>
                <div className="group flex items-start gap-4 rounded-2xl bg-white p-5 shadow-md transition-all hover:shadow-lg">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 transition-transform group-hover:scale-110">
                    <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Flexible Commitment</h3>
                    <p className="text-sm text-gray-600">Set your availability, schedule breaks, and donate only when it suits you.</p>
                  </div>
                </div>
                <div className="group flex items-start gap-4 rounded-2xl bg-white p-5 shadow-md transition-all hover:shadow-lg">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-100 to-red-200 transition-transform group-hover:scale-110">
                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Safe & Verified</h3>
                    <p className="text-sm text-gray-600">All hospitals are verified. Your health data stays private and secure.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4 rounded-2xl bg-gray-900 p-5 text-white">
                <div className="flex -space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-900 bg-red-500 text-xs font-bold">A+</div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-900 bg-blue-500 text-xs font-bold">B-</div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-900 bg-green-500 text-xs font-bold">O+</div>
                </div>
                <div className="text-sm text-gray-400">Join the community making a difference</div>
              </div>
            </div>

            {/* Right: Form */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md">
                {/* Tabs */}
                <div className="mb-6 flex rounded-xl bg-gray-100 p-1.5 shadow-inner">
                  <button
                    onClick={() => setView("register")}
                    className={`flex-1 rounded-lg py-3 text-center font-semibold transition-all ${
                      view === "register" ? "bg-white text-blood-600 shadow" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Register
                  </button>
                  <button
                    onClick={() => setView("login")}
                    className={`flex-1 rounded-lg py-3 text-center font-semibold transition-all ${
                      view === "login" ? "bg-white text-blood-600 shadow" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Login
                  </button>
                </div>

                {view === "register" ? (
                  <DonorRegistration onRegistered={handleRegistered} onSwitchToLogin={() => setView("login")} />
                ) : (
                  <form onSubmit={handleLogin} className="space-y-6 rounded-3xl bg-white p-8 shadow-xl">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">Full Name</label>
                      <input type="text" value={loginName} onChange={e => setLoginName(e.target.value)} required
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all focus:border-blood-500 focus:ring-2 focus:ring-blood-500"
                        placeholder="Enter your registered name" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">Password</label>
                      <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required
                        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all focus:border-blood-500 focus:ring-2 focus:ring-blood-500"
                        placeholder="Enter your password" />
                    </div>
                    {loginError && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{loginError}</div>
                    )}
                    <button type="submit" disabled={loginLoading}
                      className="w-full rounded-xl bg-gradient-to-r from-blood-500 to-blood-600 py-4 text-lg font-bold text-white shadow-lg transition-all hover:from-blood-600 hover:to-blood-700 disabled:opacity-60">
                      {loginLoading ? "Logging in..." : "Login"}
                    </button>
                    <p className="text-center text-sm text-gray-500">
                      New donor?{" "}
                      <button type="button" onClick={() => setView("register")} className="font-semibold text-blood-600 hover:underline">Register here</button>
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
