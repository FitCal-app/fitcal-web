/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
        return [
          {
            source: '/api/openfoodfacts/:path*',
            destination: 'https://world.openfoodfacts.org/api/:path*',
          },
        ];
    },
};


export default nextConfig;
