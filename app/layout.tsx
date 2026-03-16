import type { Metadata } from "next";
import { Geist_Mono, Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const heading = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "FeynViz — Six Easy Pieces",
  description: "La edición interactiva de Six Easy Pieces de Feynman. Simulaciones 3D que puedes explorar, manipular y entender.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${mono.variable} ${heading.variable} ${body.variable} antialiased bg-[#0b0b0b]`}>
        {children}
      </body>
    </html>
  );
}
