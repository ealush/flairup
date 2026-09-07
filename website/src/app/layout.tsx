import type { Metadata } from "next";
import { Fira_Code, Source_Serif_4 } from "next/font/google";
import "./styles.css";
import { stylesheet } from "./stylesheet";

// Self-hosted via next/font: the font files ship with the static export,
// so first paint never waits on fonts.googleapis.com / fonts.gstatic.com.
const display = Source_Serif_4({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

const code = Fira_Code({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-code",
  display: "swap",
});

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
    <html lang="en" className={`${display.variable} ${code.variable}`}>
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
