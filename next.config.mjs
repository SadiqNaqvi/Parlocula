/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  experimental: {
    esmExternals: "loose",
    serverComponentsExternalPackages: ["mongoose"],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  webpack: (config) => {
    // Ignore ALL webpack warnings produced by ./node_modules/keyv/src/index.js file
    config.ignoreWarnings = [{ module: /node_modules\/keyv\/src\/index\.js/ }];
    return config;
  },
};

export default nextConfig;
