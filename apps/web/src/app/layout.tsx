import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./scrollbar.css";
import { ThemeProvider } from "@/theme";
import { ThemeScript } from "@/theme/theme-script";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "nimbl",
  description: "Form Builder",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-surface text-text custom-scrollbar`}>
        <ThemeProvider>
          <EmailVerificationBanner />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

