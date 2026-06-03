/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mock-data prototype: keep builds green even if lint config is absent.
  eslint: { ignoreDuringBuilds: true },
  // youtubei.js is a Node-only library — don't try to bundle it for the browser.
  serverExternalPackages: ["youtubei.js"],
};

export default nextConfig;
