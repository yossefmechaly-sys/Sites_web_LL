import Image, { type ImageProps } from 'next/image'
import React from 'react'

import type { Media } from '@/payload-types'

type Source = string | number | Media | null | undefined

// Image optimisée (AVIF/WebP, taille adaptée à l'écran, chargement différé) à partir d'une URL
// ou d'un document de la médiathèque, dont on reprend les dimensions réelles.
export function Img({
  src,
  width = 1200,
  height = 800,
  ...rest
}: Omit<ImageProps, 'src' | 'width' | 'height'> & { src: Source; width?: number; height?: number }) {
  if (!src || typeof src === 'number') return null
  const media = typeof src === 'string' ? { url: src, width, height } : src
  if (!media.url) return null
  return <Image src={media.url} width={media.width ?? width} height={media.height ?? height} {...rest} />
}

// Tailles servies par l'optimiseur de Next.js (imageSizes + deviceSizes par défaut)
const WIDTHS = [16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840]
const fit = (w: number) => WIDTHS.find((x) => x >= w) ?? 3840

// URL optimisée sans composant client : pour les petites images répétées (logos des listes),
// évite d'hydrater des centaines de composants <Image>. Les SVG sont servis tels quels.
export function optimizedSrc(src: string, width: number): string {
  if (src.endsWith('.svg')) return src
  return `/_next/image?url=${encodeURIComponent(src)}&w=${fit(width)}&q=75`
}

export function optimizedSrcSet(src: string, width: number): string | undefined {
  if (src.endsWith('.svg')) return undefined
  return `${optimizedSrc(src, width)} 1x, ${optimizedSrc(src, width * 2)} 2x`
}
