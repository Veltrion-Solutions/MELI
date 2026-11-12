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
  // Absolute base for social-share image URLs. Set NEXT_PUBLIC_SITE_URL to the live domain when deploying.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
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
    <html lang="en" className={`${serif.variable} ${sans.variable}`} data-scroll-behavior="smooth">
      <body>
        <ScrollEffects />
        {children}
      </body>
    </html>
  );
}
