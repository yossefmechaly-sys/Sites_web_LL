import { chromium } from '@playwright/test'
const [, , url, w] = process.argv
const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: Number(w), height: 900 } })
await page.goto(url, { waitUntil: 'load' })
await page.waitForTimeout(2000)
console.log(JSON.stringify(await page.evaluate(() => {
  const W = document.documentElement.clientWidth
  return [...document.querySelectorAll('body *')].filter((e) => { const r = e.getBoundingClientRect(); return r.right > W + 1 || r.left < -1 }).slice(0, 8).map((e) => `${e.tagName}.${String(e.className).slice(0, 40)} L${Math.round(e.getBoundingClientRect().left)} R${Math.round(e.getBoundingClientRect().right)}`)
}), null, 1))
await browser.close()
