import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "menu.orcatech.pro" },
      { protocol: "https", hostname: "**" },
    ],
  },
}

export default nextConfig
