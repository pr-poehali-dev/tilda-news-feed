import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

const API = "https://functions.poehali.dev/88a8d657-fbc9-4d93-83e0-36aa66b07efa";

const WEEKDAYS = ["воскресенье","понедельник","вторник","среда","четверг","пятница","суббота"];
const WEEKDAYS_SHORT = ["вс","пн","вт","ср","чт","пт","сб"];
const MONTHS = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];

interface Event {
  id: number;
  title: string;
  description: string;
  image_url: string;
  event_date: string;
  event_time: string;
  age_restriction: string;
  ticket_url: string;
  box_office: string;
  is_online_sale: boolean;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDate();
  const month = MONTHS[d.getMonth()];
  const weekday = WEEKDAYS[d.getDay()];
  return { day, month, weekday, weekdayShort: WEEKDAYS_SHORT[d.getDay()] };
}

function isToday(dateStr: string) {
  const today = new Date();
  const d = new Date(dateStr + "T00:00:00");
  return d.toDateString() === today.toDateString();
}

function isTomorrow(dateStr: string) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const d = new Date(dateStr + "T00:00:00");
  return d.toDateString() === tomorrow.toDateString();
}

function EventCard({ event }: { event: Event }) {
  const { day, month, weekday } = formatDate(event.event_date);
  const today = isToday(event.event_date);
  const tomorrow = isTomorrow(event.event_date);

  return (
    <div className="event-card">
      {/* Image */}
      <div className="event-img-wrap">
        {event.image_url ? (
          <img src={event.image_url} alt={event.title} className="event-img" />
        ) : (
          <div className="event-img-placeholder">
            <Icon name="Ticket" size={40} className="opacity-20" />
          </div>
        )}
        {/* Age badge */}
        {event.age_restriction && (
          <span className="age-badge">{event.age_restriction}</span>
        )}
        {/* Today/Tomorrow tag */}
        {(today || tomorrow) && (
          <span className="event-soon-tag">
            {today ? "Сегодня" : "Завтра"}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="event-body">
        {/* Date row */}
        <div className="event-date-row">
          <div className="event-date-block">
            <span className="event-day">{day}</span>
            <span className="event-month">{month}</span>
          </div>
          <div className="event-datetime-info">
            <span className="event-weekday">{weekday}</span>
            <span className="event-time">
              <Icon name="Clock" size={12} />
              {event.event_time}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="event-title">{event.title}</h3>

        {/* Description */}
        {event.description && (
          <p className="event-desc">{event.description}</p>
        )}

        {/* Ticket info */}
        <div className="event-ticket-row">
          {event.is_online_sale && event.ticket_url ? (
            <a
              href={event.ticket_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ticket"
            >
              <Icon name="Ticket" size={15} />
              Купить билет
            </a>
          ) : (
            <div className="box-office-badge">
              <Icon name="MapPin" size={13} />
              <span>
                {event.box_office ? `Касса: ${event.box_office}` : "Билеты в кассе"}
              </span>
            </div>
          )}

          {/* If both online and box office */}
          {event.is_online_sale && event.box_office && (
            <div className="box-office-hint">
              <Icon name="MapPin" size={11} />
              {event.box_office}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(API)
      .then((r) => r.json())
      .then((data) => { setEvents(data); setLoading(false); })
      .catch(() => { setError("Не удалось загрузить афишу"); setLoading(false); });
  }, []);

  return (
    <div className="events-page">
      {/* Header */}
      <div className="events-header">
        <div className="events-header-icon">
          <Icon name="CalendarDays" size={20} className="text-white" />
        </div>
        <div>
          <h1 className="events-heading">Афиша</h1>
          <p className="events-subheading">Ближайшие мероприятия</p>
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="events-state">
          <div className="events-spinner" />
          <span>Загружаем афишу...</span>
        </div>
      )}

      {error && (
        <div className="events-state events-error">
          <Icon name="AlertCircle" size={32} className="opacity-50" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="events-state">
          <Icon name="CalendarOff" size={40} className="opacity-20 mb-2" />
          <span className="text-sm">Мероприятий пока нет</span>
          <span className="text-xs opacity-50 mt-1">Следите за обновлениями</span>
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="events-grid">
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}
