import "@/styles/globals.css";
import { AnimatePresence } from "framer-motion";

export default function MyApp({ Component, pageProps }) {
  return (
    <AnimatePresence mode="wait">
      <Component {...pageProps} />
    </AnimatePresence>
  );
}
