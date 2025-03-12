"use client";
import Link from "next/link";

export default function DemoPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-neutral-900 p-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">
        Watch Demo
      </h1>

      {/* Video Embed */}
      <div className="w-full max-w-3xl rounded-lg shadow-lg overflow-hidden">
        <iframe
          className="w-full aspect-video"
          src="https://www.youtube.com/embed/vsyrB13PYB4"
          title="Demo Video"
          allowFullScreen
        />
      </div>

      {/* Back to Home Button */}
      <div className="mt-6">
        <Link href="/">
          <span className="px-6 py-3 text-lg font-semibold bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition">
            Back to Home
          </span>
        </Link>
      </div>
    </div>
  );
}
