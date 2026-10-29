import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Absensi Tukang Digital - SMKS Muhammadiyah 2 Genteng",
  description: "Sistem Absensi Kehadiran Tukang Berbasis Face Recognition SMKS Muhammadiyah 2 Genteng",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Absen Tukang",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0A4D68",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen flex flex-col bg-slate-100 text-slate-900 pb-16 lg:pb-0">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">{children}</main>
        <footer className="bg-slate-900 text-slate-400 text-xs py-4 text-center border-t border-slate-800 hidden lg:block">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>© 2026 SMKS Muhammadiyah 2 Genteng. Hak cipta dilindungi.</span>
            <span className="text-[11px] text-muh-teal font-mono">
              Biometric Attendance System • Asia/Jakarta (WIB)
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
