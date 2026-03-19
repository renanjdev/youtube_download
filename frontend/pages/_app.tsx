import type { AppProps } from "next/app";
import { Outfit, IBM_Plex_Mono } from "next/font/google";
import "../styles/globals.css";

const sans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${sans.variable} ${mono.variable}`}>
      <Component {...pageProps} />
    </div>
  );
}
