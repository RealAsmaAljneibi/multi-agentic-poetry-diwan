import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "مجلس القصيد الإماراتي · The Emirati Multi-Agentic Poetic Majlis",
  description:
    "مجلس القصيد الإماراتي — متعدد الوكلاء. An Emirati Nabati poetry multi-agent system. A council of master Critics — Al-Mājidī bin Ẓāhir, Ousha bint Khalifa, and Sheikh Zayed — meets the living poet's voice.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="sr-only">Skip to main content</a>
        {children}
      </body>
    </html>
  );
}
