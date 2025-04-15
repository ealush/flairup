import type { Metadata } from "next";
import "./styles.css";
import { stylesheet } from "./stylesheet";


export const metadata: Metadata = {
  title: "FlairUp 🎩",
  description: "CSS in JS Library for Shareable Components",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <style>{stylesheet.getStyle()}</style>
        {children}
      </body>
    </html>
  );
}
