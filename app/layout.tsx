import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeadCatcher",
  description: "The mini-CRM and email automation hub for AI agencies.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
