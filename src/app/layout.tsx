import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

// Premium modern fonts combinations
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TestFriz",
  description: "TestFriz je vrhunski frizerski salon gde tradicija sreće moderan stil. Rezervišite vaš termin brzo i jednostavno.",
  openGraph: {
    title: "TestFriz",
    description: "Vrhunsko muško šišanje i stilizovanje brade. Zakažite termin online jednim klikom.",
    type: "website",
    locale: "sr_RS",
    siteName: "TestFriz Salon",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="sr" suppressHydrationWarning>
        <body className={`${inter.variable} ${outfit.variable} font-sans antialiased min-h-screen flex flex-col`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
