import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Ciudad Tecnosocial - Juego de Estrategia Futurista",
  description:
    "Construye y gestiona tu ciudad-estado tecnosocial en un futuro distópico. Equilibra recursos, investiga tecnologías y compite con otros jugadores.",
  keywords: "juego, estrategia, ciudad, futuro, tecnología, PvP",
  authors: [{ name: "Ciudad Tecnosocial Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#0f172a",
  manifest: "/manifest.json",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} dark`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className={`${inter.className} antialiased bg-slate-900 text-white`}>{children}</body>
    </html>
  )
}
