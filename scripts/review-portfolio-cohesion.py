"""Independent end-to-end review of portfolio information architecture."""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE = os.environ.get('PORTFOLIO_URL', 'http://127.0.0.1:4173')
OUT = Path('docs/verification/cohesion-review')
OUT.mkdir(parents=True, exist_ok=True)
checks, errors = [], []

def check(name, ok):
    checks.append({'name':name,'passed':bool(ok)})
    print(('PASS: ' if ok else 'FAIL: ') + name, flush=True)

with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context(viewport={'width':1440,'height':1000}, reduced_motion='reduce', permissions=['clipboard-read','clipboard-write'])
    page = context.new_page()
    page.on('pageerror', lambda e: errors.append(str(e)))
    def goto(route):
        page.goto(BASE+'/#/'+route)
        page.locator('main').wait_for()
        page.wait_for_timeout(250)
        if route.split('/')[0] in ['about','journey','notes']:
            page.locator('.j-desk-wrap').wait_for(timeout=30000)
    def active():
        return page.locator('nav[aria-label="Main navigation"] a[aria-current=page]').all_text_contents()
    goto('')
    check('Global navigation has one stable set of four destinations',page.locator('nav[aria-label="Main navigation"] a').all_text_contents()==['Home','Projects','About Mai','Contact'])
    check('Home is marked active',active()==['Home'])
    check('Competing floating navigation controls are removed',page.locator('.navigation-peek,.hide-navigation').count()==0)
    check('Home preserves real Mai portrait',page.locator('.m-portrait-photo img').get_attribute('src')=='/assets/mai-portrait.webp')
    project_ids=page.locator('main a[href^="#/work/"]').evaluate_all('els=>[...new Set(els.map(el=>el.hash.split("/")[2]))]')
    check('Home has only three curated project previews',len(project_ids)==3)
    check('Home preview does not repeat all five project stories',page.locator('.ix-project-detail').count()==3)
    check('Home has explicit paths to Projects and About',page.locator('main a[href="#/work"]').count()>0 and page.locator('main a[href="#/about"]').count()>0)

    for route in ['about','journey','journey/0','journey/4','notes']:
        goto(route)
        check(f'{route} belongs to About Mai',active()==['About Mai'])
        check(f'{route} integrates the desk and personal background',page.locator('.j-desk-wrap').count()==1 and page.locator('#about-background').count()==1)
        if route.endswith('/0') or route.endswith('/4'):
            index=int(route[-1])
            expect(page.locator('.j-chapters button').nth(index)).to_have_attribute('aria-pressed','true')
            check(f'{route} opens exact legacy chapter',True)

    goto('work')
    check('Projects is marked active',active()==['Projects'])
    check('Projects owns all five case studies',page.locator('.reel-story').count()==5)
    page.evaluate('window.scrollTo({top:700,behavior:"instant"})')
    page.wait_for_timeout(200)
    saved=page.evaluate('scrollY')
    page.locator('main a[href="#/work/michelin"]').first.evaluate('el=>el.click()')
    expect(page.locator('.visual-case')).to_be_visible()
    page.wait_for_timeout(200)
    check('New project navigation starts at top',page.evaluate('scrollY')<10)
    page.go_back();page.wait_for_timeout(700)
    check('Browser Back restores collection reading position',abs(page.evaluate('scrollY')-saved)<30)

    for project,chapter in [('council',0),('ctm',1),('checkpoint',2),('careers-fair',2),('michelin',3)]:
        goto('work/'+project)
        check(f'{project} has one canonical case with Projects active',page.locator('.visual-case').count()==1 and active()==['Projects'])
        check(f'{project} has a collection return link',page.locator('main a[href="#/work"]').count()>0)
        backlink=page.locator(f'main a[href="#/journey/{chapter}"],main a[href="#/about/{chapter}"]')
        check(f'{project} links to the correct personal journey chapter',backlink.count()>0)
        check(f'{project} has no competing project overlay',page.locator('#project-index').count()==0)

    goto('journey/2')
    expect(page.locator('.j-desk-canvas')).to_have_attribute('data-scene-state','ready',timeout=60000)
    check('Careers chapter connects both actual projects',page.locator('.j-page a[href="#/work/checkpoint"]').count()>0 and page.locator('.j-page a[href="#/work/careers-fair"]').count()>0)
    page.locator('.j-desk-wrap').evaluate('el=>window.scrollTo({top:el.getBoundingClientRect().top+scrollY-100,behavior:"instant"})')
    original_scroll=page.evaluate('scrollY')
    page.locator('.j-chapters button').nth(3).evaluate('el=>el.click()')
    expect(page.locator('.j-chapters button').nth(3)).to_have_attribute('aria-pressed','true')
    check('In-place chapter selection preserves desktop context',abs(page.evaluate('scrollY')-original_scroll)<10)
    page.go_back();page.wait_for_timeout(500)
    check('Back restores the previously selected chapter',page.locator('.j-chapters button').nth(2).get_attribute('aria-pressed')=='true')

    for route in ['work/not-a-project','journey/7','journey/abc','not-a-page']:
        goto(route)
        check(f'{route} gives a recoverable invalid route state',page.locator('main h1').count()==1 and page.locator('main a[href="#/work"],main a[href="#/about"],main a[href="#/"]').count()>0 and page.locator('.visual-case:not(.invalid-project-page)').count()==0 and page.locator('.j-chapters button[aria-pressed=true]').count()==0)
    goto('contact')
    check('Contact has correct active navigation',active()==['Contact'])
    for label,selector in [('email','a[href^="mailto:"]'),('LinkedIn','a[href*="linkedin.com"]'),('CV','a[href$=".pdf"]')]:
        check(f'Contact exposes {label} without flipping a card',page.locator('main '+selector).evaluate_all('els=>els.some(el=>!el.closest("[inert]")&&el.getBoundingClientRect().width>0)'))

    page.set_viewport_size({'width':390,'height':844})
    goto('')
    toggle=page.get_by_role('button',name='Open navigation',exact=True)
    toggle.click()
    expect(page.get_by_role('button',name='Close navigation',exact=True)).to_have_attribute('aria-expanded','true')
    page.keyboard.press('Escape')
    check('Mobile menu closes with Escape',page.get_by_role('button',name='Open navigation',exact=True).get_attribute('aria-expanded')=='false')
    check('Escape returns focus to mobile menu trigger',page.get_by_role('button',name='Open navigation',exact=True).evaluate('el=>el===document.activeElement'))
    toggle.click()
    page.locator('nav[aria-label="Main navigation"] a[href="#/work"]').click()
    expect(page.locator('nav[aria-label="Main navigation"] a[aria-current=page]')).to_have_text('Projects')
    check('Mobile navigation reaches Projects and closes',active()==['Projects'] and page.get_by_role('button',name='Open navigation',exact=True).get_attribute('aria-expanded')=='false')
    for width in [320,390,768,1440]:
        page.set_viewport_size({'width':width,'height':900})
        for route in ['', 'work','work/michelin','about','contact']:
            goto(route)
            check(f'{width}px {route or "home"} does not overflow horizontally',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
    check('No uncaught browser errors',not errors)
    context.close();browser.close()

result={'passed':sum(c['passed'] for c in checks),'total':len(checks),'checks':checks,'errors':errors}
(OUT/'independent-results.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(f"{result['passed']}/{result['total']} checks passed.")
raise SystemExit(0 if result['passed']==result['total'] else 1)
