import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic, Playfair_Display, Amiri } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast";
import LayoutContent from "@/components/LayoutContent";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-arabic",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
});

export const metadata: Metadata = {
  title: "Super market Sanabel oula | تموينات السنابل الأولى",
  description: "Fresh groceries delivered with excellence.",
};

import { SearchProvider } from "@/context/SearchContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${notoArabic.variable} ${playfair.variable} ${amiri.variable} antialiased min-h-screen bg-white text-gray-900`}>
        <LanguageProvider>
          <SearchProvider>
            <CartProvider>
              <LayoutContent>{children}</LayoutContent>
              <Toaster position="top-center" />
            </CartProvider>
          </SearchProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
