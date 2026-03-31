import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./providers";

const heading = Space_Grotesk({
  variable: "--font-title",
  subsets: ["latin"],
});

const body = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AutoPilot.com | Presença digital com performance",
    template: "%s | AutoPilot.com",
  },
  description: "AutoPilot.com: criação, hospedagem e otimização contínua para acelerar o crescimento digital da sua empresa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${heading.variable} ${body.variable} bg-background text-foreground antialiased`}>
        <AppProviders>
          <div className="app-entry">{children}</div>
        </AppProviders>
      </body>
    </html>
  );
}

