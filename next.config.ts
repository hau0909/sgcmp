import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cacheComponents: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yrptpasveuvtmnwtgilr.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/guard-avatars/**",
      },
    ],
  },
};

export default nextConfig;
