/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // deviceSizes: [300, 375, 480, 640, 768, 1024, 1536],
    // imageSizes: [],
  },
  serverExternalPackages: ["mongoose"],
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // experimental: {
  //   globalNotFound: true,
  // },
  // turbopack: (config) => {
  //   // Ignore ALL turbopack warnings produced by ./node_modules/keyv/src/index.js file
  //   config.ignoreWarnings = [{ module: /node_modules\/keyv\/src\/index\.js/ }];
  //   return config;
  // },
};

export default nextConfig;
