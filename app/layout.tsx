import type { Metadata } from "next";
import { Montserrat, Poppins } from "next/font/google";
import "./globals.css";
import "./theme.css";
import "./animations.css";
import "./cart.css";
import ScrollEffects from "@/components/ScrollEffects";

const serif = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "800"], variable: "--font-serif" });
const sans = Poppins({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "MELI - Wear MELI",
  description: "Soft days, well dressed. Easy dresses, tops, skirts and pants designed in Sri Lanka.",
  icons: {
    icon: "/assets/Logo.jpeg",
    shortcut: "/assets/Logo.jpeg",
    apple: "/assets/Logo.jpeg",
  },
  openGraph: {
    title: "MELI - Wear MELI",
    description: "Soft days, well dressed. Easy dresses, tops, skirts and pants designed in Sri Lanka.",
    images: [{ url: "/assets/Logo.jpeg", alt: "MELI logo" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/assets/Logo.jpeg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <ScrollEffects />
        {children}
      </body>
    </html>
  );
}
