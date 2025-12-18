/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true,
    },
    // Production optimizations
    poweredByHeader: false,
    compress: true,
    // Output standalone for better deployment
    output: 'standalone',
};

export default nextConfig;
