// Captures pleine page pour comparer l'ancien site et la refonte (outil local, non versionné).
import { chromium } from '@playwright/test'
const [, , url, out, width = '1440'] = process.argv
const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: Number(width), height: 900 } })
await page.goto(url, { waitUntil: 'load', timeout: 120000 })
await page.waitForTimeout(4000)
// Déclenche le chargement paresseux des images
const h = await page.evaluate(() => document.documentElement.scrollHeight)
for (let y = 0; y < h; y += 600) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(150) }
await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(1500)
await page.screenshot({ path: out, fullPage: true })
console.log(out, h)
await browser.close()
