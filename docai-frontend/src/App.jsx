import { Routes, Route } from "react-router-dom"

import { Navigation } from "../components/shared/navigation.jsx"
import { PageTransition } from "../components/shared/page-transition.jsx"
import { KeyboardShortcutsProvider } from "../components/shared/keyboard-shortcuts-provider.jsx"
import { ToastWrapper } from "../components/shared/toast-wrapper.jsx"
import { OfflineBanner } from "../components/shared/offline-banner.jsx"
import { BackToTopArrow } from "../components/shared/back-to-top-arrow.jsx"
import { VersionBadge } from "../components/shared/version-badge.jsx"
import { HealthPing } from "../components/shared/health-ping.jsx"

import HomePage from "../app/page.jsx"
import UploadPage from "../app/upload/page.jsx"
import ChatPage from "../app/chat/page.jsx"
import AboutPage from "../app/about/page.jsx"
import SettingsPage from "../app/settings/page.jsx"
import NotFoundPage from "../app/not-found.jsx"

import { ThemeProvider } from "../context/ThemeContext"

function App() {
  return (
    <ThemeProvider>
      <KeyboardShortcutsProvider>
        <div className="min-h-screen bg-background transition-colors duration-300">
          <OfflineBanner />
          <HealthPing />
          <Navigation />
          <main className="relative pt-20">
            <PageTransition>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </PageTransition>
          </main>

          <BackToTopArrow />
          <VersionBadge />
          <ToastWrapper />

        </div>
      </KeyboardShortcutsProvider>
    </ThemeProvider>
  )
}

export default App
