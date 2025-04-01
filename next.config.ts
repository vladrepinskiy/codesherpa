import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    CHROMA_DB_URL: process.env.CHROMA_DB_URL,
    CHROMA_RESULTS_NUMBER: process.env.CHROMA_RESULTS_NUMBER,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  images: {
    domains: ["avatars.githubusercontent.com"],
  },
};

export default nextConfig;
