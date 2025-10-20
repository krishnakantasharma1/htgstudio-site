import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
      ignoreDuringBuilds: true, // ✅ Skip ESLint during build
  },
    typescript: {
        ignoreBuildErrors: true, // ✅ Skip type checking
    },
      experimental: {
          turbo: {
                rules: {}, // ✅ Turbopack-compatible
          },
      },
};

export default nextConfig;
