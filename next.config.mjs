const nextConfig = {
    images: {
      formats: ["image/webp"], // Optimized image format
      domains: ["cdn-icons-png.flaticon.com"], // Add external image domains if needed
    },
    compress: true, // Enable Gzip compression
    experimental: {
      optimizeCss: true, // Optimize Tailwind CSS
    },
    reactStrictMode: true, // Helps in debugging  // Minify JS for performance
    output: "standalone", // Optimized for deployment
  };
  
  export default nextConfig;
  