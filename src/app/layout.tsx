import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import NavbarWrapper from "@/components/NavbarWrapper";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Vinclu – El profesional correcto para tu necesidad",
  description:
    "Vinclu conecta a personas que necesitan servicios del hogar con profesionales verificados en Cali, Colombia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={jakarta.variable}>
      <body className={`${jakarta.className} bg-fondo min-h-screen text-[#1a1a1a]`}>
        <NavbarWrapper><Navbar /></NavbarWrapper>
        <main>{children}</main>
      </body>
    </html>
  );
}
