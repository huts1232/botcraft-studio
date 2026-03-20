import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "BotCraft Studio — Train custom chatbots without coding",
  description: "A no-code platform that enables businesses to create, train, and deploy intelligent chatbots using their own data. Users can upload documents, configu",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="min-h-screen bg-gray-50 antialiased">{children}</body></html>
}