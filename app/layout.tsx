import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
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
          <header className="p-4 bg-blue-600 text-white">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-2xl font-bold">Vocab App</h1>
              <div>
                <SignedOut>
                  <SignInButton className="mr-4 px-4 py-2 bg-white text-blue-600 rounded hover:bg-gray-100" />
                  <SignUpButton className="px-4 py-2 bg-transparent border border-white rounded hover:bg-blue-700" />
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            </div>
          </header>
          <main className="container mx-auto p-4">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}