"use client"

import { AnimatedCounter } from "@/components/animated-counter"

const features = [
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Instant Emergency Alerts",
    description: "Hospitals broadcast blood needs in real-time. Matching donors receive immediate notifications based on blood type, location, and availability.",
    stat: "< 30s",
    statLabel: "Alert Delivery",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "GPS-Based Matching",
    description: "Our smart algorithm matches donors within optimal radius of the requesting hospital, ensuring fastest possible response times.",
    stat: "5km",
    statLabel: "Smart Radius",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Verified & Secure",
    description: "Multi-layer verification for both donors and hospitals. Medical data encrypted with healthcare-grade security protocols.",
    stat: "256-bit",
    statLabel: "Encryption",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Smart Scheduling",
    description: "Donors set availability windows. The system respects donation cooldown periods and never over-solicits any single donor.",
    stat: "56 days",
    statLabel: "Auto Cooldown",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Analytics Dashboard",
    description: "Real-time insights for hospitals on donor availability, response rates, and blood inventory levels across the network.",
    stat: "Real-time",
    statLabel: "Data Sync",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    title: "Lives Saved Tracker",
    description: "Every donation is tracked and celebrated. Donors build a profile of impact showing exactly how many lives they have helped save.",
    stat: "1000+",
    statLabel: "Lives Impacted",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative bg-gradient-to-b from-gray-50 to-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-20 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blood-50 px-5 py-2 text-sm font-semibold text-blood-600">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.5 7 6 10.5 6 14a6 6 0 1012 0c0-3.5-2.5-7-6-12z" />
            </svg>
            Platform Features
          </div>
          <h2 className="mb-6 text-balance text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Why <span className="gradient-text">BioLynk</span> Saves Lives
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-gray-600">
            Every feature is designed with one goal: connecting the right donor to the right hospital at the right time.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <div
              key={i}
              className="feature-card group relative overflow-hidden rounded-3xl border border-gray-100 p-8 shadow-lg"
            >
              {/* Top accent bar */}
              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-blood-400 to-blood-600 opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="feature-icon mb-6 inline-flex items-center justify-center rounded-2xl bg-blood-50 p-4 text-blood-600">
                {feature.icon}
              </div>

              <h3 className="mb-3 text-xl font-bold text-gray-900">{feature.title}</h3>
              <p className="mb-6 text-sm leading-relaxed text-gray-600">{feature.description}</p>

              <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                <span className="text-2xl font-bold text-blood-600">{feature.stat}</span>
                <span className="text-sm text-gray-500">{feature.statLabel}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="mt-20 grid grid-cols-2 gap-8 rounded-3xl bg-gradient-to-r from-blood-600 to-blood-700 p-10 text-white shadow-2xl shadow-blood-500/20 md:grid-cols-4">
          <div className="text-center">
            <div className="text-4xl font-extrabold">
              <AnimatedCounter target={500} suffix="+" />
            </div>
            <div className="mt-1 text-sm text-blood-100">Registered Donors</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-extrabold">
              <AnimatedCounter target={50} suffix="+" />
            </div>
            <div className="mt-1 text-sm text-blood-100">Partner Hospitals</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-extrabold">
              <AnimatedCounter target={1000} suffix="+" />
            </div>
            <div className="mt-1 text-sm text-blood-100">Lives Impacted</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-extrabold">
              {"<"}<AnimatedCounter target={3} />m
            </div>
            <div className="mt-1 text-sm text-blood-100">Avg Response Time</div>
          </div>
        </div>
      </div>
    </section>
  )
}
