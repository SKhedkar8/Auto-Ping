import type { Metadata, Viewport } from "next";
import "./globals.css";
import DarkModeProvider from "@/components/DarkModeProvider";
import PwaRegister from "@/components/PwaRegister";
import AutomotiveStartupIntro from "@/components/AutomotiveStartupIntro";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563EB" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};

export const metadata: Metadata = {
  title: "Auto Ping — Never Miss a Service | Smart Vehicle Care",
  description: "Track maintenance intervals, diagnose vehicle health, estimate service costs, and book verified service center slots.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AutoPing",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  if (!sessionStorage.getItem('autoping_intro_played')) {
                    document.documentElement.classList.add('autoping-intro-active');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased" suppressHydrationWarning>
        <DarkModeProvider>
          <AutomotiveStartupIntro />
          {children}
          <PwaRegister />
        </DarkModeProvider>
      </body>
    </html>
  );
}
