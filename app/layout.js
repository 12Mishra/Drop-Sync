import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/app/_components/SessionProvider"; // Ensure correct path

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Drop&Sync",
  description: "File management made easy",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider> {/* Ensure Provider wraps the entire app */}
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
