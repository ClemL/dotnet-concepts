import type { NextConfig } from "next";

// Every page is statically generated at build time; no runtime data fetching,
// so Cache Components / Partial Prefetching are intentionally left off.
const nextConfig: NextConfig = {
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
