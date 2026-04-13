import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "무신사 경쟁분석",
  description: "무신사 카테고리 랭킹 + 리뷰 + AI 인사이트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
