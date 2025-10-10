import { Inter } from "next/font/google"
import "./globals.css"
import { BackToTopArrow } from "@/components/shared/back-to-top-arrow"
import { OfflineBanner } from "@/components/shared/offline-banner"
import { KeyboardShortcutsProvider } from "@/components/shared/keyboard-shortcuts-provider"
import { Toasts } from "@/components/shared/toasts"
import { VersionBadge } from "@/components/shared/version-badge"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Noetic Vault - Chat with Your Documents",
  description: "Upload PDFs and chat with your documents using advanced AI technology",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-white h-screen w-full pt-20 overflow-hidden`}
      >
        <KeyboardShortcutsProvider>
          <OfflineBanner />
          {children}
          <Toasts />
          <BackToTopArrow />
        </KeyboardShortcutsProvider>
        <VersionBadge version="V1.2" position="top-right" />
      </body>
    </html>
  )
}
