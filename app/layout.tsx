import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bourse du Temps",
  description: "La plateforme solidaire exclusive de l'Université Senghor. Échangez vos talents, valorisez votre temps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
