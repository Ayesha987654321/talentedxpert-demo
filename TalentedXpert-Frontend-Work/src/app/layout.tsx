import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./globalicon.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./mainstyle.scss";
import MainLayout from "@/components/MainLayout";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Talented Xpert",
  description: "Generated by create next app",
  icons: {
    icon: "/icon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en">
      <body className={inter.className}>
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  );
}
