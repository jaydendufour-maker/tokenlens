import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TokenLens — see which customer is eating your LLM bill",
  description:
    "FinOps for your LLM bill. Break down OpenAI/Anthropic cost by customer, feature and team, and get alerts before the invoice blows up. Free tier + open-source SDK.",
  openGraph: {
    title: "TokenLens — FinOps for your LLM bill",
    description:
      "Break down your AI spend by customer, feature and team. Alerts before the bill blows up.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
