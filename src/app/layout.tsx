import type { Metadata } from "next";
import "./globals.css";
import DarkModeProvider from "@/components/DarkModeProvider";

export const metadata: Metadata = {
  title: "Auto Ping — Never Miss a Service | Smart Vehicle Care",
  description: "Track maintenance intervals, diagnose vehicle health, estimate service costs, and book verified service center slots.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <DarkModeProvider>
          {children}
        </DarkModeProvider>
      </body>
    </html>
  );
}
