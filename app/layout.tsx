import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Scam Detector PL",
  description: "Sprawdź, czy wiadomość SMS, e-mail lub czat OLX/Allegro może być próbą oszustwa.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body className="min-h-screen antialiased text-slate-900">{children}</body>
    </html>
  );
}
