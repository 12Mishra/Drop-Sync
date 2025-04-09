import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider"; 
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider> {/* Ensure Provider wraps the entire app */}
          {children}
        </SessionProvider>
        <ToastContainer 
        position="top-right" 
        autoClose={3000}
        theme="dark"  
        className="z-50" 
        toastClassName="relative"
      />
      </body>
    </html>
  );
}
