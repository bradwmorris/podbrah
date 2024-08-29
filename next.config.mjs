/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/talk/api/:path*',
          destination: '/api/:path*',
        },
      ];
    },
  };
  
  export default nextConfig;