import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Swingalyze",
  description: "AI golf instructor"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
