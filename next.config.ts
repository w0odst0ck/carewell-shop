import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静态导出：配合 Cloudflare Pages，无需 Node 服务器
  output: "export",
  images: { unoptimized: true },
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  trailingSlash: true,
  // 注意：output:export 下不能用 cacheComponents / partialPrefetching（PPR 与导出互斥）
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
