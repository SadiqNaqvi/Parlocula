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
