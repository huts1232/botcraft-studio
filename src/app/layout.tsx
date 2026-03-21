import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "BotCraft Studio — Build intelligent chatbots from your data, no coding required",
  description: "A drag-and-drop platform that transforms business documents into smart conversational AI. Upload your knowledge base, design conversation flows visual",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="min-h-screen bg-gray-50 antialiased">{children}</body></html>
}