import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-gray-950 py-16 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blood-500 to-blood-700">
              <svg className="h-7 w-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.5 7 6 10.5 6 14a6 6 0 1012 0c0-3.5-2.5-7-6-12z" />
              </svg>
            </div>
            <div>
              <span className="text-2xl font-bold text-white">BioLynk</span>
              <p className="text-xs text-gray-500">Save Lives Instantly</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms of Service
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy Policy
            </Link>
          </div>

          <p className="text-center text-sm md:text-right">
            &copy; 2026 BioLynk. Real-Time Blood Emergency Coordination.
            <br />
            <span className="text-blood-400">Built to save lives.</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
