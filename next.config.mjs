/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatar.iran.liara.run',
        // Optional: Restrict paths/ports if needed
        // pathname: '/public/**',
        // port: '',
      },
      {
        protocol: 'https',
        hostname: 'icetray.s3.us-east-1.amazonaws.com'
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com'
      }
    ],
  },
};

export default nextConfig;