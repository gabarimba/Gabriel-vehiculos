import type { Metadata } from "next"
import { Geist_Mono, Noto_Sans } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-autospeed-sans",
})
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })
export const metadata: Metadata = {
  title: "AutoSpeed | Control del taller",
  description:
    "Panel interno de AutoSpeed. Vehículos, clientes y servicios en un solo lugar. Demo con datos locales.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es-MX"
      suppressHydrationWarning
      className={cn(
        "font-sans antialiased",
        notoSans.variable,
        fontMono.variable
      )}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
