"use client"

import { useState } from "react"
import { getHospitals, addHospital } from "@/lib/store"

interface HospitalFormData {
  name: string
  license: string
  establishment: string
  email: string
  contact: string
  emergencyHotline: string
  lat: number | null
  lng: number | null
  password: string
}

interface HospitalRegistrationProps {
  onRegistered: (hospital: Record<string, unknown>) => void
  onSwitchToLogin: () => void
}

export function HospitalRegistration({ onRegistered, onSwitchToLogin }: HospitalRegistrationProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationDetected, setLocationDetected] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState<HospitalFormData>({
    name: "", license: "", establishment: "",
    email: "", contact: "", emergencyHotline: "",
    lat: null, lng: null, password: "",
  })

  const updateField = (field: keyof HospitalFormData, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError("")
  }

  const detectLocation = async () => {
    setLocationLoading(true)
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 })
      })
      updateField("lat", pos.coords.latitude)
      updateField("lng", pos.coords.longitude)
      setLocationDetected(true)
    } catch {
      setError("Location detection failed. Please allow location access.")
    } finally {
      setLocationLoading(false)
    }
  }

  const validateStep = (s: number): boolean => {
    switch (s) {
      case 1:
        if (!form.name || !form.license) { setError("Hospital name and license are required."); return false }
        return true
      case 2:
        if (!form.email || !form.contact) { setError("Email and contact are required."); return false }
        return true
      case 3:
        if (!form.lat || !form.lng) { setError("Please detect your location."); return false }
        return true
      case 4:
        if (!form.password || form.password.length < 6) { setError("Password must be at least 6 characters."); return false }
        return true
      default: return true
    }
  }

  const nextStep = () => { if (validateStep(step)) { setError(""); setStep(prev => Math.min(prev + 1, 4)) } }
  const prevStep = () => { setError(""); setStep(prev => Math.max(prev - 1, 1)) }

  const handleSubmit = () => {
    if (!validateStep(4)) return
    setLoading(true)
    setError("")
    try {
      const existing = getHospitals()
      if (existing.some(h => (h.name || "").toLowerCase() === (form.name || "").trim().toLowerCase())) {
        setError("A hospital with this name already exists.")
        setLoading(false)
        return
      }

      const hospitalData = {
        name: form.name.trim(),
        license: form.license,
        establishment: form.establishment || null,
        email: form.email,
        contact: form.contact,
        emergencyHotline: form.emergencyHotline || null,
        location: { lat: form.lat!, lng: form.lng! },
        password: form.password,
        status: "active",
        registeredAt: new Date().toISOString(),
      }
      const newHospital = addHospital(hospitalData)
      onRegistered({ id: newHospital.id, ...hospitalData })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.")
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { num: 1, label: "Basic Info" },
    { num: 2, label: "Contact" },
    { num: 3, label: "Location" },
    { num: 4, label: "Account" },
  ]

  return (
    <div className="rounded-3xl border border-gray-100/50 bg-white/80 p-8 shadow-2xl backdrop-blur-xl">
      {/* Progress with percentage */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Registration Progress</span>
          <span className="text-sm font-bold text-blood-600">{Math.round(((step - 1) / 3) * 100)}%</span>
        </div>
        <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blood-400 to-blood-600 transition-all duration-500 ease-out"
            style={{ width: `${Math.round(((step - 1) / 3) * 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                  step > s.num ? "bg-blood-500 text-white" : step === s.num ? "bg-blood-500 text-white shadow-lg shadow-blood-500/30" : "bg-gray-200 text-gray-500"
                }`}>
                  {step > s.num ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    [
                      <svg key="h1" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
                      <svg key="h2" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
                      <svg key="h3" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
                      <svg key="h4" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
                    ][i]
                  )}
                </div>
                <span className={`mt-1 text-xs font-medium ${step >= s.num ? "text-gray-600" : "text-gray-400"}`}>{s.label}</span>
              </div>
              {i < 3 && (
                <div className="mx-2 h-1 w-8 rounded bg-gray-200 sm:w-12">
                  <div className={`h-full rounded bg-blood-500 transition-all duration-300 ${step > s.num ? "w-full" : "w-0"}`} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
      )}

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-200/50 bg-gradient-to-r from-gray-50 to-gray-100 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase text-gray-700">
              <svg className="h-4 w-4 text-blood-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Hospital Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Hospital Name *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </span>
                  <input type="text" value={form.name} onChange={e => updateField("name", e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 py-2.5 pl-10 pr-4 transition-all focus:border-blood-500 focus:ring-2 focus:ring-blood-500/20" placeholder="City General Hospital" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">License No. *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </span>
                    <input type="text" value={form.license} onChange={e => updateField("license", e.target.value)}
                      className="w-full rounded-xl border-2 border-gray-200 py-2.5 pl-10 pr-4 transition-all focus:border-blood-500 focus:ring-2 focus:ring-blood-500/20" placeholder="LIC-12345" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Establishment Year</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </span>
                    <input type="number" value={form.establishment} onChange={e => updateField("establishment", e.target.value)}
                      className="w-full rounded-xl border-2 border-gray-200 py-2.5 pl-10 pr-4 transition-all focus:border-blood-500 focus:ring-2 focus:ring-blood-500/20" placeholder="1990" min={1800} max={2026} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={nextStep} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blood-500 to-blood-600 px-6 py-3 font-semibold text-white shadow-lg hover:from-blood-600 hover:to-blood-700">
              Continue <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Contact */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-blue-200/50 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase text-gray-700">
              <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Contact Information
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Email *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                  </span>
                  <input type="email" value={form.email} onChange={e => updateField("email", e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 py-2.5 pl-10 pr-4 transition-all focus:border-blood-500 focus:ring-2 focus:ring-blood-500/20" placeholder="hospital@example.com" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Contact No. *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </span>
                  <input type="tel" value={form.contact} onChange={e => updateField("contact", e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 py-2.5 pl-10 pr-4 transition-all focus:border-blood-500 focus:ring-2 focus:ring-blood-500/20" placeholder="+91 98765 43210" />
                </div>
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-xs font-medium text-gray-600">Emergency Hotline (24/7)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  </span>
                  <input type="tel" value={form.emergencyHotline} onChange={e => updateField("emergencyHotline", e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 py-2.5 pl-10 pr-4 transition-all focus:border-blood-500 focus:ring-2 focus:ring-blood-500/20" placeholder="+91 1800-XXX-XXXX" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <button type="button" onClick={prevStep} className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg> Back
            </button>
            <button type="button" onClick={nextStep} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blood-500 to-blood-600 px-6 py-3 font-semibold text-white shadow-lg hover:from-blood-600 hover:to-blood-700">
              Continue <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Location (Detect only) */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-green-200/50 bg-gradient-to-r from-green-50 to-emerald-50 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase text-gray-700">
              <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Hospital Location
            </h3>
            <p className="mb-4 text-sm text-gray-600">We only store your coordinates (latitude/longitude) for donor matching.</p>
            <button type="button" onClick={detectLocation} disabled={locationLoading}
              className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 px-4 py-4 text-lg font-semibold transition-all ${
                locationDetected ? "border-green-300 bg-green-100 text-green-700" : "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100"
              }`}>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {locationLoading ? "Detecting..." : locationDetected ? "Location Detected" : "Detect Hospital Location"}
            </button>
            {locationDetected && (
              <p className="mt-3 text-center text-sm text-green-600">Coordinates saved: {form.lat?.toFixed(4)}, {form.lng?.toFixed(4)}</p>
            )}
          </div>
          <div className="flex justify-between">
            <button type="button" onClick={prevStep} className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg> Back
            </button>
            <button type="button" onClick={nextStep} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blood-500 to-blood-600 px-6 py-3 font-semibold text-white shadow-lg hover:from-blood-600 hover:to-blood-700">
              Continue <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Account & Review */}
      {step === 4 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Set Password & Review</h3>
            <p className="text-sm text-gray-500">Secure your hospital portal access</p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Password *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </span>
              <input type="password" value={form.password} onChange={e => updateField("password", e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 py-3 pl-12 pr-4 focus:border-blood-500 focus:ring-2 focus:ring-blood-500" placeholder="Min 6 characters" />
            </div>
          </div>
          {/* Review Summary */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h4 className="mb-3 font-semibold text-gray-700">Registration Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Hospital:</span><span className="font-medium text-gray-900">{form.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">License:</span><span className="font-medium text-gray-900">{form.license}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Email:</span><span className="font-medium text-gray-900">{form.email}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Contact:</span><span className="font-medium text-gray-900">{form.contact}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Location:</span><span className="font-medium text-gray-900">{form.lat?.toFixed(4)}, {form.lng?.toFixed(4)}</span></div>
            </div>
          </div>
          <div className="flex justify-between">
            <button type="button" onClick={prevStep} className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg> Back
            </button>
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blood-500 to-blood-600 px-8 py-3 font-bold text-white shadow-lg hover:from-blood-600 hover:to-blood-700 disabled:opacity-60">
              {loading ? "Registering..." : "Complete Registration"}
            </button>
          </div>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-gray-500">
        Already registered? <button onClick={onSwitchToLogin} className="font-semibold text-blood-600 hover:underline">Login here</button>
      </p>
    </div>
  )
}
