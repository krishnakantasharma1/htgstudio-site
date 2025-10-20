import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
      ignoreDuringBuilds: true,
  },
    typescript: {
        ignoreBuildErrors: true,
    },
      experimental: {
          turbo: {
                rules: {},
          },
      },
        async redirects() {
            return [
                  {
                          source: "/",       // when someone visits root
                                  destination: "/courses", // send them to your courses page
                                          permanent: true,   // 301 redirect (SEO-friendly)
                  },
            ];
        },
};

export default nextConfig;
