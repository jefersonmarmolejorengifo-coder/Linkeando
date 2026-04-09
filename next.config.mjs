/** @type {import('next').NextConfig} */
const nextConfig = {
  // Evita que Leaflet intente usar APIs de browser en el servidor
  webpack: (config) => {
    config.resolve.fallback = { fs: false }
    return config
  },

  // Permite imágenes de Supabase Storage y avatares externos
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'urzjwljfrpemxclfitls.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}

export default nextConfig
