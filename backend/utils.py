import json

MAX_DISCOUNT_PERCENT = 90


def parse_int(value):
    try:
        return int(value) if value not in (None, "") else None
    except (TypeError, ValueError):
        return None


def parse_json_list(raw):
    if isinstance(raw, list):
        return raw

    if isinstance(raw, str):
        try:
            parsed = json.loads(raw or "[]")
            return parsed if isinstance(parsed, list) else []
        except json.JSONDecodeError:
            return []

    return []


def clamp_discount_percent(discount_percent):
    return min(max(float(discount_percent or 0), 0), MAX_DISCOUNT_PERCENT)


def calculate_sale_price(price, discount_percent):
    price = float(price or 0)
    return round(price * (100 - clamp_discount_percent(discount_percent)) / 100)
