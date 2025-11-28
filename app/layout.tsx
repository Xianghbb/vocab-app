import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import HeaderNav from '@/components/HeaderNav';
import "./globals.css";

export const metadata: Metadata = {
  title: "Vocab App",
  description: "A vocabulary learning application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <HeaderNav />
          <main className="pt-20 min-h-screen bg-gray-50">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}