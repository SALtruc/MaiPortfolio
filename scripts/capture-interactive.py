import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

async def main():
    out = Path('docs/verification')
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={'width': 1440, 'height': 1000}, record_video_dir=str(out / 'interactive-video'), record_video_size={'width': 1280, 'height': 890})
        page = await context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        await page.goto('http://127.0.0.1:4173', wait_until='networkidle')
        await page.wait_for_timeout(1800)
        async def capture(name, selector):
            await page.locator(selector).evaluate('(el) => window.scrollTo({top:el.getBoundingClientRect().top+scrollY-30,behavior:"instant"})')
            await page.wait_for_timeout(900)
            await page.screenshot(path=str(out / name))
        await capture('interactive-work-desktop.png', '.ix-work')
        await page.get_by_role('button', name='Michelin', exact=True).click()
        await page.wait_for_timeout(800)
        await page.get_by_role('button', name='Career Checkpoint', exact=True).click()
        await page.wait_for_timeout(800)
        await capture('interactive-about-desktop.png', '.ix-about-heading')
        await page.get_by_role('button', name='People', exact=True).click()
        await page.wait_for_timeout(800)
        await page.screenshot(path=str(out / 'interactive-about-people.png'))
        stage = await page.locator('.ix-photo-stage').bounding_box()
        await page.mouse.move(stage['x'] + stage['width']*.55, stage['y']+200)
        await page.mouse.down()
        await page.mouse.move(stage['x']+stage['width']*.55-170,stage['y']+205,steps=14)
        await page.mouse.up()
        await page.wait_for_timeout(800)
        print('After drag:', await page.locator('.ix-moment-tabs [aria-pressed=true]').inner_text())
        await page.screenshot(path=str(out / 'interactive-about-dragged.png'))
        await page.set_viewport_size({'width': 390, 'height': 844})
        await page.goto('http://127.0.0.1:4173', wait_until='networkidle')
        await capture('interactive-work-mobile.png', '.ix-section-heading')
        await capture('interactive-about-mobile.png', '.ix-about-heading')
        stage = await page.locator('.ix-photo-stage').bounding_box()
        session = await context.new_cdp_session(page)
        x, y = stage['x'] + stage['width'] * .7, stage['y'] + 150
        await session.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x, 'y': y}]})
        await session.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x - 120, 'y': y + 2}]})
        await session.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
        await page.wait_for_timeout(900)
        print('After touch:', await page.locator('.ix-moment-tabs [aria-pressed=true]').inner_text())
        await page.screenshot(path=str(out / 'interactive-about-mobile-swiped.png'))
        print('Overflow:', await page.evaluate('document.documentElement.scrollWidth > innerWidth'))
        print('Errors:', errors)
        video = page.video
        await context.close()
        await video.save_as(str(out / 'interactive-demo.webm'))
        await browser.close()

asyncio.run(main())
