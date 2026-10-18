import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The parent WebApp folder has its own lockfile; pin the root to this project.
  outputFileTracingRoot: process.cwd(),
  turbopack: { root: process.cwd() },
  serverExternalPackages: ["sharp", "@prisma/client", "bcryptjs"],
  experimental: {
    serverActions: { bodySizeLimit: "30mb" },
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/trade-in", destination: "/services/trade-in", permanent: true },
      // The About page was removed; send old links to the home page.
      { source: "/about", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
