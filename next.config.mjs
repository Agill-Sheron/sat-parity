/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.coingecko.com',
      },
    ],
  },
};

export default nextConfig;
