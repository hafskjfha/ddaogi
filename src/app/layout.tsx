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
  description: "DOJ 유저와 대회를 깊이 읽는 서드파티 분석 서비스",
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
