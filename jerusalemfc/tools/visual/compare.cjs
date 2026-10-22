// Assemble l'original (gauche) et la refonte (droite) par tranches de même hauteur.
const sharp = require('sharp')
const [, , a, b, prefix, step = '1000'] = process.argv
;(async () => {
  const S = Number(step), W = 1440, scale = 0.5
  const ma = await sharp(a).metadata(), mb = await sharp(b).metadata()
  const H = Math.max(ma.height, mb.height)
  for (let y = 0, i = 0; y < H; y += S, i++) {
    const part = async (f, m) => {
      const h = Math.min(S, m.height - y)
      if (h <= 0) return sharp({ create: { width: W, height: S, channels: 3, background: '#ccc' } }).png().toBuffer()
      return sharp(f).extract({ left: 0, top: y, width: Math.min(W, m.width), height: h })
        .resize(W, h).extend({ bottom: S - h, background: '#ccc' }).png().toBuffer()
    }
    const [pa, pb] = await Promise.all([part(a, ma), part(b, mb)])
    const full = await sharp({ create: { width: W * 2 + 20, height: S, channels: 3, background: "#f00" } })
      .composite([{ input: pa, left: 0, top: 0 }, { input: pb, left: W + 20, top: 0 }]).png().toBuffer()
    await sharp(full)
      .resize(Math.round((W * 2 + 20) * scale)).jpeg({ quality: 70 }).toFile(`${prefix}-${String(i).padStart(2, '0')}.jpg`)
  }
  console.log('ok')
})()
