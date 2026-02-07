import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Privacy Policy - BioLynk",
  description: "Privacy Policy for the BioLynk blood donation platform.",
}

export default function PrivacyPage() {
  return (
    <main>
      <Navbar />
      <section className="bg-gradient-to-b from-gray-50 to-white py-24 pt-32">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blood-50 px-5 py-2 text-sm font-semibold text-blood-600">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Privacy
            </div>
            <h1 className="text-balance text-4xl font-extrabold text-gray-900">Privacy Policy</h1>
            <p className="mt-4 text-gray-500">Last updated: February 2026</p>
          </div>

          <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">1. Information We Collect</h2>
              <p className="leading-relaxed">We collect personal information you provide during registration including name, blood group, age, weight, phone number, email address, and geographic location (latitude/longitude). For hospitals, we also collect license information and contact details.</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">2. How We Use Your Information</h2>
              <p className="leading-relaxed">Your data is used to match donors with hospitals during blood emergencies based on blood type compatibility and geographic proximity. Location data enables real-time distance calculations. Medical history is used to determine donation eligibility.</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">3. Data Storage & Security</h2>
              <p className="leading-relaxed">All data is stored securely on Firebase Realtime Database with encryption. We implement access controls and authentication to protect your information. Donation records and medical data are handled with healthcare-grade security practices.</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">4. Data Sharing</h2>
              <p className="leading-relaxed">Your information is only shared with hospitals during emergency blood requests. We never sell your data to third parties. Hospital staff can see donor name, blood group, and approximate distance during active requests.</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">5. Your Rights</h2>
              <p className="leading-relaxed">You have the right to access, update, or delete your personal data at any time. Contact us to request data deletion. You may opt out of notifications while maintaining your account.</p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">6. Contact</h2>
              <p className="leading-relaxed">For privacy concerns, contact us at support@biolynk.web.app. Also see our <Link href="/terms" className="font-semibold text-blood-600 hover:underline">Terms of Service</Link>.</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
