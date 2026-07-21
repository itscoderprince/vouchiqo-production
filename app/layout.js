import { Geist, Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import QueryProvider from "@/components/shared/QueryProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Vouchiqo | Verified Deals. Real Savings.",
  description:
    "Vouchiqo is a trusted coupon marketplace and merchant growth platform offering 100% verified deals and analytics.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistSans.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-brand-surface text-brand-text"
        suppressHydrationWarning
      >
        <QueryProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: { fontSize: "13px", fontWeight: 600 },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
