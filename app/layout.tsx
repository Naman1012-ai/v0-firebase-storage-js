import React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"

import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "BioLynk - Real-Time Blood Emergency Coordination",
  description:
    "BioLynk connects blood donors with hospitals in real-time during emergencies. Save lives with instant coordination.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
