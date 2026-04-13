import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.msscdn.net" },
      { protocol: "https", hostname: "image.musinsa.com" },
      { protocol: "https", hostname: "static.msscdn.net" },
    ],
  },
};

export default nextConfig;
