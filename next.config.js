const removeImports = require('next-remove-imports')({
  options: {},
})

module.exports = removeImports({
  reactStrictMode: true,
  swcMinify: true,
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      }
    }
    // Important: return the modified config
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'abs.twimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'overthought.ghost.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'imagedelivery.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  publicRuntimeConfig: {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_PRESET: process.env.CLOUDINARY_PRESET,
  },
  async redirects() {
    return [
      // {
      //   source: '/uses',
      //   destination: '/stack',
      //   permanent: true,
      // }
    ]
  },
  async rewrites() {
    return [
      // {
      //   source: "/bee.js",
      //   destination: "https://cdn.splitbee.io/sb.js",
      // },
      // {
      //   source: "/_hive/:slug",
      //   destination: "https://hive.splitbee.io/:slug",
      // },
    ]
  },
})
