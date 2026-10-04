import type { Metadata } from "next";
import { Poppins, Cairo } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import { CartProvider } from "@/context/CartContext";
import SessionWrapper from "@/components/SessionWrapper";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Energy — Healthy Food Menu",
  description: "Energy digital menu — healthy meals, sandwiches, salads and fresh juices.",
  keywords: ["Energy", "healthy food", "menu", "digital menu"],
  openGraph: {
    title: "Energy Menu",
    description: "Healthy food, full of energy",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${poppins.variable} ${cairo.variable} antialiased bg-bg text-ink min-h-screen`}>
        <SessionWrapper>
          <ThemeProvider>
            <LanguageProvider>
              <ToastProvider>
                <CartProvider>{children}</CartProvider>
              </ToastProvider>
            </LanguageProvider>
          </ThemeProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
