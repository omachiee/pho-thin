"""Run against the running local app: python -I tests/loading_playwright.py.
Uses the machine's existing Python Playwright and Chrome; no frontend dependency.
Only reads the app. Controlled cases mock GET APIs; no database writes.
"""
import asyncio
from pathlib import Path

from playwright.async_api import async_playwright

BASE_URL = "http://localhost:3000"
ARTIFACTS = Path(__file__).resolve().parents[1] / ".playwright-mcp"


async def controlled_case(browser, name, viewport, *, skip=False, fallback=False, fail=False, reduced=False):
    context = await browser.new_context(viewport=viewport, reduced_motion="reduce" if reduced else "no-preference")
    page = await context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    release = asyncio.Event()
    served = asyncio.Event()
    await page.add_init_script("""
        window.__loadingLifecycle = {};
        let wasVisible = false;
        new MutationObserver(() => {
            const visible = !!document.querySelector('[data-testid="loading-screen"]');
            if (visible && !wasVisible) window.__loadingLifecycle.entered = performance.now();
            if (!visible && wasVisible) window.__loadingLifecycle.removed = performance.now();
            wasVisible = visible;
        }).observe(document, {childList: true, subtree: true});
    """)

    async def auth(route):
        await route.fulfill(json={"data": None})

    async def catalog(route):
        await release.wait()
        try:
            await route.fulfill(status=503 if fail else 200, json={"error": "Lỗi kết nối mô phỏng"} if fail else {"data": {"dishes": [], "branches": [], "articles": []}})
        finally:
            served.set()

    await page.route("**/api/auth", auth)
    await page.route("**/api/catalog", catalog)
    try:
        await page.goto(BASE_URL, wait_until="domcontentloaded")
        splash = page.get_by_test_id("loading-screen")
        await splash.wait_for(state="visible", timeout=30000)
        assert await page.locator("header").count() == 0, "Hidden website must not receive keyboard focus"
        assert await splash.get_by_role("button").count() == 1
        assert await splash.get_by_role("status").is_visible()
        assert await page.evaluate("document.documentElement.scrollWidth <= innerWidth"), "Horizontal overflow"
        assert await page.evaluate("Array.from(document.images).every(img => !img.complete || img.naturalWidth > 0)"), "Broken logo"
        if reduced:
            animation = await splash.locator(".animate-steam-1").evaluate("el => getComputedStyle(el).animationName")
            assert animation == "none", animation
        if name in ("desktop", "mobile"):
            await page.screenshot(path=str(ARTIFACTS / f"loading-{name}.png"))
            assert await splash.is_visible(), "Screenshot captured after loading was dismissed"

        if skip:
            await page.keyboard.press("Tab")
            assert await splash.get_by_role("button").evaluate("el => el === document.activeElement"), "Skip must be keyboard-accessible"
            await page.keyboard.press("Enter")
            await splash.wait_for(state="hidden", timeout=1000)
            await page.get_by_text("Thực đơn đang tải trong nền.", exact=False).wait_for(timeout=1000)
        elif fallback:
            # Wait budget includes Playwright polling; observe actual DOM timing separately.
            await splash.wait_for(state="hidden", timeout=8000)
            duration = await page.evaluate("window.__loadingLifecycle.removed - window.__loadingLifecycle.entered")
            assert 5500 <= duration <= 7000, duration
            await page.get_by_text("Thực đơn đang tải trong nền.", exact=False).wait_for(timeout=1000)
        else:
            release.set()
            await splash.wait_for(state="hidden", timeout=2500)

        release.set()
        await asyncio.wait_for(served.wait(), 5)
        await page.locator("header").wait_for(state="visible", timeout=2500)
        if fail:
            await page.get_by_text("Lỗi kết nối mô phỏng", exact=False).wait_for(timeout=2500)
        else:
            await page.get_by_text("Thực đơn đang tải trong nền.", exact=False).wait_for(state="hidden", timeout=2500)
        assert not errors, errors
        print(f"PASS {name}")
    finally:
        release.set()
        await context.close()


async def live_case(browser):
    context = await browser.new_context(viewport={"width": 1280, "height": 800})
    page = await context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    try:
        await page.goto(BASE_URL, wait_until="domcontentloaded")
        await page.locator("header").wait_for(state="visible", timeout=15000)
        await page.get_by_test_id("loading-screen").wait_for(state="hidden")
        response = await page.request.get(BASE_URL + "/api/catalog")
        if response.status != 200:
            assert response.status == 503, response.status
            await page.get_by_text("Không thể tải danh mục", exact=False).wait_for(timeout=15000)
        assert not errors, errors
        print(f"PASS live app (catalog HTTP {response.status}; no DB writes)")
    finally:
        await context.close()


async def main():
    ARTIFACTS.mkdir(exist_ok=True)
    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(channel="chrome", headless=True)
        try:
            await controlled_case(browser, "desktop", {"width": 1440, "height": 900})
            await controlled_case(browser, "mobile", {"width": 390, "height": 844}, skip=True, reduced=True)
            await controlled_case(browser, "short viewport", {"width": 390, "height": 320}, skip=True)
            await controlled_case(browser, "6-second fallback", {"width": 1280, "height": 800}, fallback=True)
            await controlled_case(browser, "API failure", {"width": 1280, "height": 800}, fail=True)
            await live_case(browser)
        finally:
            await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
