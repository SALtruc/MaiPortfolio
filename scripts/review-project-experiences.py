"""Independent review of the five authored case experiences and shared shell."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

BASE = 'http://127.0.0.1:4174'
OUT = Path('docs/verification/project-experiences')
OUT.mkdir(parents=True, exist_ok=True)
checks = []

def check(name, value):
    checks.append({'name': name, 'passed': bool(value)})
    print(('PASS: ' if value else 'FAIL: ') + name, flush=True)

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1440, 'height': 900}, reduced_motion='reduce')
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    projects = ['council', 'michelin', 'checkpoint', 'careers-fair', 'ctm']
    controls = {
        'council': '.council-lenses button',
        'michelin': '.mc-stage-label',
        'checkpoint': '.cp-bookmarks button',
        'careers-fair': '.cf-perspectives button',
        'ctm': '.ctm-channel-node',
    }
    for width in [320, 390, 768, 1280, 1440]:
        page.set_viewport_size({'width': width, 'height': 900 if width > 768 else 844})
        for project in projects:
            page.goto(BASE + '/#/work/' + project)
            root = page.locator('.case-' + project)
            root.wait_for()
            page.evaluate('document.fonts.ready')
            page.wait_for_timeout(160)
            prefix = f'{width}px {project}'
            check(prefix + ': one case heading and no horizontal overflow',
                  root.locator('h1').count() == 1 and page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'))
            check(prefix + ': compact shell with usable return links', page.locator('.case-navigation').bounding_box()['height'] <= 75 and
                  page.locator('.case-back-link').bounding_box()['height'] >= 44 and page.locator('.case-journey-link').bounding_box()['height'] >= 44)
            nodes = root.locator(controls[project])
            check(prefix + ': primary interaction targets are at least 44px', nodes.count() > 0 and
                  nodes.evaluate_all('es=>es.every(e=>{let r=e.getBoundingClientRect();return r.width>=43.9&&r.height>=43.9})'))
            if width in [390, 1440]:
                page.screenshot(path=str(OUT / f'reviewer-{project}-{width}-opening.png'))

    page.set_viewport_size({'width': 1440, 'height': 900})
    for project in projects:
        page.goto(BASE + '/#/work/' + project)
        root = page.locator('.case-' + project)
        root.wait_for()
        if project == 'council':
            tabs = root.get_by_role('tab')
            tabs.nth(1).click()
            check('Council selects a different responsibility', 'is-coordinate' in root.get_attribute('class'))
            tabs.nth(1).focus(); page.keyboard.press('ArrowRight')
            check('Council supports keyboard chapter changes', 'is-deliver' in root.get_attribute('class'))
        elif project == 'michelin':
            expect(root.locator('.mc-canvas-host')).to_have_attribute('data-scene-state', 'ready', timeout=60000)
            root.locator('.mc-stage-label').nth(1).click()
            check('Michelin station selection updates its 3D model', root.locator('.mc-canvas-host').get_attribute('data-active-focus') != 'overview')
            root.locator('.mc-stage-label').nth(1).focus(); page.keyboard.press('End')
            check('Michelin keyboard restores whole project', root.locator('.mc-overview-control').get_attribute('aria-pressed') == 'true')
        elif project == 'checkpoint':
            root.locator('.cp-bookmarks button').nth(1).click()
            check('Checkpoint opens Apply spread', root.get_attribute('data-chapter') == 'apply')
            root.locator('.cp-bookmarks button').nth(1).focus(); page.keyboard.press('End')
            check('Checkpoint keyboard opens Connect spread', root.get_attribute('data-chapter') == 'connect')
        elif project == 'careers-fair':
            root.locator('.cf-perspectives button').first.click()
            check('Careers Fair flips to the visitor perspective', root.locator('.cf-pass-visitor').get_attribute('inert') is None and root.locator('.cf-pass-contributor').get_attribute('inert') is not None)
            root.locator('.cf-path-controls button').first.focus(); page.keyboard.press('End')
            check('Careers Fair keyboard selects final responsibility', root.locator('.cf-path-controls button').last.get_attribute('aria-pressed') == 'true')
        else:
            root.locator('.ctm-channel-node').nth(2).click()
            root.locator('.ctm-work-node').last.click()
            check('CTM channel and follow-up update the same story', root.get_attribute('data-channel') == 'linkedin' and root.get_attribute('data-stage') == 'followup')
            root.locator('.ctm-channel-node').nth(2).focus(); page.keyboard.press('Home')
            check('CTM channel keyboard navigation works', root.get_attribute('data-channel') == 'facebook')

        photo = root.locator('button[aria-label^="Enlarge"]:not([inert] *)').filter(visible=True).first
        photo.click()
        expect(root.locator('dialog')).to_be_visible()
        check(project + ': original photograph enlarges', root.locator('dialog[open] img').count() > 0)
        page.keyboard.press('Escape')
        check(project + ': Escape closes the photo', root.locator('dialog[open]').count() == 0)
        check(project + ': original source remains available', root.locator('a[target="_blank"]').count() > 0)

    page.emulate_media(reduced_motion='no-preference')
    for project, target, trigger, prop in [
        ('council', '.council-link', '.case-council [role=tab]', 'strokeDashoffset'),
        ('checkpoint', '.cp-turning-leaf', '.cp-bookmarks button', 'transform'),
        ('careers-fair', '.cf-pass-rotor', '.cf-perspectives button', 'transform'),
    ]:
        page.goto(BASE + '/#/work/' + project)
        root = page.locator('.case-' + project); root.wait_for()
        enable = page.get_by_role('button', name='Enable motion', exact=True)
        if enable.count(): enable.click()
        page.wait_for_timeout(1200)
        page.locator(trigger).first.click() if project == 'careers-fair' else page.locator(trigger).nth(1).click()
        first = root.locator(target).first.evaluate('(e,p)=>getComputedStyle(e)[p]', prop)
        page.wait_for_timeout(220)
        second = root.locator(target).first.evaluate('(e,p)=>getComputedStyle(e)[p]', prop)
        check(project + ': actual animated property changes over time', first != second)
        page.get_by_role('button', name='Pause motion', exact=True).click()
        first = root.locator(target).first.evaluate('(e,p)=>getComputedStyle(e)[p]', prop)
        page.wait_for_timeout(250)
        second = root.locator(target).first.evaluate('(e,p)=>getComputedStyle(e)[p]', prop)
        check(project + ': global motion pause leaves a stable visible object', first == second)

    for project, selector in [('michelin', '.mc-canvas-host'), ('ctm', '.ctm-relay-canvas')]:
        page.goto(BASE + '/#/work/' + project)
        host = page.locator(selector); host.wait_for()
        enable = page.get_by_role('button', name='Enable motion', exact=True)
        if enable.count(): enable.click()
        host.scroll_into_view_if_needed(); page.wait_for_timeout(400)
        a = int(host.get_attribute('data-frames') or 0); page.wait_for_timeout(350)
        b = int(host.get_attribute('data-frames') or 0)
        check(project + ': canvas actually renders motion', b > a)
        page.get_by_role('button', name='Pause motion', exact=True).click(); page.wait_for_timeout(150)
        a = int(host.get_attribute('data-frames') or 0); page.wait_for_timeout(350)
        check(project + ': canvas stops on global pause', int(host.get_attribute('data-frames') or 0) == a)

    page.goto(BASE + '/#/contact'); page.wait_for_timeout(300)
    check('Navigating away cleans up cases without browser errors', not errors)
    browser.close()

result = {'passed': sum(c['passed'] for c in checks), 'total': len(checks), 'checks': checks, 'errors': errors}
(OUT / 'reviewer-results.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
print(f"{result['passed']}/{result['total']} checks passed.", flush=True)
raise SystemExit(0 if result['passed'] == result['total'] else 1)
