import Navbar from "@/app/_components/Navbar";
export default function RootLayout({ children }) {
  return (
    <>
      {children}
      <Navbar />
    </>
  );
}
