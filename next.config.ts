import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // 일부 Node.js 내장 모듈 참조 막기
    config.resolve.fallback = {
      fs: false,
    };
    return config;
  },
};

export default nextConfig;