import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "../providers/provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ZenPay",
  description: "Simple wallet app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-w-screen min-h-screen bg-gray-100">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}