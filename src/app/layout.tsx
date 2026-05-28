import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Akor - Türkçe Şarkı Akorları",
  description:
    "Modern Türkçe şarkı akorları sitesi. En popüler şarkıların akorlarını bul, öğren ve çal. AI destekli akor önerileri.",
  keywords: ["akor", "türkçe şarkı", "gitar akor", "akorlar", "müzik"],
  openGraph: {
    title: "Akor - Türkçe Şarkı Akorları",
    description: "Modern Türkçe şarkı akorları sitesi",
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
      lang="tr"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
