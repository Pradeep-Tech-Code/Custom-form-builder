/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // devIndicators: {
  //   buildActivity: false,
  //   buildActivityPosition: 'bottom-right',
  // },
  devIndicators:false,
  
}

export default nextConfig
