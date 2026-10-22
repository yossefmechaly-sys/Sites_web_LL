import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  images: {
    // Images de la médiathèque Payload et du dossier public, servies en AVIF/WebP à la bonne taille
    localPatterns: [{ pathname: '/api/media/file/**' }, { pathname: '/images/**' }],
    formats: ['image/avif', 'image/webp'],
    // Les images changent rarement : cache long côté optimiseur (1 an)
    minimumCacheTTL: 31536000,
  },
  // Cache navigateur long pour les images statiques
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }],
      },
    ]
  },
  // Langue par défaut : hébreu
  async redirects() {
    return [{ source: '/', destination: '/he', permanent: false }]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
