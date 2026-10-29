"""Review the exact About framing and photo-centering changes requested by the user."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE='http://127.0.0.1:4174'
OUT=Path('docs/verification/immersive-review')
OUT.mkdir(parents=True,exist_ok=True)
checks=[]
def check(name,value):
    checks.append({'name':name,'passed':bool(value)})
    print(('PASS: ' if value else 'FAIL: ')+name,flush=True)

with sync_playwright() as p:
    browser=p.chromium.launch()
    page=browser.new_page(viewport={'width':1440,'height':900},reduced_motion='reduce')
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    for width,height in [(1280,720),(1440,900),(1920,1080)]:
        page.set_viewport_size({'width':width,'height':height})
        page.goto(BASE+'/#/about')
        expect(page.locator('.j-desk-canvas')).to_have_attribute('data-scene-state','ready',timeout=60000)
        page.evaluate('document.fonts.ready')
        page.wait_for_timeout(250)
        check(f'{width}x{height}: removed the requested instruction and local navigation',page.locator('.about-local-nav').count()==0 and 'Pick an object on my desk to explore the five chapters so far' not in page.locator('.j-page').inner_text())
        for index in [-1,0,1,2,3,4]:
            if index<0:page.locator('.j-reset').evaluate('el=>el.click()')
            else:
                page.locator('.j-chapters button').nth(index).evaluate('el=>el.click()')
                expect(page.locator('.j-chapters button').nth(index)).to_have_attribute('aria-pressed','true')
            page.wait_for_timeout(120)
            bounds=page.locator('.j-workspace').bounding_box()
            check(f'{width}x{height}: chapter {index} workspace fits the opening screen',bounds['y']>=page.locator('.site-header').bounding_box()['height']-2 and bounds['y']+bounds['height']<=height+2)
            check(f'{width}x{height}: chapter {index} has visible scene and story',page.locator('.j-desk-canvas').is_visible() and page.locator('.j-story').is_visible())
            if width==1440:page.screenshot(path=str(OUT/f'about-chapter-{index}.png'))
        check(f'{width}px About has no horizontal overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
    for width in [1280,1440,1920]:
        page.set_viewport_size({'width':width,'height':1000})
        page.goto(BASE+'/#/')
        page.locator('.ix-photo-stage').scroll_into_view_if_needed()
        for index in range(4):
            page.locator('.ix-moment-tabs button').nth(index).click()
            page.wait_for_timeout(650)
            result=page.locator('.ix-photo-stage').evaluate('el=>{const stage=el.getBoundingClientRect();const boxes=[...el.querySelectorAll(".ix-photo-slot")].map(x=>x.getBoundingClientRect());return {count:boxes.length,center:(Math.min(...boxes.map(r=>r.left))+Math.max(...boxes.map(r=>r.right)))/2,expected:stage.left+stage.width/2,left:Math.min(...boxes.map(r=>r.left)),right:Math.max(...boxes.map(r=>r.right))}}')
            check(f'{width}px all four photo frames are centered for selection {index}',result['count']==4 and abs(result['center']-result['expected'])<=25 and result['left']>=0 and result['right']<=width)
        if width==1440:page.screenshot(path=str(OUT/'centered-four-photos.png'))
    for width in [320,390,768]:
        page.set_viewport_size({'width':width,'height':844})
        page.goto(BASE+'/#/journey/0')
        expect(page.locator('.j-desk-canvas')).to_have_attribute('data-scene-state','ready',timeout=60000)
        check(f'{width}px mobile About preserves the selected story and full usable canvas',page.locator('.j-company').inner_text()=='Student Council' and page.locator('.j-desk-canvas').bounding_box()['width']>=min(width-40,500))
        check(f'{width}px mobile About does not overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
    check('No uncaught browser errors',not errors)
    browser.close()

result={'passed':sum(c['passed'] for c in checks),'total':len(checks),'checks':checks,'errors':errors}
(OUT/'layout-results.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(f"{result['passed']}/{result['total']} checks passed.")
raise SystemExit(0 if result['passed']==result['total'] else 1)
