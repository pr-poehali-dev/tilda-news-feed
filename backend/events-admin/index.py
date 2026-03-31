"""Админ API: CRUD мероприятий. Защищён паролем через заголовок X-Admin-Token. v2"""
import json
import os
import psycopg2

SCHEMA = os.environ["MAIN_DB_SCHEMA"]
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
}


def err(code: int, msg: str):
    return {
        "statusCode": code,
        "headers": {**CORS, "Content-Type": "application/json"},
        "body": json.dumps({"error": msg}, ensure_ascii=False),
    }


def ok(data):
    return {
        "statusCode": 200,
        "headers": {**CORS, "Content-Type": "application/json"},
        "body": json.dumps(data, ensure_ascii=False),
    }


def check_auth(event: dict) -> bool:
    token = event.get("headers", {}).get("X-Admin-Token", "")
    return token == ADMIN_TOKEN and ADMIN_TOKEN != ""


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    if not check_auth(event):
        return err(401, "Неверный токен")

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    body = {}
    if event.get("body"):
        body = json.loads(event["body"])

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()

    try:
        if method == "GET":
            cur.execute(f"""
                SELECT id, title, description, image_url,
                       event_date, event_time, age_restriction,
                       ticket_url, box_office, is_online_sale, is_active, created_at
                FROM {SCHEMA}.events
                ORDER BY event_date ASC, event_time ASC
            """)
            rows = cur.fetchall()
            result = []
            for r in rows:
                result.append({
                    "id": r[0], "title": r[1], "description": r[2],
                    "image_url": r[3],
                    "event_date": r[4].strftime("%Y-%m-%d") if r[4] else None,
                    "event_time": str(r[5])[:5] if r[5] else None,
                    "age_restriction": r[6], "ticket_url": r[7],
                    "box_office": r[8], "is_online_sale": r[9],
                    "is_active": r[10],
                    "created_at": r[11].isoformat() if r[11] else None,
                })
            return ok(result)

        elif method == "POST":
            cur.execute(f"""
                INSERT INTO {SCHEMA}.events
                  (title, description, image_url, event_date, event_time,
                   age_restriction, ticket_url, box_office, is_online_sale, is_active)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                RETURNING id
            """, (
                body.get("title"), body.get("description"), body.get("image_url"),
                body.get("event_date"), body.get("event_time"),
                body.get("age_restriction"), body.get("ticket_url"),
                body.get("box_office"), body.get("is_online_sale", False),
                body.get("is_active", True),
            ))
            new_id = cur.fetchone()[0]
            conn.commit()
            return ok({"id": new_id, "message": "Создано"})

        elif method == "PUT":
            eid = params.get("id")
            if not eid:
                return err(400, "Нужен id")
            cur.execute(f"""
                UPDATE {SCHEMA}.events
                SET title=%s, description=%s, image_url=%s,
                    event_date=%s, event_time=%s, age_restriction=%s,
                    ticket_url=%s, box_office=%s,
                    is_online_sale=%s, is_active=%s
                WHERE id=%s
            """, (
                body.get("title"), body.get("description"), body.get("image_url"),
                body.get("event_date"), body.get("event_time"),
                body.get("age_restriction"), body.get("ticket_url"),
                body.get("box_office"), body.get("is_online_sale", False),
                body.get("is_active", True), int(eid),
            ))
            conn.commit()
            return ok({"message": "Обновлено"})

        elif method == "DELETE":
            eid = params.get("id")
            if not eid:
                return err(400, "Нужен id")
            cur.execute(f"DELETE FROM {SCHEMA}.events WHERE id=%s", (int(eid),))
            conn.commit()
            return ok({"message": "Удалено"})

        return err(405, "Метод не поддерживается")

    finally:
        cur.close()
        conn.close()