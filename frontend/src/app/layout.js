// frontend/src/app/layout.js
import "./globals.css";

export const metadata = {
  title: "SentinelCut | Automatic profanity censoring for audio and video",
  description:
    "Upload audio or video and SentinelCut finds and beeps profanity in English, Hindi and Hinglish. Review every detection before you export.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body>{children}</body>
    </html>
  );
}