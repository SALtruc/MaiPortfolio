"""Capture public inspiration pages in an isolated browser for visual review."""
import asyncio
import json
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1] / 'docs' / 'reference-research'
ROOT.mkdir(parents=True, exist_ok=True)
SITES = {
    'scrolltide': 'https://www.scrolltide.co/components',
    'threeui': 'https://threeui.com/browse?sort=recent',
    'inspora': 'https://www.inspora.design/',
    'landbook': 'https://land-book.com/',
    'details': 'https://www.details.so/inspo/category/carousel',
    'sceneai': 'https://sceneai.art/',
    'createwithswift': 'https://www.createwithswift.com/',
    'kitbitz': 'https://kitbitz.art/',
}

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        limit = asyncio.Semaphore(2)
        async def capture(name, url):
            async with limit:
                page = await browser.new_page(viewport={'width': 1440, 'height': 1000}, device_scale_factor=1)
                result = {'name': name, 'requested_url': url}
                try:
                    response = await page.goto(url, wait_until='domcontentloaded', timeout=40000)
                    await page.wait_for_timeout(4000)
                    result.update(status=response.status if response else None, url=page.url, title=await page.title())
                    result['text'] = (await page.locator('body').inner_text())[:22000]
                    result['links'] = await page.locator('a[href]').evaluate_all('(els) => els.map(e => ({text: e.innerText.trim().slice(0,100), href: e.href})).filter(e => e.text).slice(0,150)')
                    await page.screenshot(path=str(ROOT / f'{name}-top.png'), timeout=20000)
                    await page.mouse.wheel(0, 800)
                    await page.wait_for_timeout(1800)
                    await page.screenshot(path=str(ROOT / f'{name}-content.png'), timeout=20000)
                    print(f'{name}: {result["status"]} {result["title"]}', flush=True)
                except Exception as error:
                    result['error'] = str(error)[:1000]
                    print(f'{name}: {result["error"]}', flush=True)
                    try:
                        await page.screenshot(path=str(ROOT / f'{name}-error.png'), timeout=5000)
                    except Exception:
                        pass
                (ROOT / f'{name}.json').write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding='utf-8')
                await page.close()
                return result
        results = await asyncio.gather(*(capture(name, url) for name, url in SITES.items()))
        (ROOT / 'index.json').write_text(json.dumps([{k: v for k, v in r.items() if k not in ('text','links')} for r in results], indent=2), encoding='utf-8')
        await browser.close()

asyncio.run(main())
