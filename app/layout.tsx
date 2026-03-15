import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FeynViz — Six Easy Pieces",
  description: "Visualizaciones 3D interactivas de Feynman",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${mono.variable} antialiased bg-[#05050f]`}>
        {children}
      </body>
    </html>
  );
}
