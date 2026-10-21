import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppHeader } from "@/components/AppHeader";
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
  title: { default: "따오기", template: "%s · 따오기" },
  description: "DOJ 유저·대회 분석과 출처로 탐색하는 DOJstory 위키",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-dvh bg-slate-50 text-slate-950 antialiased dark:bg-slate-950 dark:text-slate-50">
        <AppHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
