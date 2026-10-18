#!/usr/bin/env python3
"""Захват референса для мудборда: скриншот + вычисленные стили.

Условие применимости: установлен Playwright для Python с браузером Chromium
(python3 -c "import playwright" без ошибки). Скрипт — необязательное улучшение:
без него снимки делаются в Chrome пользователя.

Пример:
  python3 capture.py --url https://linear.app --out refs/ --id 01-linear-hero \
      --preset desktop --mode viewport
  python3 capture.py --url https://example.com --out refs/ --id 02-card \
      --mode element --selector ".pricing-card"

Результат: <id>.png (или .jpg) + <id>.json (url, режим, размеры, цвета, шрифты, og:image).
"""
import argparse, asyncio, json, sys, time
from pathlib import Path
from playwright.async_api import async_playwright

PRESETS = {
    "desktop": {"viewport": {"width": 1440, "height": 900}, "device_scale_factor": 1, "is_mobile": False},
    "mobile":  {"viewport": {"width": 390, "height": 844}, "device_scale_factor": 2, "is_mobile": True,
                "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 "
                              "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"},
}

# Прячем баннеры cookie и всплывающие окна, НЕ нажимая «Принять»
HIDE_OVERLAYS_CSS = """
[id*="cookie" i],[class*="cookie" i],[id*="consent" i],[class*="consent" i],
[id*="onetrust" i],[class*="onetrust" i],[aria-label*="cookie" i],
[class*="newsletter-modal" i],[class*="intercom" i],[id*="intercom" i],
#credential_picker_container { display:none !important; visibility:hidden !important; }
html,body { overflow:auto !important; }
"""

STYLES_JS = """() => {
 const toHex = v => { const m = v.match(/rgba?\\(([^)]+)\\)/); if(!m) return null;
   const p = m[1].split(',').map(s=>parseFloat(s)); if (p.length===4 && p[3] < 0.9) return null;
   return '#' + p.slice(0,3).map(n=>Math.round(n).toString(16).padStart(2,'0')).join('').toUpperCase(); };
 const bg={}, fg={}, border={}, fonts={};
 for (const e of [...document.querySelectorAll('body *')].slice(0,4000)) {
   const r = e.getBoundingClientRect(); const a = r.width*r.height; if (a < 1) continue;
   const s = getComputedStyle(e);
   const b = toHex(s.backgroundColor); if (b) bg[b]=(bg[b]||0)+a;
   const hasText = [...e.childNodes].some(n=>n.nodeType===3 && n.textContent.trim());
   if (hasText) { const c = toHex(s.color); if (c) fg[c]=(fg[c]||0)+1;
     const f = s.fontFamily.split(',')[0].replace(/["']/g,'') + ' ' + s.fontWeight;
     fonts[f]=(fonts[f]||0)+1; }
   if (parseFloat(s.borderTopWidth) > 0) { const c = toHex(s.borderTopColor); if (c) border[c]=(border[c]||0)+1; }
 }
 const top = (o,n) => Object.entries(o).sort((x,y)=>y[1]-x[1]).slice(0,n).map(([k,v])=>({value:k, weight:Math.round(v)}));
 return { backgrounds: top(bg,6), text: top(fg,6), borders: top(border,4), fonts: top(fonts,6),
          og_image: document.querySelector('meta[property="og:image"]')?.content || null,
          title: document.title };
}"""

async def scroll_for_lazy(page, steps=8):
    """Прокрутка вниз и обратно, чтобы подгрузились отложенные картинки."""
    for _ in range(steps):
        await page.mouse.wheel(0, 900)
        await page.wait_for_timeout(400)
    await page.evaluate("window.scrollTo(0,0)")
    await page.wait_for_timeout(800)
    try:
        await page.wait_for_function(
            "() => [...document.images].filter(i => i.getBoundingClientRect().top < innerHeight)"
            ".every(i => i.complete && i.naturalWidth > 0)", timeout=5000)
    except Exception:
        pass

async def main(a):
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    preset = dict(PRESETS[a.preset]); preset["color_scheme"] = a.scheme
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        ctx = await browser.new_context(**preset)
        page = await ctx.new_page()
        resp = await page.goto(a.url, wait_until="domcontentloaded", timeout=45000)
        status = resp.status if resp else None
        await page.add_style_tag(content=HIDE_OVERLAYS_CSS)
        await page.wait_for_timeout(a.wait)
        await scroll_for_lazy(page)
        ext = "jpg" if a.jpeg else "png"
        img_path = out / f"{a.id}.{ext}"
        kw = {"path": str(img_path), "type": "jpeg" if a.jpeg else "png"}
        if a.jpeg: kw["quality"] = 85
        if a.mode == "element":
            loc = page.locator(a.selector).first
            await loc.scroll_into_view_if_needed()
            await loc.screenshot(**kw)
        else:
            if a.mode == "full": kw["full_page"] = True
            await page.screenshot(**kw)
        styles = await page.evaluate(STYLES_JS)
        await browser.close()
    meta = {"id": a.id, "url": a.url, "http_status": status, "mode": a.mode, "preset": a.preset,
            "scheme": a.scheme, "selector": a.selector, "file": img_path.name,
            "captured_at": time.strftime("%Y-%m-%dT%H:%M:%S%z"), "extracted": styles,
            "extraction_method": "computed-styles"}
    (out / f"{a.id}.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2))
    print(json.dumps({"file": str(img_path), "status": status, "title": styles.get("title")}, ensure_ascii=False))

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", required=True); ap.add_argument("--out", required=True); ap.add_argument("--id", required=True)
    ap.add_argument("--preset", choices=list(PRESETS), default="desktop")
    ap.add_argument("--mode", choices=["viewport", "full", "element"], default="viewport")
    ap.add_argument("--selector"); ap.add_argument("--scheme", choices=["light", "dark"], default="light")
    ap.add_argument("--wait", type=int, default=1500); ap.add_argument("--jpeg", action="store_true")
    a = ap.parse_args()
    if a.mode == "element" and not a.selector: sys.exit("--selector обязателен для --mode element")
    asyncio.run(main(a))
