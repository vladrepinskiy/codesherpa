import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["avatars.githubusercontent.com"],
  },
  telemetry: {
    disabled: true,
  },
};

export default nextConfig;
