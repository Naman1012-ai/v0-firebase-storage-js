"use client"

import Link from "next/link"

export function HeroSection() {
  return (
    <section className="hero-bg relative flex min-h-screen items-center overflow-hidden pt-20">
      {/* Floating Particles */}
      <div className="pointer-events-none absolute inset-0">
        {[10, 25, 40, 55, 70, 85, 15, 95].map((left, i) => (
          <div
            key={i}
            className="particle"
            style={{
              width: `${6 + (i % 4) * 3}px`,
              height: `${6 + (i % 4) * 3}px`,
              left: `${left}%`,
              animationDelay: `${i * 0.8}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="fade-in-up mb-8 inline-flex items-center gap-2 rounded-full border border-blood-500/30 bg-blood-600/20 px-5 py-2 text-sm font-semibold text-blood-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-blood-500" />
              Real-Time Emergency Response System
            </div>

            <h1 className="fade-in-up delay-1 mb-6 text-balance text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Every Second Counts
              <br />
              in a <span className="gradient-text">Blood Emergency</span>
            </h1>

            <p className="fade-in-up delay-2 mx-auto mb-10 max-w-xl text-pretty text-lg leading-relaxed text-gray-300 sm:text-xl lg:mx-0">
              BioLynk instantly connects hospitals with nearby eligible blood donors.
              When blood is needed, <span className="font-semibold text-blood-400">help arrives fast</span>.
            </p>

            {/* CTA Buttons */}
            <div className="fade-in-up delay-3 mb-12 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <Link
                href="/donor"
                className="btn-primary group inline-flex cursor-pointer items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blood-500 to-blood-600 px-8 py-4 text-lg font-bold text-white shadow-2xl shadow-blood-500/30"
              >
                <svg className="h-6 w-6 group-hover:animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.5 7 6 10.5 6 14a6 6 0 1012 0c0-3.5-2.5-7-6-12z" />
                </svg>
                I am a Donor
                <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/hospital"
                className="btn-secondary inline-flex cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-white/20 bg-white/10 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Hospital Login
              </Link>
            </div>

            {/* Stats */}
            <div className="fade-in-up delay-4 grid grid-cols-3 gap-6">
              <div className="glass-card rounded-2xl p-4 text-center">
                <div className="text-3xl font-bold text-blood-400 sm:text-4xl" id="stat-donors">500+</div>
                <div className="mt-1 text-sm text-gray-400">Active Donors</div>
              </div>
              <div className="glass-card rounded-2xl p-4 text-center">
                <div className="text-3xl font-bold text-blood-400 sm:text-4xl" id="stat-hospitals">50+</div>
                <div className="mt-1 text-sm text-gray-400">Partner Hospitals</div>
              </div>
              <div className="glass-card rounded-2xl p-4 text-center">
                <div className="text-3xl font-bold text-blood-400 sm:text-4xl">{"<3m"}</div>
                <div className="mt-1 text-sm text-gray-400">Avg. Response</div>
              </div>
            </div>
          </div>

          {/* Right Content - Animated Blood Drop */}
          <div className="relative hidden min-h-[500px] items-center justify-center lg:flex">
            {/* Ripple Effects */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="ripple-ring" />
              <div className="ripple-ring" />
              <div className="ripple-ring" />
            </div>

            {/* Heartbeat Line */}
            <svg className="absolute -top-10 h-32 w-full" viewBox="0 0 800 100" fill="none" preserveAspectRatio="none">
              <path
                className="heartbeat-line"
                d="M0 50 L150 50 L180 50 L200 20 L220 80 L240 30 L260 70 L280 50 L350 50 L800 50"
                stroke="url(#heartGradient)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
                  <stop offset="50%" stopColor="#dc2626" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Main Blood Drop */}
            <div className="blood-drop-hero relative">
              <svg width="220" height="280" viewBox="0 0 220 280">
                <defs>
                  <linearGradient id="bloodGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#f87171" }} />
                    <stop offset="30%" style={{ stopColor: "#ef4444" }} />
                    <stop offset="70%" style={{ stopColor: "#dc2626" }} />
                    <stop offset="100%" style={{ stopColor: "#991b1b" }} />
                  </linearGradient>
                  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="15" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <ellipse cx="110" cy="260" rx="60" ry="15" fill="rgba(0,0,0,0.3)" />
                <path
                  d="M110 15 C60 100 25 150 25 195 C25 245 60 265 110 265 C160 265 195 245 195 195 C195 150 160 100 110 15 Z"
                  fill="url(#bloodGradient)"
                  filter="url(#glow)"
                />
                <ellipse cx="70" cy="130" rx="25" ry="35" fill="white" opacity="0.15" />
                <ellipse cx="60" cy="115" rx="12" ry="18" fill="white" opacity="0.25" />

                {/* Chain Container */}
                <g transform="translate(110, 170)">
                  <g className="chain-rotate">
                    <ellipse cx="0" cy="-35" rx="10" ry="16" fill="none" stroke="#7f1d1d" strokeWidth="5" />
                    <ellipse cx="0" cy="35" rx="10" ry="16" fill="none" stroke="#7f1d1d" strokeWidth="5" />
                    <ellipse cx="-35" cy="0" rx="16" ry="10" fill="none" stroke="#7f1d1d" strokeWidth="5" />
                    <ellipse cx="35" cy="0" rx="16" ry="10" fill="none" stroke="#7f1d1d" strokeWidth="5" />
                  </g>
                  <g className="chain-rotate-reverse">
                    <ellipse cx="0" cy="-20" rx="6" ry="10" fill="none" stroke="white" strokeWidth="4" />
                    <ellipse cx="0" cy="20" rx="6" ry="10" fill="none" stroke="white" strokeWidth="4" />
                    <ellipse cx="-20" cy="0" rx="10" ry="6" fill="none" stroke="white" strokeWidth="4" />
                    <ellipse cx="20" cy="0" rx="10" ry="6" fill="none" stroke="white" strokeWidth="4" />
                  </g>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="scroll-indicator absolute bottom-10 left-1/2 cursor-pointer">
        <div className="flex h-12 w-8 justify-center rounded-full border-2 border-white/30 p-2">
          <div className="h-3 w-1.5 animate-bounce rounded-full bg-blood-500" />
        </div>
      </div>
    </section>
  )
}
