// `next-remove-imports` strips the global CSS/scss imports that `@uiw/react-md-editor`
// and the `@editorjs/*` plugins pull in from within node_modules (Next forbids global
// CSS imports from node_modules). Those styles are instead imported globally in _app.tsx.
// It injects a client-only webpack rule and delegates to the `webpack` fn below, so it
// requires the `--webpack` build flag (it is a no-op under Turbopack).
const removeImports = require('next-remove-imports')()

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
  // `publicRuntimeConfig`/`next/config` were removed in Next 16. The `env`
  // key inlines these values into the client bundle at build time, preserving
  // the existing (non-`NEXT_PUBLIC_`) env var names used in deployment.
  env: {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_PRESET: process.env.CLOUDINARY_PRESET,
  },
}

module.exports = removeImports(nextConfig)
