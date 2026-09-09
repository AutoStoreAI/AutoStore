import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AutoStore — Tu compra, resuelta",
  description: "La forma más sencilla de no olvidar nunca lo esencial.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
