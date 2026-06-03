import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YouTubeTrades — Stocks hyped by YouTube creators",
  description:
    "Track which stocks finance YouTubers are talking about this week, with sources and trend signals.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0f0f0f] text-gray-200 antialiased">
        {children}
      </body>
    </html>
  );
}
