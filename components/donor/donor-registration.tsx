"use client"

import { useState } from "react"
import { findDonorByName, addDonor } from "@/lib/store"

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
const diseases = [
  { value: "hiv", label: "HIV/AIDS" },
  { value: "hepatitis", label: "Hepatitis B/C" },
  { value: "diabetes", label: "Diabetes" },
  { value: "heart", label: "Heart Disease" },
  { value: "malaria", label: "Malaria (3mo)" },
]

interface DonorFormData {
  name: string
  age: string
  weight: string
  bloodGroup: string
  phone: string
  email: string
  lat: number | null
  lng: number | null
  diseases: string[]
  noDiseases: boolean
  smoke: string
  alcohol: string
  tattoo: string
  lastDonation: string
  password: string
  termsAccepted: boolean
}

interface DonorRegistrationProps {
  onRegistered: (donor: Record<string, unknown>) => void
  onSwitchToLogin: () => void
}

export function DonorRegistration({ onRegistered, onSwitchToLogin }: DonorRegistrationProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationDetected, setLocationDetected] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState<DonorFormData>({
    name: "", age: "", weight: "", bloodGroup: "",
    phone: "", email: "",
    lat: null, lng: null,
    diseases: [], noDiseases: false,
    smoke: "no", alcohol: "no", tattoo: "no",
    lastDonation: "",
    password: "", termsAccepted: false,
  })

  const updateField = (field: keyof DonorFormData, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setError("")
  }

  const toggleDisease = (disease: string) => {
    if (disease === "none") {
      setForm(prev => ({ ...prev, noDiseases: !prev.noDiseases, diseases: [] }))
    } else {
      setForm(prev => ({
        ...prev,
        noDiseases: false,
        diseases: prev.diseases.includes(disease)
          ? prev.diseases.filter(d => d !== disease)
          : [...prev.diseases, disease]
      }))
    }
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
        if (!form.name || !form.age || !form.weight || !form.bloodGroup) {
          setError("Please fill in all required fields.")
          return false
        }
        if (Number(form.age) < 18 || Number(form.age) > 65) {
          setError("Age must be between 18 and 65.")
          return false
        }
        if (Number(form.weight) < 45) {
          setError("Minimum weight is 45 kg.")
          return false
        }
        return true
      case 2:
        if (!form.phone || !form.email) {
          setError("Please provide phone and email.")
          return false
        }
        if (!/^[0-9]{10}$/.test(form.phone)) {
          setError("Phone must be a valid 10-digit number.")
          return false
        }
        if (!form.lat || !form.lng) {
          setError("Please detect your location.")
          return false
        }
        return true
      case 3:
        return true
      case 4:
        if (!form.password || form.password.length < 6) {
          setError("Password must be at least 6 characters.")
          return false
        }
        if (!form.termsAccepted) {
          setError("Please accept the terms to continue.")
          return false
        }
        return true
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setError("")
      setStep(prev => Math.min(prev + 1, 4))
    }
  }
  const prevStep = () => { setError(""); setStep(prev => Math.max(prev - 1, 1)) }

  const handleSubmit = () => {
    if (!validateStep(4)) return
    setLoading(true)
    setError("")
    try {
      const existing = findDonorByName(form.name.trim())
      if (existing) {
        setError("A donor with this name already exists. Please use a different name or login.")
        setLoading(false)
        return
      }

      const donorData = {
        name: form.name.trim(),
        bloodGroup: form.bloodGroup,
        age: Number(form.age),
        weight: Number(form.weight),
        phone: form.phone,
        email: form.email,
        password: form.password,
        location: { lat: form.lat!, lng: form.lng! },
        medical: form.diseases.length > 0 ? form.diseases : ["none"],
        lifestyle: { smoke: form.smoke, alcohol: form.alcohol, tattoo: form.tattoo },
        lastDonation: form.lastDonation || null,
        status: "active",
        registeredAt: new Date().toISOString(),
        donationCount: 0,
      }

      const newDonor = addDonor(donorData)
      onRegistered({ ...newDonor })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split("T")[0]

  const stepIcons = [
    <svg key="s1" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    <svg key="s2" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
    <svg key="s3" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
    <svg key="s4" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  ]

  const progressPercent = Math.round(((step - 1) / 3) * 100)

  const StepIndicator = () => (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Registration Progress</span>
        <span className="text-sm font-bold text-blood-600">{progressPercent}%</span>
      </div>
      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blood-400 to-blood-600 transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        {[
          { num: 1, label: "Personal" },
          { num: 2, label: "Contact" },
          { num: 3, label: "Medical" },
          { num: 4, label: "Account" },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                step > s.num ? "bg-blood-500 text-white" : step === s.num ? "bg-blood-500 text-white shadow-lg shadow-blood-500/30" : "bg-gray-200 text-gray-500"
              }`}>
                {step > s.num ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                ) : stepIcons[i]}
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
  )

  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl sm:p-8">
      <StepIndicator />

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <p className="font-semibold">Error</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Personal Details</h3>
            <p className="text-sm text-gray-500">Tell us a bit about yourself</p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Full Name *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </span>
              <input type="text" value={form.name} onChange={e => updateField("name", e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 py-3 pl-12 pr-4 font-medium transition-all focus:border-blood-500 focus:ring-2 focus:ring-blood-500" placeholder="Enter your full name" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Age *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </span>
                <input type="number" value={form.age} onChange={e => updateField("age", e.target.value)} min={18} max={65}
                  className="w-full rounded-xl border-2 border-gray-200 py-3 pl-12 pr-4 font-medium transition-all focus:border-blood-500 focus:ring-2 focus:ring-blood-500" placeholder="Years" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Weight *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                </span>
                <input type="number" value={form.weight} onChange={e => updateField("weight", e.target.value)} min={45}
                  className="w-full rounded-xl border-2 border-gray-200 py-3 pl-12 pr-4 font-medium transition-all focus:border-blood-500 focus:ring-2 focus:ring-blood-500" placeholder="Kg" />
              </div>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Blood Group *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.5 7 6 10.5 6 14a6 6 0 1012 0c0-3.5-2.5-7-6-12z" /></svg>
              </span>
              <select value={form.bloodGroup} onChange={e => updateField("bloodGroup", e.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 bg-white py-3 pl-12 pr-4 font-bold text-gray-800 transition-all focus:border-blood-500 focus:ring-2 focus:ring-blood-500">
                <option value="">Select Blood Group</option>
                {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button type="button" onClick={nextStep}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blood-500 to-blood-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-blood-600 hover:to-blood-700 hover:shadow-xl">
              Continue
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Contact & Location</h3>
            <p className="text-sm text-gray-500">How can hospitals reach you?</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Phone Number *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </span>
                <input type="tel" value={form.phone} onChange={e => updateField("phone", e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 py-3 pl-12 pr-4 transition-all focus:border-blood-500 focus:ring-2 focus:ring-blood-500" placeholder="10-digit mobile" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Email Address *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                </span>
                <input type="email" value={form.email} onChange={e => updateField("email", e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 py-3 pl-12 pr-4 transition-all focus:border-blood-500 focus:ring-2 focus:ring-blood-500" placeholder="your@email.com" />
              </div>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Current Location *</label>
            <button type="button" onClick={detectLocation} disabled={locationLoading}
              className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 font-semibold transition-all ${
                locationDetected
                  ? "border-green-200 bg-green-50 text-green-600"
                  : "border-blue-200 bg-blue-50 text-blue-600 hover:border-blue-300 hover:bg-blue-100"
              }`}>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {locationLoading ? "Detecting..." : locationDetected ? "Location detected" : "Auto-detect my location"}
            </button>
            {locationDetected && (
              <p className="mt-2 text-center text-sm text-green-600">
                Location saved ({form.lat?.toFixed(4)}, {form.lng?.toFixed(4)})
              </p>
            )}
          </div>
          <div className="flex justify-between pt-4">
            <button type="button" onClick={prevStep} className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 transition-all hover:bg-gray-50">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>
              Back
            </button>
            <button type="button" onClick={nextStep} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blood-500 to-blood-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-blood-600 hover:to-blood-700 hover:shadow-xl">
              Continue
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Medical History</h3>
            <p className="text-sm text-gray-500">Help us ensure safe donations</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="mb-3 text-sm font-semibold text-red-600">Do you have any of these conditions?</p>
            <div className="grid grid-cols-2 gap-2">
              {diseases.map(d => (
                <label key={d.value} className="flex cursor-pointer items-center gap-2 rounded-lg border bg-white p-3 hover:border-red-300">
                  <input type="checkbox" checked={form.diseases.includes(d.value)} onChange={() => toggleDisease(d.value)} className="h-4 w-4 text-red-600" />
                  <span className="text-sm">{d.label}</span>
                </label>
              ))}
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border bg-white p-3 hover:border-green-300">
                <input type="checkbox" checked={form.noDiseases} onChange={() => toggleDisease("none")} className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700">None</span>
              </label>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { name: "smoke" as const, label: "Do you smoke?" },
              { name: "alcohol" as const, label: "Alcohol (24h)?" },
              { name: "tattoo" as const, label: "Tattoos (6mo)?" },
            ].map(q => (
              <div key={q.name} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                <span className="text-sm">{q.label}</span>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1">
                    <input type="radio" name={q.name} checked={form[q.name] === "yes"} onChange={() => updateField(q.name, "yes")} className="text-red-600" />
                    <span className="text-sm">Yes</span>
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="radio" name={q.name} checked={form[q.name] === "no"} onChange={() => updateField(q.name, "no")} className="text-green-600" />
                    <span className="text-sm">No</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Last Donation</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </span>
              <input type="date" value={form.lastDonation} onChange={e => updateField("lastDonation", e.target.value)} max={today}
                className="w-full rounded-xl border-2 border-gray-200 py-3 pl-12 pr-4 focus:border-blood-500 focus:ring-2 focus:ring-blood-500" />
            </div>
            <p className="mt-1 text-xs text-gray-500">Leave empty if first time</p>
          </div>
          <div className="flex justify-between pt-4">
            <button type="button" onClick={prevStep} className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>
              Back
            </button>
            <button type="button" onClick={nextStep} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blood-500 to-blood-600 px-6 py-3 font-semibold text-white shadow-lg">
              Continue
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Create Account</h3>
            <p className="text-sm text-gray-500">Secure your donor profile</p>
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
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" checked={form.termsAccepted} onChange={e => updateField("termsAccepted", e.target.checked)} className="mt-0.5 h-5 w-5 rounded text-blood-600" />
              <span className="text-sm text-gray-600">
                I agree to the <a href="/terms" className="font-semibold text-blood-600 hover:underline">Terms</a> and confirm my medical info is accurate.
              </span>
            </label>
          </div>
          <div className="flex justify-between pt-4">
            <button type="button" onClick={prevStep} className="flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>
              Back
            </button>
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blood-500 to-blood-600 px-8 py-3 font-bold text-white shadow-lg transition-all hover:from-blood-600 hover:to-blood-700 hover:-translate-y-0.5 disabled:opacity-60">
              {loading ? (
                <>
                  <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                  Registering...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Complete Registration
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Already registered?{" "}
          <button onClick={onSwitchToLogin} className="font-semibold text-blood-600 hover:underline">Login here</button>
        </p>
      </div>
    </div>
  )
}
