import type { Metadata } from "next";
import "../src/index.css";
import "./preview.css";

export const metadata: Metadata = {
  title: "Lesson Preview",
  description: "Static lesson previews generated from board JSON files.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
