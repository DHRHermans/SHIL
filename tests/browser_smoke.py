"""Optional integration check: start the webserver, then run python tests/browser_smoke.py.
Requires Playwright for Python and /usr/bin/chromium in the cloud environment.
"""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
                                args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
    errors = []
    failures = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('response', lambda r: failures.append((r.status, r.url)) if r.status >= 400 else None)
    assert page.goto('http://127.0.0.1:8000/', wait_until='networkidle').status == 200
    assert 'SHIL' in page.title()
    for tab in page.locator('#tabs [data-tab]').evaluate_all('(es)=>es.map(e=>e.dataset.tab)'):
        page.locator(f'#tabs [data-tab="{tab}"]').click()
        assert page.locator('#' + tab).is_visible(), tab
    print('Navigation: 13 tabs passed')
    page.locator('#tabs [data-tab="powerohm"]').click()
    page.locator('#opValue0').fill('24')
    assert 'I = 0,6 A' in page.locator('#opResults').inner_text()
    assert 'P = 14,4 W' in page.locator('#opResults').inner_text()
    page.locator('#tabs [data-tab="efficiency"]').click()
    assert page.locator('#effFormula').inner_text() == 'η = P₂ / P₁'
    assert '0,88' in page.locator('#effSteps').inner_text()
    page.locator('#effUnknown').select_option('p1')
    assert page.locator('#effFormula').inner_text() == 'P₁ = P₂ / η'
    assert '6,25' in page.locator('#effResult').inner_text()
    page.locator('#tabs [data-tab="calc"]').click()
    page.locator('[data-index="1"]').click()
    assert page.locator('#unknown option[value="Z"]').inner_text().startswith('Z —')
    assert '|X|' in page.locator('#fields').inner_text()
    page.locator('[data-index="2"]').click()
    page.wait_for_function("document.querySelector('#formula sub')?.textContent === 'R'")
    assert '_' not in page.locator('#formula').inner_text()
    assert page.locator('#formula sub').all_text_contents() == ['R', 'X']
    assert 'weerstand' in page.locator('#basicFormulaHelp').inner_text()
    page.locator('#tabs [data-tab="rlc"]').click()
    # Main circuit formulas must remain understandable without complex arithmetic.
    page.locator('#kringPreset').select_option('RLC')
    page.locator('#rlctype').select_option('series')
    page.wait_for_function("document.querySelector('#rlcformula sub')?.textContent === 'totaal'")
    series_formula = page.locator('#rlcformula').inner_text()
    assert not any(symbol in series_formula for symbol in ['j', 'Σ', '_', '·', 'Z̲'])
    assert '\nI = U / Z' in series_formula
    page.locator('#rlctype').select_option('parallel')
    page.wait_for_function("document.querySelector('#rlcformula sub')?.textContent === 'R,totaal'")
    assert 'Stroomdriehoek' in page.locator('#rlcTriangle').inner_text()
    assert not any(symbol in page.locator('#rlcformula').inner_text() for symbol in ['j', 'Σ', '_'])
    assert 'Tel per soort op' in page.locator('#rlcsteps').inner_text()
    page.locator('#kringSource').select_option('dc')
    assert 'Σ' not in page.locator('#rlcformula').inner_text()
    page.locator('#scopeRL').click()
    assert 'na' in page.locator('#scopeReadout').inner_text()
    page.locator('#scopeRC').click()
    assert 'voor' in page.locator('#scopeReadout').inner_text()
    page.locator('#tabs [data-tab="compensation"]').click()
    page.locator('#capTargetButton').click()
    assert '0,95' in page.locator('#compMetrics').inner_text()
    page.locator('#tabs [data-tab="flux"]').click()
    page.locator('[data-flux-angle="90"]').click()
    cw = page.locator('#fluxEmf').inner_text()
    page.locator('#fluxDirection').select_option('ccw')
    ccw = page.locator('#fluxEmf').inner_text()
    assert cw.startswith('-') and not ccw.startswith('-'), (cw, ccw)
    page.locator('#tabs [data-tab="laws"]').click()
    assert '5 V' in page.locator('#faradayResult').inner_text()
    assert 'aantal windingen' in page.locator('#lawFaraday .formula').inner_text()
    assert 'Krachtgrootte' in page.locator('#lawLorentz .formula').inner_text()
    page.locator('#tabs [data-tab="map"]').click()
    assert not page.locator('#trigLab details').first.evaluate('(e)=>e.open')
    print('Interactive formula, real subscripts, beginner explanations and circuit presentation passed')
    page.locator('#tabs [data-tab="start"]').click()
    page.locator('#pathList').locator('xpath=ancestor::details/summary').click()
    for i in range(9):
        page.locator(f'[data-path-step="{i}"]').click()
        assert page.locator('#learningBanner').is_visible()
        assert page.locator('#learnStepTitle').inner_text()
        page.locator('#learnBack').click()
    print('Learning path: 9 steps passed')
    page.set_viewport_size({'width': 390, 'height': 844})
    page.locator('#menuToggle').click()
    page.locator('#tabs [data-tab="map"]').click()
    assert page.locator('#trigLab').is_visible()
    page.locator('#menuToggle').click()
    page.locator('#tabs [data-tab="rlc"]').click()
    page.locator('#kringPreset').select_option('RLC')
    for topology in ['series', 'parallel']:
        page.locator('#rlctype').select_option(topology)
        page.wait_for_timeout(50)
        assert '_' not in page.locator('#rlcformula').inner_text()
        assert page.locator('#rlcformula').evaluate('(e)=>e.scrollWidth<=e.clientWidth')
    # Check rendered text on every tab, including dynamically created SVG labels.
    for tab in page.locator('#tabs [data-tab]').evaluate_all('(es)=>es.map(e=>e.dataset.tab)'):
        page.locator('#menuToggle').click()
        page.locator(f'#tabs [data-tab="{tab}"]').click()
        page.wait_for_timeout(50)
        assert '_' not in page.locator('#' + tab).inner_text(), tab
        for formula in page.locator('#' + tab + ' .formula').all():
            if formula.is_visible():
                assert formula.evaluate('(e)=>e.scrollWidth<=e.clientWidth'), (tab, formula.inner_text())
    page.screenshot(path='/tmp/shil-formulas-mobile.png', full_page=True)
    assert page.locator('body').evaluate('(e)=>e.scrollWidth<=innerWidth'), 'mobile horizontal overflow'
    assert not errors, errors
    assert not failures, failures
    print('Mobile navigation passed; no JavaScript errors or HTTP failures')
    browser.close()
