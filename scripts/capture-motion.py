import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright

async def main():
    out = Path('docs/verification')
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1440, 'height': 1000}, device_scale_factor=1)
        errors = []
        page.on('pageerror', lambda error: (errors.append(str(error)), print('PAGE ERROR:', str(error), flush=True)))
        page.on('console', lambda message: print('CONSOLE:', message.type, message.text, flush=True) if message.type == 'error' else None)
        await page.goto('http://127.0.0.1:5173', wait_until='networkidle')
        await page.wait_for_timeout(2100)
        await page.screenshot(path=str(out / 'motion-hero-desktop.png'))
        print('Hero:', await page.locator('.m-hero-title').bounding_box())
        print('Font:', await page.locator('.m-hero-title').evaluate('(el) => getComputedStyle(el).fontFamily'))
        for name, selector in [('work', '.ix-section-heading'), ('project', '.ix-exhibit'), ('about', '.ix-about-heading'), ('contact', '.m-contact')]:
            await page.locator(selector).first.evaluate('(el) => window.scrollTo({top: el.getBoundingClientRect().top + scrollY - 20, behavior: "instant"})')
            await page.wait_for_timeout(1300)
            await page.screenshot(path=str(out / f'motion-{name}-desktop.png'))
        await page.set_viewport_size({'width': 390, 'height': 844})
        await page.goto('http://127.0.0.1:5173', wait_until='networkidle')
        await page.wait_for_timeout(1800)
        await page.screenshot(path=str(out / 'motion-hero-mobile.png'))
        for name, selector in [('project', '.ix-exhibit'), ('about', '.ix-about-heading'), ('contact', '.m-contact')]:
            await page.locator(selector).first.evaluate('(el) => window.scrollTo({top: el.getBoundingClientRect().top + scrollY - 10, behavior: "instant"})')
            await page.wait_for_timeout(1100)
            await page.screenshot(path=str(out / f'motion-{name}-mobile.png'))
        print('Errors:', json.dumps(errors))
        print('Mobile width:', await page.evaluate('({ viewport: innerWidth, document: document.documentElement.scrollWidth })'))
        await browser.close()

asyncio.run(main())
