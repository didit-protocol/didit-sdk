/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  fallback: {
    "fs": false,
    "path": false,
    "os": false,
  }
};


module.exports = nextConfig;
