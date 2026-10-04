/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next 14: external packages for server components (not `serverExternalPackages`).
  experimental: {
    serverComponentsExternalPackages: ["pg", "unpdf"],
  },
};

module.exports = nextConfig;
