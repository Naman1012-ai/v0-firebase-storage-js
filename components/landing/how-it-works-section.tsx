import Link from "next/link"

const steps = [
  {
    num: 1,
    title: "Register",
    description: "Sign up as a donor or hospital with verified credentials. Our multi-step process ensures data accuracy.",
    icon: (
      <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  {
    num: 2,
    title: "Get Verified",
    description: "Our team verifies all registrations to ensure safety and authenticity for both donors and hospitals.",
    icon: (
      <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    num: 3,
    title: "Emergency Alert",
    description: "When blood is needed, hospitals create an emergency request. Matching donors are instantly notified.",
    icon: (
      <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  {
    num: 4,
    title: "Save a Life",
    description: "Donors respond, visit the hospital, and donate. Every drop counts in saving someone's life.",
    icon: (
      <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-20 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blood-50 px-5 py-2 text-sm font-semibold text-blood-600">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Simple Process
          </div>
          <h2 className="mb-6 text-balance text-4xl font-extrabold text-gray-900 sm:text-5xl">
            How <span className="gradient-text">BioLynk</span> Works
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-gray-600">
            From registration to saving lives - our streamlined process makes blood donation coordination effortless.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-blood-200 via-blood-400 to-blood-200 lg:block" />

          <div className="grid gap-16 lg:gap-24">
            {steps.map((step, i) => (
              <div
                key={step.num}
                className={`flex flex-col items-center gap-10 lg:flex-row ${i % 2 !== 0 ? "lg:flex-row-reverse" : ""}`}
              >
                {/* Content */}
                <div className={`flex-1 text-center ${i % 2 !== 0 ? "lg:text-left" : "lg:text-right"}`}>
                  <span className="mb-2 inline-block text-sm font-bold uppercase tracking-wider text-blood-400">
                    Step {step.num}
                  </span>
                  <h3 className="mb-4 text-3xl font-bold text-gray-900">{step.title}</h3>
                  <p className="text-lg leading-relaxed text-gray-600">{step.description}</p>
                </div>

                {/* Circle */}
                <div className="step-circle-anim flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blood-500 to-blood-700 shadow-xl shadow-blood-500/30">
                  {step.icon}
                </div>

                {/* Spacer */}
                <div className="hidden flex-1 lg:block" />
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <Link
            href="/donor"
            className="btn-primary inline-flex cursor-pointer items-center gap-3 rounded-2xl bg-gradient-to-r from-blood-500 to-blood-600 px-10 py-4 text-lg font-bold text-white shadow-2xl shadow-blood-500/30"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.5 7 6 10.5 6 14a6 6 0 1012 0c0-3.5-2.5-7-6-12z" />
            </svg>
            Start Saving Lives Today
          </Link>
        </div>
      </div>
    </section>
  )
}
