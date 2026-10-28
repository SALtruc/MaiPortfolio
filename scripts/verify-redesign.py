"""Browser acceptance checks for Mai's portfolio. Run against a running Vite server."""
import json
import os
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = os.environ.get('PORTFOLIO_URL', 'http://127.0.0.1:5173')
OUT = Path(__file__).resolve().parents[1] / 'docs' / 'verification'
OUT.mkdir(parents=True, exist_ok=True)
results = []
errors = []


def check(name, condition):
    assert condition, name
    results.append(name)
    print('PASS: ' + name, flush=True)


def settle(page):
    page.wait_for_function('document.fonts.status === "loaded"')
    page.wait_for_timeout(200)


def no_overflow(page, name):
    check(name, page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'))


with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1440, 'height': 960}, device_scale_factor=1)
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(BASE)
    settle(page)
    page.locator('.desk-render.ready').wait_for(timeout=20000)
    page.wait_for_timeout(1100)
    no_overflow(page, 'Desktop home has no horizontal overflow')
    check('Live 3D desk is rendered', page.locator('.desk-render canvas').count() == 1)
    check('All four desk navigation controls are visible', all(button.is_visible() for button in page.locator('.desk-object-label').all()))
    page.screenshot(path=str(OUT / 'redesign-home-desktop.png'))

    page.locator('.featured-shell').scroll_into_view_if_needed()
    page.wait_for_timeout(1000)
    check('Featured projects start at Michelin', page.locator('.featured-copy h3').inner_text() == 'Green Finance')
    page.get_by_role('button', name='Next featured project').click()
    check('Next button selects Career Checkpoint', page.locator('.featured-copy h3').inner_text() == 'Career Checkpoint')
    page.get_by_role('button', name='Previous featured project').click()
    page.get_by_role('button', name='Previous featured project').click()
    check('Previous button wraps to CTM', page.locator('.featured-copy h3').inner_text() == 'Customer engagement')
    page.get_by_role('button', name='Show Club Day & community', exact=True).click()
    check('Pagination selects its named project', page.locator('.featured-copy h3').inner_text() == 'Club Day & community')
    page.locator('.featured-stage').focus()
    page.keyboard.press('ArrowRight')
    check('Keyboard arrows change the project', page.locator('.featured-copy h3').inner_text() == 'Careers Fair')
    check('Careers Fair highlights personal contribution', page.locator('.featured-metrics').inner_text().startswith('300+'))
    page.get_by_role('button', name='Show Green Finance', exact=True).click()
    page.locator('.featured-stage').hover(position={'x': 70, 'y': 100})
    check('Frame responds to pointer position', page.locator('.featured-stage').evaluate('el => !!el.style.getPropertyValue("--tilt-x")'))
    page.screenshot(path=str(OUT / 'redesign-featured-desktop.png'))

    page.locator('.featured-copy .quiet-link').click()
    check('Featured project opens the matching case', page.url.endswith('#/work/michelin'))
    page.get_by_role('button', name='Enlarge project cover').click()
    check('Project evidence opens in a modal dialog', page.locator('dialog').evaluate('el => el.open'))
    page.keyboard.press('Escape')
    check('Escape closes evidence dialog', not page.locator('dialog').evaluate('el => el.open'))
    page.locator('[role=tab]').nth(1).click()
    check('Process tab updates its panel', page.locator('[role=tabpanel]').get_attribute('aria-labelledby') == 'process-step-1')
    page.keyboard.press('ArrowRight')
    check('Process tabs support keyboard navigation', page.locator('[role=tab][aria-selected=true]').get_attribute('id') == 'process-step-2')
    page.locator('.process-explanation summary').click()
    check('Decision reasoning expands', page.locator('.process-explanation details').evaluate('el => el.open'))
    page.screenshot(path=str(OUT / 'redesign-process-desktop.png'))

    for route in ['work', 'journey', 'notes', 'hello', 'work/checkpoint', 'work/council', 'work/careers-fair', 'work/ctm']:
        page.goto(BASE + '/#/' + route)
        settle(page)
        no_overflow(page, f'Desktop {route} has no horizontal overflow')
        check(f'{route} has a visible page heading', page.locator('h1').is_visible())
        check(f'{route} has no broken images', page.evaluate('Array.from(document.images).filter(i => i.complete).every(i => i.naturalWidth > 0)'))
    page.goto(BASE + '/#/work')
    page.get_by_role('button', name='Show Green Finance', exact=True).click()
    page.wait_for_timeout(1100)
    check('Project reel selects its matching photograph', 'frame-michelin' in page.locator('.reel-frame.is-active').get_attribute('class'))
    page.screenshot(path=str(OUT / 'redesign-work-desktop.png'))

    for width in [390, 320, 768]:
        mobile = browser.new_page(viewport={'width': width, 'height': 844}, device_scale_factor=1, is_mobile=True, has_touch=True)
        mobile.on('pageerror', lambda error: errors.append(str(error)))
        for route in ['', 'work', 'journey', 'notes', 'hello', 'work/michelin', 'work/checkpoint']:
            mobile.goto(BASE + '/#/' + route)
            settle(mobile)
            no_overflow(mobile, f'{width}px {route or "home"} has no horizontal overflow')
        if width == 390:
            mobile.goto(BASE)
            settle(mobile)
            mobile.screenshot(path=str(OUT / 'redesign-home-mobile.png'))
            mobile.locator('.world-shell').scroll_into_view_if_needed()
            mobile.locator('.desk-render.ready').wait_for(timeout=20000)
            mobile.wait_for_timeout(500)
            mobile.locator('.hero-world').screenshot(path=str(OUT / 'redesign-desk-mobile.png'))
            bounds = [button.bounding_box() for button in mobile.locator('.desk-object-label').all()]
            check('Mobile desk buttons have 44px touch targets', all(box['height'] >= 44 for box in bounds))
            overlap = any(a['x'] < b['x'] + b['width'] and a['x'] + a['width'] > b['x'] and a['y'] < b['y'] + b['height'] and a['y'] + a['height'] > b['y'] for i, a in enumerate(bounds) for b in bounds[i + 1:])
            check('Mobile desk navigation controls do not overlap', not overlap)
            mobile.evaluate('window.scrollTo({top:0,behavior:"instant"})')
            mobile.wait_for_timeout(200)
            mobile.get_by_role('button', name='Open navigation').click()
            check('Mobile menu opens', mobile.get_by_role('navigation', name='Main navigation').is_visible())
            mobile.get_by_role('navigation', name='Main navigation').get_by_role('link', name='About Mai').click()
            check('Mobile navigation changes route', mobile.url.endswith('#/notes'))
            check('Mobile menu closes after selection', not mobile.get_by_role('navigation', name='Main navigation').is_visible())
            mobile.goto(BASE)
            mobile.locator('.featured-shell').scroll_into_view_if_needed()
            mobile.wait_for_timeout(1000)
            mobile.screenshot(path=str(OUT / 'redesign-featured-mobile.png'))
            stage = mobile.locator('.featured-stage').bounding_box()
            touch_session = mobile.context.new_cdp_session(mobile)
            x, y = stage['x'] + stage['width'] * .8, stage['y'] + stage['height'] / 2
            touch_session.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x, 'y': y}]})
            touch_session.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x - 150, 'y': y + 3}]})
            touch_session.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
            mobile.wait_for_timeout(200)
            check('Horizontal swipe advances the gallery', mobile.locator('.featured-copy h3').inner_text() == 'Career Checkpoint')
            mobile.goto(BASE + '/#/hello')
            mobile.get_by_role('button', name='Turn the postcard').click()
            check('Postcard flips to contact details', 'flipped' in mobile.locator('.postcard-scene').get_attribute('class'))
            check('Email and CV are accessible on postcard back', mobile.locator('.postcard-face.back a[href^="mailto:"]').is_visible() and mobile.locator('.postcard-face.back a[href="/ngoc-mai-cv.pdf"]').is_visible())
            mobile.wait_for_timeout(1100)
            mobile.screenshot(path=str(OUT / 'redesign-contact-mobile.png'))
        mobile.close()

    page.goto(BASE)
    page.get_by_role('button', name='Pause motion').click()
    check('Motion toggle disables animation globally', page.locator('html').get_attribute('data-motion') == 'off')
    check('Paused reveal content remains readable', page.locator('.home-contact').evaluate('el => getComputedStyle(el).opacity') == '1')
    page.locator('.featured-shell').scroll_into_view_if_needed()
    page.locator('.featured-stage').hover(position={'x': 100, 'y': 100})
    check('Paused frames ignore pointer tilt', page.locator('.featured-stage').evaluate('el => !el.style.getPropertyValue("--tilt-x")'))
    page.get_by_role('button', name='Show Career Checkpoint', exact=True).click()
    check('Gallery remains usable with motion disabled', page.locator('.featured-copy h3').inner_text() == 'Career Checkpoint')

    reduced = browser.new_page(viewport={'width': 390, 'height': 844}, reduced_motion='reduce')
    reduced.goto(BASE)
    settle(reduced)
    check('System reduced-motion preference is respected', reduced.locator('html').get_attribute('data-motion') == 'off')
    check('No continuous CSS animation under reduced motion', reduced.locator('.hero-copy').evaluate('el => getComputedStyle(el).animationName') == 'none')
    reduced.close()

    fallback = browser.new_page(viewport={'width': 390, 'height': 844})
    fallback.add_init_script('''const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function(type, ...args) {
            if (type.startsWith('webgl')) return null;
            return original.call(this, type, ...args);
        };''')
    fallback.goto(BASE)
    fallback.locator('.desk-failed').wait_for(timeout=15000)
    check('WebGL failure shows a static visual', fallback.locator('.desk-loading').is_visible())
    fallback.locator('.label-work').click()
    check('WebGL fallback keeps navigation functional', fallback.url.endswith('#/work'))
    fallback.close()
    check('No uncaught browser errors', len(errors) == 0)
    cv = page.request.get(BASE + '/ngoc-mai-cv.pdf')
    check('CV download is a valid PDF response', cv.status == 200 and 'application/pdf' in cv.headers.get('content-type', ''))
    browser.close()

report = {'passed': len(results), 'checks': results, 'browser_errors': errors, 'base_url': BASE}
(OUT / 'redesign-browser-results.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(json.dumps(report, indent=2))
