import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inochi Inu — Les Héritiers de Boshin",
  description: "Élevage d'Akita & Shiba Inu, Pension et Éducation canine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className="font-sans antialiased bg-[#FDFCF8] text-stone-800">
        {children}
      </body>
    </html>
  );
}