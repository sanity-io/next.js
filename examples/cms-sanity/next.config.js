/** @type {import('next').NextConfig} */
module.exports = {
  experimental: {
    logging: 'verbose',
  },
  images: {
    remotePatterns: [
      { hostname: 'cdn.sanity.io' },
      { hostname: 'source.unsplash.com' },
    ],
  },
}
