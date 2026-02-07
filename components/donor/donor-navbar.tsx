"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  getNotificationsForDonor,
  subscribe,
  type NotificationRecord,
} from "@/lib/store"

interface DonorNavbarProps {
  donorName?: string
  bloodGroup?: string
  isLoggedIn: boolean
  donorId?: string
  onLogout: () => void
}

export function DonorNavbar({ donorName, bloodGroup, isLoggedIn, donorId, onLogout }: DonorNavbarProps) {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)

  useEffect(() => {
    if (!donorId) return
    const refresh = () => {
      setNotifications(getNotificationsForDonor(donorId))
    }
    refresh()
    const unsub = subscribe(refresh)
    return () => unsub()
  }, [donorId])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 to-gray-800 shadow-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blood-500 to-blood-700 shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-blood-500/50">
                <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.5 7 6 10.5 6 14a6 6 0 1012 0c0-3.5-2.5-7-6-12z" />
                </svg>
              </div>
              <div className="absolute -right-1 -top-1 h-4 w-4 animate-pulse rounded-full border-2 border-gray-900 bg-green-500" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">BioLynk</span>
              <p className="-mt-1 text-xs text-gray-400">Donor Portal</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/" className="hidden items-center gap-2 text-gray-300 transition-colors hover:text-white md:flex">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>

            <Link href="/hospital" className="flex items-center gap-2 rounded-xl bg-blood-600 px-4 py-2 text-white transition-all hover:bg-blood-700">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="hidden sm:inline">Hospital Portal</span>
            </Link>

            {isLoggedIn && (
              <div className="flex items-center gap-3">
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                    className="relative rounded-xl bg-gray-700/50 p-2.5 text-gray-300 transition-all hover:bg-gray-700 hover:text-white"
                    aria-label="Notifications"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown */}
                  {showNotifDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowNotifDropdown(false)} />
                      <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                        <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
                          <h4 className="font-bold text-gray-900">Notifications</h4>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-gray-500">No notifications yet</div>
                          ) : (
                            notifications.slice(0, 10).map(n => (
                              <div
                                key={n.id}
                                className={`border-b border-gray-50 px-4 py-3 ${!n.read ? "bg-blue-50" : ""}`}
                              >
                                <p className="text-sm text-gray-700">{n.message}</p>
                                <p className="mt-1 text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* User info */}
                <div className="flex items-center gap-3 rounded-xl bg-gray-700/50 px-4 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blood-500">
                    <span className="text-sm font-bold text-white">{bloodGroup}</span>
                  </div>
                  <span className="hidden font-medium text-white sm:inline">{donorName}</span>
                </div>

                {/* Logout */}
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 rounded-xl bg-gray-700 px-4 py-2 text-white transition-all hover:bg-red-600"
                  title="Logout"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
