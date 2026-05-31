import type { Metadata, Viewport } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { ToastHost } from "@/components/toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const serifDisplay = DM_Serif_Display({
  variable: "--font-serif-display",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Aigentless — Tour smarter",
  description: "Book the right tour, not just any tour.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FAF8F5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${serifDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="phone-frame">{children}</div>
        <ToastHost />
      </body>
    </html>
  );
}
