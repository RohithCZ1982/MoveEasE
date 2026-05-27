/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg', 'bcryptjs'],
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }]
    return config
  },
}

module.exports = nextConfig
