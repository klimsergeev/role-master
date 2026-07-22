#!/usr/bin/env python3
"""
Референс-шаблон: чтение ориентировочных цен из Travelpayouts / Aviasales Data API
(read-only, кэш). Никакого MCP — обычный HTTP-запрос через stdlib urllib.
Ничего не бронирует, только читает цены. Прогонялся вживую (HTTP 200, реальные цены).

Токен НИКОГДА не хардкодится и не печатается. Источник токена — ТОЛЬКО переменная
окружения TRAVELPAYOUTS_TOKEN. Скрипт файл на диске не ищет и путь к нему не хранит.
Токен обычно лежит в .env, который пользователь передаёт в чат по мере необходимости;
перед запуском он экспортируется в окружение (TRAVELPAYOUTS_TOKEN=... python3 ...).

Запуск:
  TRAVELPAYOUTS_TOKEN=твой_токен python3 travelpayouts_probe.py
  TRAVELPAYOUTS_TOKEN=твой_токен python3 travelpayouts_probe.py MOW TYO rub

Аргументы (все опциональны): origin dest currency. Дефолт: LED AER rub.
IATA-коды: города (MOW, LED, MOW→TYO) или аэропортов; валюта — rub/usd/eur/...
"""
import json
import os
import ssl
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

BASE = "https://api.travelpayouts.com"


def _ssl_context():
    """Полная проверка TLS. На macOS/python.org дефолтный cert.pem часто НЕ настроен
    (иначе CERTIFICATE_VERIFY_FAILED) — берём CA-бандл из certifi, если он есть.
    Это нюанс окружения, а не проблема API. Установка: pip install certifi."""
    try:
        import certifi
        return ssl.create_default_context(cafile=certifi.where())
    except Exception:
        return ssl.create_default_context()


SSL_CTX = _ssl_context()


def load_token():
    """Токен — ТОЛЬКО из переменной окружения TRAVELPAYOUTS_TOKEN. Файл .env на
    диске не ищем и путь к нему не храним: пользователь передаёт .env в чат по
    мере необходимости, а перед запуском токен экспортируется в окружение."""
    return os.environ.get("TRAVELPAYOUTS_TOKEN", "").strip()


def call(path, params, token):
    """GET к Data API. Авторизация — заголовком X-Access-Token (можно и ?token=...).
    Возвращает (status, headers, body). Токен в вывод не попадает."""
    url = BASE + path + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"X-Access-Token": token})
    try:
        with urllib.request.urlopen(req, timeout=30, context=SSL_CTX) as r:
            return r.status, dict(r.headers), r.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        # 429 — превышен rate-limit (наблюдался кап 300 запросов/мин).
        return e.code, dict(e.headers), e.read().decode("utf-8", "replace")
    except Exception as e:  # noqa: BLE001
        return None, {}, f"ERROR: {type(e).__name__}: {e}"


def freshness(expires_at):
    """Свежесть кэш-записи. У /v1/prices/cheap поля `actual` НЕТ — ориентир только
    по expires_at (UTC). Значение обычно близко к «сегодня» — подавать цену как
    ориентировочную по кэшу, не как гарантированную."""
    if not expires_at:
        return "нет expires_at"
    try:
        exp = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
        days = (exp - datetime.now(timezone.utc)).total_seconds() / 86400
        tail = " — ПРОСРОЧЕНО" if days < 0 else ""
        return f"expires_at={expires_at} (осталось ~{days:.1f} дн.){tail}"
    except Exception:
        return f"expires_at={expires_at} (не распарсил)"


def main():
    token = load_token()
    if not token:
        print("НЕТ ТОКЕНА: задай переменную окружения TRAVELPAYOUTS_TOKEN=... "
              "(.env даётся в чате, перед запуском экспортируй токен). "
              "Без токена цену выдать нельзя.")
        sys.exit(2)

    origin = sys.argv[1] if len(sys.argv) > 1 else "LED"
    dest = sys.argv[2] if len(sys.argv) > 2 else "AER"
    currency = sys.argv[3] if len(sys.argv) > 3 else "rub"
    print(f"== Travelpayouts Data API: {origin} -> {dest}, валюта {currency} ==\n")

    # 1) Самая дешёвая цена по маршруту (кэш).
    status, headers, body = call(
        "/v1/prices/cheap",
        {"origin": origin, "destination": dest, "currency": currency},
        token,
    )
    print(f"[1] GET /v1/prices/cheap -> HTTP {status}")
    rate = {k: v for k, v in headers.items() if "Rate-Limit" in k}
    if rate:
        # Наблюдалось X-Rate-Limit: 300 (300 запросов/мин), *-Remaining, *-Reset(сек).
        print(f"    rate-limit: {rate}")
    try:
        data = json.loads(body)
        if not data.get("success", True):
            print(f"    success=false, error={data.get('error')}")
        found = 0
        for _dcode, byhop in (data.get("data", {}) or {}).items():
            for off in (byhop.values() if isinstance(byhop, dict) else []):
                found += 1
                print(f"    - {off.get('price')} {currency} | {off.get('airline')} "
                      f"рейс {off.get('flight_number', '?')} | вылет {off.get('departure_at')} "
                      f"| {freshness(off.get('expires_at'))}")
        if not found:
            print("    (кэш по маршруту пуст — для не-СНГ вероятнее, но не гарантированно)")
    except json.JSONDecodeError:
        print("    ответ не JSON:\n    " + body[:600].replace("\n", "\n    "))

    print()
    # 2) Календарь цен по дням — питает эвристику «когда дешевле».
    status2, _h2, body2 = call(
        "/v1/prices/calendar",
        {"origin": origin, "destination": dest, "currency": currency},
        token,
    )
    print(f"[2] GET /v1/prices/calendar -> HTTP {status2}")
    try:
        cal = json.loads(body2).get("data", {}) or {}
        for day in sorted(cal)[:5]:
            off = cal[day]
            print(f"    {day}: {off.get('price')} {currency} | {off.get('airline')} "
                  f"| пересадок {off.get('transfers')} | {freshness(off.get('expires_at'))}")
        if not cal:
            print("    (календарь по маршруту пуст)")
    except json.JSONDecodeError:
        print("    ответ не JSON:\n    " + body2[:600].replace("\n", "\n    "))


if __name__ == "__main__":
    main()
