import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // No rewrites needed: all API calls go through api-client.ts which uses
  // NEXT_PUBLIC_API_URL (absolute URL to the Fastify backend on port 3001).
  // Adding rewrites here would create a competing convention.
};

export default nextConfig;
