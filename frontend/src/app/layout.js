import "./globals.css";

export const metadata = {
  title: "SentinelCut",
  description: "SentinelCut app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}