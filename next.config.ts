import type { NextConfig } from "next";

const nextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/assets/stats.js",
        destination: "https://cloud.umami.is/script.js",
      },
      {
        source: "/api/stats-send",
        destination: "https://cloud.umami.is/api/send",
      },
    ];
  },
};

export default nextConfig; 