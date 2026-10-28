"""Independent reviewer checks for Argon's mobile marker correction."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

checks = []
def check(name, value):
    assert value, name
    checks.append(name)
    print('PASS: ' + name, flush=True)

with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context(viewport={'width':390,'height':844}, has_touch=True, reduced_motion='reduce')
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto('http://127.0.0.1:4173/#/journey')
    stage = page.locator('.j-desk-canvas')
    expect(stage).to_have_attribute('data-scene-state', 'ready', timeout=60000)
    session = context.new_cdp_session(page)
    def reset():
        page.get_by_role('button', name='Whole desk', exact=True).click()
        expect(page.locator('.j-overview')).to_be_visible()
        page.locator('.j-desk-wrap').evaluate('(el)=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY-85,behavior:"instant"})')
        page.wait_for_timeout(180)
    def touch(kind, x=0, y=0):
        session.send('Input.dispatchTouchEvent', {'type':kind, 'touchPoints':[] if kind in ['touchEnd','touchCancel'] else [{'x':x,'y':y}]})
    def center(index):
        box=page.locator('.j-markers button').nth(index).bounding_box()
        return box['x']+box['width']/2,box['y']+box['height']/2
    for width in [390,320]:
        page.set_viewport_size({'width':width,'height':844})
        reset()
        check(f'{width}px marker hit targets are at least 44px', page.locator('.j-markers button').evaluate_all('els=>els.every(el=>{const r=el.getBoundingClientRect();return r.width>=43.99&&r.height>=43.99})'))
        for index in range(5):
            reset()
            x,y=center(index)
            touch('touchStart',x,y); touch('touchEnd')
            expect(page.locator('.j-chapters button').nth(index)).to_have_attribute('aria-pressed','true')
            check(f'{width}px actual touch selects marker {index+1}',page.url.endswith('/journey/'+str(index)))
    page.set_viewport_size({'width':390,'height':844})
    reset()
    x,y=center(0)
    touch('touchStart',x,y); touch('touchMove',x+65,y+2); touch('touchEnd')
    page.wait_for_timeout(200)
    check('Dragging from a marker does not accidentally select',page.url.endswith('/journey'))
    reset()
    x,y=center(1)
    touch('touchStart',x,y); touch('touchCancel')
    page.wait_for_timeout(200)
    check('Cancelled marker touch does not select',page.url.endswith('/journey'))
    reset()
    x,y=center(0)
    before=page.evaluate('scrollY')
    touch('touchStart',x,y); touch('touchMove',x+1,y-130); touch('touchEnd')
    page.wait_for_timeout(350)
    check('Vertical swipe starting on a marker scrolls the page',page.evaluate('scrollY')>before+30)
    check('Vertical swipe does not select a chapter',page.url.endswith('/journey'))
    for index in range(5):
        reset()
        page.locator('.j-markers button').nth(index).focus()
        page.keyboard.press('Enter')
        expect(page.locator('.j-chapters button').nth(index)).to_have_attribute('aria-pressed','true')
        check(f'Keyboard Enter selects marker {index+1}',page.url.endswith('/journey/'+str(index)))
    check('No uncaught browser errors',not errors)
    context.close();browser.close()

Path('docs/verification/journey-touch-review.json').write_text(json.dumps({'passed':len(checks),'checks':checks,'errors':errors},indent=2),encoding='utf-8')
print(f'{len(checks)} independent touch checks passed.')
