import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

const API = "https://functions.poehali.dev/40739e31-8ac7-4601-a25f-b35ff89c0b20";

interface Event {
  id?: number;
  title: string;
  description: string;
  image_url: string;
  event_date: string;
  event_time: string;
  age_restriction: string;
  ticket_url: string;
  box_office: string;
  is_online_sale: boolean;
  is_active: boolean;
}

const EMPTY: Event = {
  title: "", description: "", image_url: "",
  event_date: "", event_time: "",
  age_restriction: "", ticket_url: "",
  box_office: "", is_online_sale: false, is_active: true,
};

const AGE_OPTIONS = ["0+", "6+", "12+", "16+", "18+"];

export default function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem("admin_token") || "");
  const [tokenInput, setTokenInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [checking, setChecking] = useState(false);

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Event>(EMPTY);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function checkToken(t: string) {
    setChecking(true);
    setAuthError("");
    try {
      const r = await fetch(API, { headers: { "X-Admin-Token": t } });
      if (r.status === 401) { setAuthError("Неверный пароль"); setChecking(false); return; }
      sessionStorage.setItem("admin_token", t);
      setToken(t);
      const data = await r.json();
      setEvents(data);
    } catch {
      setAuthError("Ошибка соединения");
    }
    setChecking(false);
  }

  async function loadEvents() {
    setLoading(true);
    const r = await fetch(API, { headers: { "X-Admin-Token": token } });
    setEvents(await r.json());
    setLoading(false);
  }

  useEffect(() => {
    if (token) loadEvents();
  }, [token]);

  async function save() {
    if (!form.title || !form.event_date || !form.event_time) {
      showToast("Заполните название, дату и время");
      return;
    }
    setSaving(true);
    const method = editId ? "PUT" : "POST";
    const url = editId ? `${API}?id=${editId}` : API;
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", "X-Admin-Token": token },
      body: JSON.stringify(form),
    });
    await loadEvents();
    setShowForm(false);
    setForm(EMPTY);
    setEditId(null);
    showToast(editId ? "Мероприятие обновлено" : "Мероприятие добавлено");
    setSaving(false);
  }

  async function remove(id: number) {
    await fetch(`${API}?id=${id}`, {
      method: "DELETE",
      headers: { "X-Admin-Token": token },
    });
    await loadEvents();
    setDeleteId(null);
    showToast("Мероприятие удалено");
  }

  function startEdit(e: Event) {
    setForm({ ...e });
    setEditId(e.id!);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function startNew() {
    setForm(EMPTY);
    setEditId(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── Login screen ───────────────────────────────
  if (!token) {
    return (
      <div className="admin-login">
        <div className="admin-login-box">
          <div className="admin-login-icon">
            <Icon name="Lock" size={22} className="text-white" />
          </div>
          <h2 className="admin-login-title">Панель управления</h2>
          <p className="admin-login-sub">Введите пароль для входа</p>
          <input
            type="password"
            placeholder="Пароль"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && checkToken(tokenInput)}
            className="admin-input"
            autoFocus
          />
          {authError && (
            <p className="admin-error">
              <Icon name="AlertCircle" size={14} />
              {authError}
            </p>
          )}
          <button
            onClick={() => checkToken(tokenInput)}
            disabled={checking || !tokenInput}
            className="btn-admin-primary w-full mt-2"
          >
            {checking ? "Проверяю..." : "Войти"}
          </button>
        </div>
      </div>
    );
  }

  // ── Admin panel ────────────────────────────────
  return (
    <div className="admin-page">
      {/* Toast */}
      {toast && (
        <div className="admin-toast">
          <Icon name="CheckCircle" size={15} />
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="admin-header">
        <div className="flex items-center gap-3">
          <div className="admin-header-icon">
            <Icon name="LayoutDashboard" size={18} className="text-white" />
          </div>
          <div>
            <h1 className="admin-title">Панель управления</h1>
            <p className="admin-sub">Афиша мероприятий</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={startNew} className="btn-admin-primary">
            <Icon name="Plus" size={15} />
            Добавить
          </button>
          <button
            onClick={() => { sessionStorage.removeItem("admin_token"); setToken(""); }}
            className="btn-admin-ghost"
            title="Выйти"
          >
            <Icon name="LogOut" size={15} />
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="admin-form-card">
          <div className="admin-form-header">
            <h2 className="admin-form-title">
              {editId ? "Редактировать мероприятие" : "Новое мероприятие"}
            </h2>
            <button onClick={() => { setShowForm(false); setForm(EMPTY); setEditId(null); }} className="btn-admin-ghost">
              <Icon name="X" size={16} />
            </button>
          </div>

          <div className="admin-form-grid">
            <div className="admin-field col-span-2">
              <label>Название *</label>
              <input
                className="admin-input"
                placeholder="Название мероприятия"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="admin-field">
              <label>Дата *</label>
              <input
                type="date"
                className="admin-input"
                value={form.event_date}
                onChange={(e) => setForm({ ...form, event_date: e.target.value })}
              />
            </div>

            <div className="admin-field">
              <label>Время *</label>
              <input
                type="time"
                className="admin-input"
                value={form.event_time}
                onChange={(e) => setForm({ ...form, event_time: e.target.value })}
              />
            </div>

            <div className="admin-field col-span-2">
              <label>Описание</label>
              <textarea
                className="admin-input admin-textarea"
                placeholder="Краткое описание мероприятия"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="admin-field col-span-2">
              <label>Фото афиши (URL)</label>
              <input
                className="admin-input"
                placeholder="https://example.com/poster.jpg"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              />
            </div>

            <div className="admin-field">
              <label>Возрастное ограничение</label>
              <div className="age-selector">
                {AGE_OPTIONS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setForm({ ...form, age_restriction: form.age_restriction === a ? "" : a })}
                    className={`age-btn${form.age_restriction === a ? " age-btn-on" : ""}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className="admin-field">
              <label>Номер кассы</label>
              <input
                className="admin-input"
                placeholder="Касса №1, фойе 1 этажа"
                value={form.box_office}
                onChange={(e) => setForm({ ...form, box_office: e.target.value })}
              />
            </div>

            <div className="admin-field col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setForm({ ...form, is_online_sale: !form.is_online_sale })}
                  className={`admin-toggle${form.is_online_sale ? " admin-toggle-on" : ""}`}
                >
                  <div className="admin-toggle-thumb" />
                </div>
                <span>Онлайн-продажа билетов</span>
              </label>
            </div>

            {form.is_online_sale && (
              <div className="admin-field col-span-2">
                <label>Ссылка на покупку билета</label>
                <input
                  className="admin-input"
                  placeholder="https://timepad.ru/event/..."
                  value={form.ticket_url}
                  onChange={(e) => setForm({ ...form, ticket_url: e.target.value })}
                />
              </div>
            )}

            <div className="admin-field col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setForm({ ...form, is_active: !form.is_active })}
                  className={`admin-toggle${form.is_active ? " admin-toggle-on" : ""}`}
                >
                  <div className="admin-toggle-thumb" />
                </div>
                <span>Показывать на сайте</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={save} disabled={saving} className="btn-admin-primary">
              {saving ? "Сохраняю..." : editId ? "Сохранить изменения" : "Добавить мероприятие"}
            </button>
            <button onClick={() => { setShowForm(false); setForm(EMPTY); setEditId(null); }} className="btn-admin-ghost">
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Events list */}
      {loading ? (
        <div className="admin-loading">
          <div className="events-spinner" />
          <span>Загрузка...</span>
        </div>
      ) : events.length === 0 ? (
        <div className="admin-empty">
          <Icon name="CalendarOff" size={36} className="opacity-20 mb-2" />
          <p>Мероприятий пока нет</p>
          <button onClick={startNew} className="btn-admin-primary mt-3">
            <Icon name="Plus" size={14} /> Добавить первое
          </button>
        </div>
      ) : (
        <div className="admin-list">
          {events.map((e) => (
            <div key={e.id} className={`admin-event-row${!e.is_active ? " admin-event-inactive" : ""}`}>
              {e.image_url && (
                <img src={e.image_url} alt="" className="admin-event-thumb" />
              )}
              <div className="admin-event-info">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="admin-event-title">{e.title}</span>
                  {e.age_restriction && (
                    <span className="age-badge-sm">{e.age_restriction}</span>
                  )}
                  {!e.is_active && (
                    <span className="admin-hidden-badge">скрыто</span>
                  )}
                </div>
                <div className="admin-event-meta">
                  <span><Icon name="Calendar" size={12} />{e.event_date}</span>
                  <span><Icon name="Clock" size={12} />{e.event_time}</span>
                  {e.is_online_sale ? (
                    <span className="text-green-400"><Icon name="Ticket" size={12} />Онлайн</span>
                  ) : (
                    <span className="text-orange-400"><Icon name="MapPin" size={12} />Касса</span>
                  )}
                </div>
              </div>
              <div className="admin-event-actions">
                <button onClick={() => startEdit(e)} className="btn-admin-icon" title="Редактировать">
                  <Icon name="Pencil" size={14} />
                </button>
                {deleteId === e.id ? (
                  <div className="flex items-center gap-1">
                    <button onClick={() => remove(e.id!)} className="btn-admin-danger">Удалить?</button>
                    <button onClick={() => setDeleteId(null)} className="btn-admin-ghost p-1"><Icon name="X" size={12} /></button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteId(e.id!)} className="btn-admin-icon btn-admin-icon-del" title="Удалить">
                    <Icon name="Trash2" size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
