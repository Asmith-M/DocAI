"use client"

import { useState } from "react"
import { SettingsModal } from "@/components/settings/settings-modal"
import { ScrollAnimationWrapper } from "@/components/shared/scroll-animation-wrapper"
import { PageTransition } from "@/components/shared/page-transition"
import { Settings } from "lucide-react"
import { ARIAButton } from "@/components/shared/aria-button"

export default function SettingsPage() {
  const [showModal, setShowModal] = useState(false)

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-lavender-50 via-white to-lavender-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <ScrollAnimationWrapper>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Settings</h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Customize your DocAI experience with advanced settings
              </p>

              <ARIAButton
                onClick={() => setShowModal(true)}
                className="bg-lavender-500 hover:bg-lavender-600 text-white px-8 py-4 text-lg"
              >
                <Settings className="w-5 h-5 mr-2" />
                Open Settings Panel
              </ARIAButton>
            </div>
          </ScrollAnimationWrapper>

          <ScrollAnimationWrapper>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Language", desc: "Choose your preferred language", icon: "🌐" },
                { title: "Theme", desc: "Switch between light and dark mode", icon: "🎨" },
                { title: "AI Model", desc: "Select your preferred AI model", icon: "🧠" },
                { title: "Document View", desc: "Choose how to display documents", icon: "📄" },
                { title: "Profile & Sync", desc: "Manage your profile and sync settings", icon: "👤" },
                { title: "Usage Stats", desc: "View your DocAI activity", icon: "📊" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setShowModal(true)}
                >
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{item.desc}</p>
                </div>
              ))}
            </div>
          </ScrollAnimationWrapper>
        </main>

        <SettingsModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </div>
    </PageTransition>
  )
}
