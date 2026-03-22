import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "The Tide's Gift — A Ritual for Letting Go",
  description:
    "Write your thoughts on shells, release them to the tide, and collect sea glass in your jar. A meditative ritual for letting go.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${rubik.variable} font-[var(--font-rubik)] antialiased`}>
        {children}
      </body>
    </html>
  );
}
