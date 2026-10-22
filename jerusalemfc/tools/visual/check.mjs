// Vérifie : erreurs console, débordement horizontal, liens hreflang (outil local).
import { chromium } from '@playwright/test'
const browser = await chromium.launch({ channel: 'msedge' })
const PAGES = process.argv.slice(2).length ? process.argv.slice(2) : ['/he', '/fr']
for (const [url, w] of PAGES.flatMap((p) => [['http://localhost:' + (process.env.PORT_CHECK || '3107') + encodeURI(p), 390], ['http://localhost:' + (process.env.PORT_CHECK || '3107') + encodeURI(p), 1440]])) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } })
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 160)))
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message.slice(0, 160)))
  const res = await page.goto(url, { waitUntil: 'load' })
  await page.waitForTimeout(2500)
  const info = await page.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    lang: document.documentElement.lang,
    dir: document.documentElement.dir,
    hreflang: [...document.querySelectorAll('link[hreflang]')].map((l) => l.hreflang).join(','),
    current: document.querySelector('[aria-current=page]')?.textContent,
  }))
  console.log(url, w, res.status(), JSON.stringify(info), errors.length ? errors : 'aucune erreur')
  await page.close()
}
await browser.close()
