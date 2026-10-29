from playwright.sync_api import sync_playwright, expect
from pathlib import Path
import json

out = Path('docs/verification/project-experiences')
checks = []
errors = []


def check(name, value, detail=None):
    checks.append({'name': name, 'passed': bool(value), 'detail': detail})
    print(('PASS ' if value else 'FAIL ') + name, flush=True)


with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1440, 'height': 1000})
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto('http://127.0.0.1:4174/#/work/ctm')
    page.wait_for_selector('.ctm-relay-canvas')
    page.evaluate('document.fonts.ready')
    page.wait_for_timeout(1200)

    def frames():
        return int(page.locator('.ctm-relay-canvas').get_attribute('data-frames'))

    count = frames()
    page.wait_for_timeout(240)
    check('Canvas particles animate while visible', frames() > count + 2)
    for index, name in enumerate(['facebook', 'tiktok', 'linkedin', 'website']):
        page.locator('.ctm-channel-node').nth(index).click()
        expect(page.locator('.case-ctm')).to_have_attribute('data-channel', name)
        correct_path = page.locator('.ctm-wire.is-selected').first.evaluate('(el,index)=>el===el.parentElement.children[index]', index)
        check(name + ' changes the active Canvas route and SVG path', correct_path and page.locator('.ctm-channel-node').nth(index).get_attribute('aria-pressed') == 'true')
    for index, name in enumerate(['webinars', 'feedback', 'followup']):
        page.locator('.ctm-work-node').nth(index).click()
        expect(page.locator('.case-ctm')).to_have_attribute('data-stage', name)
        action = page.locator('.ctm-personal-action').inner_text()
        correct = '5+' in action if index == 0 else 'tracked' in action if index == 1 else '15%+' in action
        check(name + ' changes a factual personal action', correct, action)

    page.locator('.ctm-channel-node').first.focus()
    page.keyboard.press('ArrowDown')
    check('Channel arrow keys select and focus the next node', page.locator('.ctm-channel-node').nth(1).evaluate('el=>el===document.activeElement') and page.locator('.case-ctm').get_attribute('data-channel') == 'tiktok')
    page.locator('.ctm-work-node').first.focus()
    page.keyboard.press('End')
    check('Stage End key selects and focuses follow-up', page.locator('.ctm-work-node').nth(2).evaluate('el=>el===document.activeElement') and page.locator('.case-ctm').get_attribute('data-stage') == 'followup')

    page.get_by_role('button', name='Pause motion', exact=True).click()
    page.wait_for_timeout(180)
    count = frames()
    page.wait_for_timeout(240)
    check('Pause stops the Canvas loop', frames() == count)
    page.locator('.ctm-channel-node').first.click()
    page.wait_for_timeout(100)
    check('Paused channel selection redraws a complete static route', frames() > count and page.locator('.ctm-channel-node').first.get_attribute('aria-pressed') == 'true')
    count = frames()
    page.wait_for_timeout(180)
    check('Paused selection does not start another loop', frames() == count)
    page.get_by_role('button', name='Enable motion', exact=True).click()
    page.wait_for_timeout(200)
    count = frames()
    page.wait_for_timeout(200)
    check('Enable motion resumes the loop', frames() > count)

    page.locator('.ctm-outcome').scroll_into_view_if_needed()
    page.wait_for_timeout(250)
    count = frames()
    page.wait_for_timeout(240)
    check('Canvas loop stops when diagram leaves the screen', frames() == count)
    page.get_by_role('button', name='Enlarge CTM event photograph').click()
    check('Authentic event photo opens in a native dialog', page.locator('.ctm-photo-dialog').evaluate('el=>el.open'))
    page.keyboard.press('Escape')
    check('Photo dialog closes with Escape', not page.locator('.ctm-photo-dialog').evaluate('el=>el.open'))
    page.locator('.ctm-decision summary').first.click()
    check('Decision reasoning is available on demand', page.locator('.ctm-decision details').first.get_attribute('open') is not None)
    page.locator('.ctm-signal-field').scroll_into_view_if_needed()
    page.wait_for_timeout(300)
    page.locator('.ctm-work-node').nth(1).click()
    page.wait_for_timeout(500)
    page.screenshot(path=str(out / 'ctm-refined-signature.png'))

    reduced = browser.new_page(viewport={'width': 390, 'height': 844}, reduced_motion='reduce')
    reduced.on('pageerror', lambda error: errors.append(str(error)))
    reduced.goto('http://127.0.0.1:4174/#/work/ctm')
    reduced.wait_for_selector('.ctm-relay-canvas')
    reduced.locator('.ctm-signal-field').scroll_into_view_if_needed()
    reduced.wait_for_timeout(250)
    count = int(reduced.locator('.ctm-relay-canvas').get_attribute('data-frames'))
    reduced.wait_for_timeout(240)
    check('Reduced-motion illustration renders and stays still', count > 0 and int(reduced.locator('.ctm-relay-canvas').get_attribute('data-frames')) == count)
    check('Reduced-motion retains all seven reachable controls', reduced.locator('.ctm-signal-field button').count() == 7)
    check('Diagram preserves native vertical panning', reduced.locator('.ctm-signal-field').evaluate('el=>getComputedStyle(el).touchAction') == 'pan-y')
    reduced.locator('.ctm-work-node').nth(2).click()
    check('Reduced-motion work selection still changes content', '15%+' in reduced.locator('.ctm-personal-action').inner_text())
    reduced.screenshot(path=str(out / 'ctm-refined-mobile-signature.png'))
    check('Original evidence source remains reachable', page.locator('.ctm-takeaway a').get_attribute('href').startswith('https://'))
    check('No uncaught browser errors', not errors, errors)
    browser.close()

result = {'passed': sum(item['passed'] for item in checks), 'total': len(checks), 'checks': checks, 'errors': errors}
(out / 'ctm-refined-results.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
print(str(result['passed']) + '/' + str(result['total']) + ' checks passed')
raise SystemExit(0 if all(item['passed'] for item in checks) else 1)
