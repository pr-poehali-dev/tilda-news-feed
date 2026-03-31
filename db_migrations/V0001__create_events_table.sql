CREATE TABLE t_p81859282_tilda_news_feed.events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  age_restriction VARCHAR(10),
  ticket_url TEXT,
  box_office TEXT,
  is_online_sale BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);