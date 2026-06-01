import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { TrpcProvider } from "@/lib/trpc-provider";

export const metadata: Metadata = {
  title: "ISO 27001 Audit Platform",
  description: "Мэдээллийн аюулгүй байдлын аудитын платформ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body>
        <TrpcProvider>
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </TrpcProvider>
      </body>
    </html>
  );
}
