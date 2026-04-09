import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import NavbarWrapper from "@/components/NavbarWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Linkeando – Oficios a domicilio en Cali",
  description:
    "Encuentra plomeros, electricistas, pintores y más servicios a domicilio en Cali, Colombia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <NavbarWrapper><Navbar /></NavbarWrapper>
        <main>{children}</main>
      </body>
    </html>
  );
}
