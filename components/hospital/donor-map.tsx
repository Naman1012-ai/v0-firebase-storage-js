"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  getDonors,
  getDistanceKm,
  GPS_RADIUS_KM,
  subscribe,
  type DonorRecord,
} from "@/lib/store"

interface DonorMapProps {
  hospitalLocation: { lat: number; lng: number }
  hospitalName: string
}

declare global {
  interface Window {
    L: typeof import("leaflet")
  }
}

function loadLeaflet(): Promise<typeof import("leaflet")> {
  return new Promise((resolve, reject) => {
    if (window.L) {
      resolve(window.L)
      return
    }
    // Load CSS
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    link.crossOrigin = "anonymous"
    document.head.appendChild(link)

    // Load JS
    const script = document.createElement("script")
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    script.crossOrigin = "anonymous"
    script.onload = () => resolve(window.L)
    script.onerror = () => reject(new Error("Failed to load Leaflet"))
    document.head.appendChild(script)
  })
}

export function DonorMap({ hospitalLocation, hospitalName }: DonorMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<ReturnType<typeof window.L.map> | null>(null)
  const markersRef = useRef<ReturnType<typeof window.L.layerGroup> | null>(null)
  const [nearbyDonors, setNearbyDonors] = useState<DonorRecord[]>([])
  const [mapReady, setMapReady] = useState(false)
  const [mapLoadError, setMapLoadError] = useState(false)

  const getNearbyDonors = useCallback(() => {
    const allDonors = getDonors()
    return allDonors.filter((donor) => {
      if (!donor.location) return false
      const dist = getDistanceKm(
        hospitalLocation.lat,
        hospitalLocation.lng,
        donor.location.lat,
        donor.location.lng
      )
      return dist <= GPS_RADIUS_KM
    })
  }, [hospitalLocation.lat, hospitalLocation.lng])

  // Subscribe to store changes for real-time donor updates
  useEffect(() => {
    const refresh = () => {
      setNearbyDonors(getNearbyDonors())
    }
    refresh()
    const unsub = subscribe(refresh)
    return () => unsub()
  }, [getNearbyDonors])

  // Initialize Leaflet map
  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const L = await loadLeaflet()
        if (cancelled || !mapRef.current) return
        if (mapInstanceRef.current) return // Already initialized

        const map = L.map(mapRef.current).setView(
          [hospitalLocation.lat, hospitalLocation.lng],
          13
        )

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://openstreetmap.org">OSM</a>',
          maxZoom: 18,
        }).addTo(map)

        // Hospital marker
        const hospitalIcon = L.divIcon({
          html: `<div style="background:#dc2626;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:16px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">H</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          className: "",
        })
        L.marker([hospitalLocation.lat, hospitalLocation.lng], { icon: hospitalIcon })
          .addTo(map)
          .bindPopup(`<strong>${hospitalName}</strong><br/>Hospital`)

        // 15km radius circle
        L.circle([hospitalLocation.lat, hospitalLocation.lng], {
          radius: GPS_RADIUS_KM * 1000,
          color: "#dc2626",
          fillColor: "#fee2e2",
          fillOpacity: 0.15,
          weight: 2,
          dashArray: "5, 10",
        }).addTo(map)

        const layerGroup = L.layerGroup().addTo(map)
        markersRef.current = layerGroup
        mapInstanceRef.current = map
        setMapReady(true)
      } catch {
        if (!cancelled) setMapLoadError(true)
      }
    }

    init()

    return () => {
      cancelled = true
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markersRef.current = null
        setMapReady(false)
      }
    }
  }, [hospitalLocation.lat, hospitalLocation.lng, hospitalName])

  // Update donor markers when donors change
  useEffect(() => {
    if (!mapReady || !markersRef.current || !window.L) return

    const L = window.L
    markersRef.current.clearLayers()

    for (const donor of nearbyDonors) {
      if (!donor.location) continue

      const isActive = donor.status === "active"
      const bgColor = isActive ? "#16a34a" : "#9ca3af"
      const borderColor = isActive ? "#15803d" : "#6b7280"

      const icon = L.divIcon({
        html: `<div style="background:${bgColor};color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:10px;border:2px solid ${borderColor};box-shadow:0 1px 4px rgba(0,0,0,0.3);">${donor.bloodGroup.replace("+", "+").replace("-", "-")}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        className: "",
      })

      const dist = getDistanceKm(
        hospitalLocation.lat,
        hospitalLocation.lng,
        donor.location.lat,
        donor.location.lng
      ).toFixed(1)

      L.marker([donor.location.lat, donor.location.lng], { icon })
        .addTo(markersRef.current!)
        .bindPopup(
          `<strong>${donor.name}</strong><br/>Blood: ${donor.bloodGroup}<br/>Status: ${isActive ? "Active" : "Inactive"}<br/>Distance: ${dist} km`
        )
    }
  }, [nearbyDonors, mapReady, hospitalLocation.lat, hospitalLocation.lng])

  const activeDonors = nearbyDonors.filter((d) => d.status === "active")
  const inactiveDonors = nearbyDonors.filter((d) => d.status !== "active")

  if (mapLoadError) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
          <svg className="h-5 w-5 text-blood-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Nearby Donors ({GPS_RADIUS_KM}km Radius)
        </h3>
        <div className="flex flex-col items-center justify-center rounded-xl bg-gray-50 p-8 text-center">
          <p className="text-sm text-gray-500">Map could not be loaded. Found {nearbyDonors.length} donors within {GPS_RADIUS_KM}km.</p>
          <p className="mt-1 text-xs text-gray-400">Active: {activeDonors.length} | Inactive: {inactiveDonors.length}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <svg className="h-5 w-5 text-blood-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Live Donor Map ({GPS_RADIUS_KM}km Radius)
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-xs font-medium text-gray-600">Active ({activeDonors.length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-gray-400" />
            <span className="text-xs font-medium text-gray-600">Inactive ({inactiveDonors.length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex h-3 w-3 items-center justify-center rounded-full bg-red-600 text-[6px] font-bold text-white">H</div>
            <span className="text-xs font-medium text-gray-600">Hospital</span>
          </div>
        </div>
      </div>

      <div
        ref={mapRef}
        className="h-[400px] w-full overflow-hidden rounded-xl border border-gray-200"
        style={{ zIndex: 0 }}
      />

      {nearbyDonors.length === 0 && (
        <p className="mt-3 text-center text-sm text-gray-500">
          No donors found within {GPS_RADIUS_KM}km radius. Donors will appear as they register and share their location.
        </p>
      )}
    </div>
  )
}
