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
    deviceSizes: [300, 375, 480, 640, 768, 1024, 1536],
    imageSizes: [],
  },
  serverExternalPackages: ["mongoose"],
  logging: {
    fetches: {
      fullUrl: true,
    },
    async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ]
  }
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
