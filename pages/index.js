import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import Layout from "@/components/Layout"; // Importing animation layout

export default function Home() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900">
        
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Image src="/logo.webp" alt="Logo" width={150} height={150} priority />
        </motion.div>

        {/* Heading */}
        <h1 className="text-4xl font-bold mt-6">Welcome to My App 🚀</h1>
        <p className="text-lg text-gray-600 mt-2">
          Explore AI-powered content generation
        </p>

        {/* Animated Button */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="mt-6"
        >
          <Link href="/dashboard">
            <a className="px-6 py-3 text-lg bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition">
              Get Started
            </a>
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
}
