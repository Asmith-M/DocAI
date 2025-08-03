import { Routes, Route } from "react-router-dom"


import { Navigation } from "../components/shared/navigation.jsx"
import { PageTransition } from "../components/shared/page-transition.jsx"
import { KeyboardShortcutsProvider } from "../components/shared/keyboard-shortcuts-provider.jsx"
import { ToastWrapper } from "../components/shared/toast-wrapper.jsx"
import { OfflineBanner } from "../components/shared/offline-banner.jsx"
import { BackToTopArrow } from "../components/shared/back-to-top-arrow.jsx"
import { VersionBadge } from "../components/shared/version-badge.jsx"


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
        <div className="min-h-screen bg-gradient-to-br from-lavender-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
          <OfflineBanner />
          <Navigation />
          <main className="relative">
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