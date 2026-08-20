/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [60, 68, 72, 80],
    deviceSizes: [320, 375, 430, 640, 768, 1024, 1280, 1536],
    imageSizes: [64, 96, 128, 192, 256, 320, 480],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default nextConfig;
