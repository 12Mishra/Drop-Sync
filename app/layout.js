import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata = {
  title: "Drop&Sync",
  description: "File management made easy",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
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
