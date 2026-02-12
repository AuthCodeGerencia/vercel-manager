import type { Metadata } from "next";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
  OrganizationSwitcher,
} from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
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
  title: "Vercel Manager",
  description: "Manage your Vercel projects and deployments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Header>
            <SignedOut>
              <SignInButton>
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </SignInButton>
              <SignUpButton>
                <Button size="sm">Sign up</Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <OrganizationSwitcher />
              <UserButton />
            </SignedIn>
          </Header>
          <main className="container mx-auto px-4 py-6">{children}</main>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
