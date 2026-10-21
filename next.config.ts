import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "doj.kr", pathname: "/api/storage-assets/**", search: "" }],
  },
  outputFileTracingIncludes: { "/dojstory/sources/*": ["./docs/dojstory-data/*.md"] },
};

export default nextConfig;
