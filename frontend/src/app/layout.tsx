import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "LawFirm ERP - Hệ thống Quản trị & Điều hành Công ty Luật",
  description: "Hệ thống quản lý khách hàng, hồ sơ dịch vụ, vụ án tố tụng, công việc, lịch hẹn và tài chính cho công ty luật.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
