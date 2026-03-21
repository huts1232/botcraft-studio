import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "BotCraft Studio — Build intelligent chatbots without coding",
  description: "BotCraft Studio enables businesses to create, customize, and deploy AI-powered chatbots for customer support, lead generation, and sales automation. U",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="min-h-screen bg-gray-50 antialiased">{children}</body></html>
}