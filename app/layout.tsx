import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Harshith Daraboina | Full Stack Developer & AI Enthusiast",
  description: "Portfolio of Harshith Daraboina - A versatile Full Stack Developer specializing in React, Next.js, AI, and Mobile Development. Explore my innovative projects and technical journey.",
  keywords: ["Harshith Daraboina", "Full Stack Developer", "Portfolio", "Software Engineer", "React", "Next.js", "AI", "Mobile Development"],
  authors: [{ name: "Harshith Daraboina" }],
  openGraph: {
    title: "Harshith Daraboina | Full Stack Developer",
    description: "Building the future with Code & AI. Check out my portfolio!",
    url: "https://harshith-daraboina.vercel.app", // Assuming or placeholder
    siteName: "Harshith Daraboina Portfolio",
    images: [
      {
        url: "/images/hero.png", // Using the hero image we saw earlier
        width: 1200,
        height: 630,
        alt: "Harshith Daraboina Portfolio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
