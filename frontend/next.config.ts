import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.tgdd.vn",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "owa.bestprice.vn",
      },
      {
        protocol: "https",
        hostname: "visitbadinh.com.vn",
      },
      {
        protocol: "https",
        hostname: "www.lalamove.com",
      }
    ],
  },
};

export default nextConfig;
