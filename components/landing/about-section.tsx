"use client"

import { AnimateOnScroll } from "@/components/animate-on-scroll"

export function AboutSection() {
  return (
    <section id="about" className="relative bg-gradient-to-b from-white to-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left */}
          <AnimateOnScroll direction="left">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blood-50 px-5 py-2 text-sm font-semibold text-blood-600">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.5 7 6 10.5 6 14a6 6 0 1012 0c0-3.5-2.5-7-6-12z" />
                </svg>
                Our Mission
              </div>
              <h2 className="mb-6 text-balance text-4xl font-extrabold text-gray-900 sm:text-5xl">
                Bridging the <span className="gradient-text">Gap</span> Between Donors and Hospitals
              </h2>
              <p className="mb-6 text-lg leading-relaxed text-gray-600">
                In India, thousands of patients lose their lives every year due to the unavailability of blood during emergencies.
                The existing systems are slow, fragmented, and unable to respond in real-time.
              </p>
              <p className="mb-8 text-lg leading-relaxed text-gray-600">
                BioLynk was created to change this. Our platform uses real-time technology to instantly connect hospitals
                with nearby eligible blood donors when every second counts.
              </p>

              <div className="grid grid-cols-2 gap-6">
                <div className="rounded-2xl border border-blood-100 bg-blood-50/50 p-6">
                  <div className="mb-2 text-3xl font-extrabold text-blood-600">24/7</div>
                  <div className="text-sm text-gray-600">Emergency Response Active</div>
                </div>
                <div className="rounded-2xl border border-blood-100 bg-blood-50/50 p-6">
                  <div className="mb-2 text-3xl font-extrabold text-blood-600">100%</div>
                  <div className="text-sm text-gray-600">Free for Donors</div>
                </div>
              </div>
            </div>
          </AnimateOnScroll>

          {/* Right - Visual */}
          <AnimateOnScroll direction="right" delay={200}>
            <div className="relative flex items-center justify-center">
              <div className="relative z-10 grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="group rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <div className="mb-3 text-blood-600 transition-transform duration-300 group-hover:scale-110">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <h4 className="mb-1 font-bold text-gray-900">Donor Focused</h4>
                    <p className="text-sm text-gray-600">Simple registration with respect for donor preferences</p>
                  </div>
                  <div className="group rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <div className="mb-3 text-blood-600 transition-transform duration-300 group-hover:scale-110">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h4 className="mb-1 font-bold text-gray-900">Verified Network</h4>
                    <p className="text-sm text-gray-600">Every participant is verified for safety</p>
                  </div>
                </div>
                <div className="mt-8 space-y-4">
                  <div className="group rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <div className="mb-3 text-blood-600 transition-transform duration-300 group-hover:scale-110">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 className="mb-1 font-bold text-gray-900">Real-Time</h4>
                    <p className="text-sm text-gray-600">Instant alerts powered by live sync technology</p>
                  </div>
                  <div className="group rounded-2xl bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                    <div className="mb-3 text-blood-600 transition-transform duration-300 group-hover:scale-110">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="mb-1 font-bold text-gray-900">Pan-India</h4>
                    <p className="text-sm text-gray-600">Growing network across all major cities</p>
                  </div>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  )
}
