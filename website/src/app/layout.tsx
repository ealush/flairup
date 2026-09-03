import type { Metadata } from "next";
import "./styles.css";
import { stylesheet } from "./stylesheet";

export const metadata: Metadata = {
  title: "FlairUp — CSS-in-JS for packages that ship styles",
  description:
    "FlairUp is a lightweight CSS-in-JS library for UI package authors: zero-config style shipping, bundler-agnostic output, scoped atomic classes, and built-in SSR support.",
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
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
