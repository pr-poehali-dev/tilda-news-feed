"""Публичный API: список активных мероприятий."""
import json
import os
import psycopg2

SCHEMA = os.environ["MAIN_DB_SCHEMA"]

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()
    cur.execute(f"""
        SELECT id, title, description, image_url,
               event_date, event_time, age_restriction,
               ticket_url, box_office, is_online_sale
        FROM {SCHEMA}.events
        WHERE is_active = true
        ORDER BY event_date ASC, event_time ASC
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    result = []
    for r in rows:
        event_date = r[4]
        result.append({
            "id": r[0],
            "title": r[1],
            "description": r[2],
            "image_url": r[3],
            "event_date": event_date.strftime("%Y-%m-%d") if event_date else None,
            "event_time": str(r[5])[:5] if r[5] else None,
            "age_restriction": r[6],
            "ticket_url": r[7],
            "box_office": r[8],
            "is_online_sale": r[9],
        })

    return {
        "statusCode": 200,
        "headers": {**CORS, "Content-Type": "application/json"},
        "body": json.dumps(result, ensure_ascii=False),
    }
