import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "C#/.NET Concepts Quiz",
  description: "Multiple-choice quiz covering core and advanced C#/.NET concepts.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
