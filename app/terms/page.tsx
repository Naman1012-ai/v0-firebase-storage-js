import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Terms of Service - BioLynk",
  description: "Terms of Service for the BioLynk blood donation platform.",
}

export default function TermsPage() {
  return (
    <main>
      <Navbar />
      <section className="bg-gradient-to-b from-gray-50 to-white py-24 pt-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blood-50 px-5 py-2 text-sm font-semibold text-blood-600">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Legal
            </div>
            <h1 className="text-balance text-4xl font-extrabold text-gray-900">Terms of Service</h1>
            <p className="mt-4 text-gray-500">Last updated: February 2026</p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">1. Acceptance of Terms</h2>
              <p className="leading-relaxed">By accessing or using BioLynk, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform. BioLynk is a real-time blood emergency coordination platform connecting donors and hospitals.</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">2. User Registration</h2>
              <p className="leading-relaxed">Users must provide accurate, current, and complete information during registration. Both donors and hospitals are subject to verification. False or misleading information may result in account suspension or termination.</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">3. Donor Responsibilities</h2>
              <p className="leading-relaxed">Donors must provide truthful medical information and health history. Donors agree to a 60-day cooldown period between donations as enforced by the platform. Accepting a blood request constitutes a commitment to donate at the specified hospital.</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">4. Hospital Responsibilities</h2>
              <p className="leading-relaxed">Hospitals must maintain valid medical licenses. Emergency blood requests should only be created for genuine medical needs. Hospitals are responsible for verifying donor identity and health before accepting donations.</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">5. Privacy & Data</h2>
              <p className="leading-relaxed">BioLynk collects and stores personal data necessary for platform operation, including location data for donor-hospital matching. Please review our <Link href="/privacy" className="font-semibold text-blood-600 hover:underline">Privacy Policy</Link> for full details on data handling.</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">6. Limitation of Liability</h2>
              <p className="leading-relaxed">BioLynk serves as a coordination platform and does not provide medical services directly. We are not liable for medical outcomes, donation complications, or any damages arising from the use of the platform. Users engage in blood donation at their own risk.</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">7. Contact</h2>
              <p className="leading-relaxed">For questions about these Terms of Service, please contact us through the BioLynk platform or email us at support@biolynk.web.app.</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
