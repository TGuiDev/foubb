import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Rangers",
  description: "Escolha um jogo e comece a diversão com os amigos.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#131316",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" className={cn("dark font-sans", inter.variable)}>
      <body className="bg-background text-foreground antialiased">
        {children}
        <footer className="pb-8 text-center text-xs text-muted-foreground/70">
          Criado por{" "}
          <a
            href="https://guidev.site"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:underline"
          >
            Gui.Dev
          </a>
        </footer>
      </body>
    </html>
  );
}
