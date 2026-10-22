// Capture d'écran d'une zone précise (défilement jusqu'à un sélecteur), outil local.
import { chromium } from '@playwright/test'
const [, , url, selector, out, width = '1440', height = '900'] = process.argv
const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: Number(width), height: Number(height) } })
await page.goto(url, { waitUntil: 'load', timeout: 120000 })
await page.waitForTimeout(2000)
if (selector !== '-') await page.evaluate((s) => { const e = document.querySelector(s); window.scrollTo({ top: e.getBoundingClientRect().top + scrollY - 200, behavior: 'instant' }) }, selector)
await page.waitForTimeout(1500)
await page.screenshot({ path: out })
await browser.close()
console.log(out)
