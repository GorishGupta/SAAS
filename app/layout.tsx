import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { PropsWithChildren } from "react";
import Script from "next/script";

import { siteConfig } from "@/config";
import { CrispProvider } from "@/providers/crisp-provider";
import { ModalProvider } from "@/providers/modal-provider";
import { ToasterProvider } from "@/providers/toaster-provider";
import { TempoInit } from "./tempo-init";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = siteConfig;

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#6F5AF6",
        },
        layout: {
          logoPlacement: "none",
        },
      }}
    >
      <html lang="en">
        <CrispProvider />
        <body className={inter.className}>
          <Script src="https://api.tempo.new/proxy-asset?url=https://storage.googleapis.com/tempo-public-assets/error-handling.js" />
          <ModalProvider />
          <ToasterProvider />
          <TempoInit />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
