"use client";

import { useState } from "react";
import { SettingsModal } from "@/components/settings/settings-modal";
import { ScrollAnimationWrapper } from "@/components/shared/scroll-animation-wrapper";
import { PageTransition } from "@/components/shared/page-transition";
import { Settings } from "lucide-react";
import { ARIAButton } from "@/components/shared/aria-button";

export default function SettingsPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-lavender-soft">
        <main className="container mx-auto px-4 py-8 max-w-5xl">
          <ScrollAnimationWrapper>
            <div className="text-center mb-12">
              <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-4 font-display">
                Settings
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">
                Customize your Noetic Vault experience here.
              </p>

              <ARIAButton
                onClick={() => setShowModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg rounded-bento shadow-bento-lg hover:shadow-bento-hover transition-all duration-300 hover:scale-105"
              >
                <Settings className="w-5 h-5 mr-2" />
                Open Settings Panel
              </ARIAButton>
            </div>
          </ScrollAnimationWrapper>

          <ScrollAnimationWrapper>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Language",
                  desc: "Choose your preferred language",
                  icon: "-",
                },
                {
                  title: "Theme",
                  desc: "Switch between light and dark mode",
                  icon: "🎨",
                },
                {
                  title: "AI Model",
                  desc: "Select your preferred AI model",
                  icon: "🧠",
                },
                {
                  title: "Document View",
                  desc: "Choose how to display documents",
                  icon: "-",
                },
                {
                  title: "Profile & Sync",
                  desc: "Manage your profile and sync settings",
                  icon: "👤",
                },
                {
                  title: "Usage Stats",
                  desc: "View your Noetic Vault activity",
                  icon: "-",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border border-purple-300/50 dark:border-purple-500/30 rounded-3xl p-8 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer"
                  onClick={() => setShowModal(true)}
                >
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 font-display">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </ScrollAnimationWrapper>
        </main>

        <SettingsModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </div>
    </PageTransition>
  );
}
