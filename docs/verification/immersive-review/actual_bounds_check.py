"""Verify the real desk geometry fit rather than a synthetic QA envelope."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

OUT = Path('docs/verification/immersive-review')
checks = []
measurements = []

def check(name, value):
    checks.append({'name': name, 'passed': bool(value)})
    print(('PASS: ' if value else 'FAIL: ') + name, flush=True)

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width':1280,'height':720}, reduced_motion='reduce')
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto('http://127.0.0.1:4174/#/about')
    stage = page.locator('.j-desk-canvas')
    expect(stage).to_have_attribute('data-scene-state', 'ready', timeout=60000)
    expect(stage).to_have_attribute('data-bounds-source', 'all-mesh-geometry-boxes', timeout=60000)

    for width, height in [(1280,720),(1440,900),(1920,1080)]:
        page.set_viewport_size({'width':width,'height':height})
        for chapter in [-1,0,1,2,3,4]:
            page.locator('.j-reset').click()
            if chapter >= 0:
                page.locator('.j-chapters button').nth(chapter).click()
            expect(stage).to_have_attribute('data-selected-chapter', str(chapter))
            page.wait_for_timeout(60)
            data = stage.evaluate('e=>({data:{...e.dataset},width:e.clientWidth,height:e.clientHeight})')
            table = [int(x) for x in data['data']['tableBounds'].split(',')]
            measurements.append({'viewport':[width,height], 'chapter':chapter, 'table_width':table[2]-table[0], 'table_occupancy':round((table[2]-table[0])/data['width'],3), **data})
            check(f'{width}x{height}, chapter {chapter}: all current mesh geometry is inside stage', data['data']['wholeDeskVisible']=='true')
            check(f'{width}x{height}, chapter {chapter}: every mesh is checked independently of the 35-point fit hull', int(data['data']['boundsMeshCount'])>=230 and int(data['data']['fitPointCount'])<50)
            if width == 1280 and chapter == 0:
                check('1280x720 desk table is at least 30% wider than the previous 379px fit', table[2]-table[0] >= 379*1.3)
                page.screenshot(path=str(OUT/'actual-bounds-1280x720.png'))
            if width == 1440 and chapter == 0:
                page.screenshot(path=str(OUT/'actual-bounds-1440x900.png'))
            if width == 1920 and chapter == 0:
                page.screenshot(path=str(OUT/'actual-bounds-1920x1080.png'))

            # Turn to both limits while retaining this chapter's lifted geometry.
            for direction, angle in [('left', '-0.650'), ('right', '0.650')]:
                button = page.get_by_role('button', name='Rotate desk '+direction, exact=True)
                for _ in range(10): button.click()
                expect(stage).to_have_attribute('data-view-angle', angle)
                check(f'{width}x{height}, chapter {chapter}, {direction} limit: actual props fit', stage.get_attribute('data-whole-desk-visible')=='true')

    page.locator('.j-reset').click()
    page.get_by_role('button',name='Zoom in',exact=True).click()
    expect(stage).to_have_attribute('data-zoom','1.100')
    page.locator('.j-reset').click()
    expect(stage).to_have_attribute('data-zoom','1.000')
    check('Whole desk restores full framing after manual zoom', stage.get_attribute('data-whole-desk-visible')=='true')

    # Real touch dispatch retains marker hit targets and ordinary vertical pan.
    context = browser.new_context(viewport={'width':390,'height':844},has_touch=True,reduced_motion='reduce')
    touch_page = context.new_page()
    touch_page.on('pageerror', lambda e: errors.append(str(e)))
    touch_page.goto('http://127.0.0.1:4174/#/journey')
    touch_stage = touch_page.locator('.j-desk-canvas')
    expect(touch_stage).to_have_attribute('data-scene-state','ready',timeout=60000)
    session = context.new_cdp_session(touch_page)
    def touch(kind,x=0,y=0):
        session.send('Input.dispatchTouchEvent',{'type':kind,'touchPoints':[] if kind in ['touchEnd','touchCancel'] else [{'x':x,'y':y}]})
    for width in [320,390]:
        touch_page.set_viewport_size({'width':width,'height':844})
        for chapter in range(5):
            touch_page.locator('.j-reset').click()
            touch_stage.scroll_into_view_if_needed()
            touch_page.wait_for_timeout(100)
            marker=touch_page.locator('.j-markers button').nth(chapter)
            box=marker.bounding_box()
            x,y=box['x']+box['width']/2,box['y']+box['height']/2
            touch('touchStart',x,y);touch('touchEnd')
            expect(touch_page.locator('.j-chapters button').nth(chapter)).to_have_attribute('aria-pressed','true')
            check(f'{width}px actual touch selects chapter {chapter} and retains whole desk', touch_stage.get_attribute('data-whole-desk-visible')=='true')
        touch_page.locator('.j-reset').click()
        touch_stage.scroll_into_view_if_needed()
        touch_page.wait_for_timeout(100)
        box=touch_stage.bounding_box()
        before=touch_page.evaluate('scrollY')
        x,y=box['x']+box['width']*.18,box['y']+box['height']*.7
        touch('touchStart',x,y);touch('touchMove',x,y-130);touch('touchEnd')
        touch_page.wait_for_timeout(300)
        check(f'{width}px vertical canvas swipe scrolls the page without selecting a chapter', touch_page.evaluate('scrollY')>before+30 and touch_page.url.endswith('/journey'))
    check('No uncaught browser errors', not errors)
    browser.close()

result={'passed':sum(c['passed'] for c in checks),'total':len(checks),'checks':checks,'measurements':measurements,'errors':errors}
(OUT/'actual-bounds-results.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(f"{result['passed']}/{result['total']} checks passed.",flush=True)
raise SystemExit(0 if result['passed']==result['total'] else 1)
