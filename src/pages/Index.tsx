import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";

const CATEGORIES = ["Все", "Новости", "Акции", "События", "Анонсы", "Полезное"];

const SORT_OPTIONS = [
  { label: "Новые", value: "date_desc", icon: "Clock" },
  { label: "Старые", value: "date_asc", icon: "CalendarDays" },
  { label: "Популярные", value: "likes_desc", icon: "Flame" },
];

interface Post {
  id: number;
  date: string;
  dateTs: number;
  category: string;
  title: string;
  text: string;
  image?: string;
  likes: number;
  comments: number;
  reposts: number;
  views: number;
}

const MOCK_POSTS: Post[] = [
  {
    id: 1,
    date: "30 марта 2026",
    dateTs: 1743289200,
    category: "Акции",
    title: "Скидка 40% на всё до конца месяца!",
    text: "Только сегодня и завтра — грандиозная распродажа. Не упустите шанс приобрести любимые товары с невероятной скидкой 40%. Акция ограничена по времени!",
    likes: 843,
    comments: 127,
    reposts: 210,
    views: 12400,
  },
  {
    id: 2,
    date: "29 марта 2026",
    dateTs: 1743202800,
    category: "События",
    title: "Открытие нового шоурума в центре города",
    text: "Мы рады сообщить об открытии нашего нового шоурума по адресу ул. Ленина, 15. Приходите, смотрите, трогайте — вас ждёт незабываемый опыт и подарки первым 50 гостям!",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
    likes: 512,
    comments: 89,
    reposts: 143,
    views: 8700,
  },
  {
    id: 3,
    date: "28 марта 2026",
    dateTs: 1743116400,
    category: "Новости",
    title: "Запускаем мобильное приложение",
    text: "Долгожданное обновление — теперь вы можете заказывать, отслеживать и управлять всем прямо с телефона. Приложение уже доступно в App Store и Google Play.",
    likes: 1205,
    comments: 234,
    reposts: 389,
    views: 24100,
  },
  {
    id: 4,
    date: "27 марта 2026",
    dateTs: 1743030000,
    category: "Полезное",
    title: "5 советов по выбору правильного продукта",
    text: "Наши эксперты подготовили исчерпывающий гайд, который поможет вам разобраться в ассортименте и выбрать именно то, что нужно. Читайте и сохраняйте!",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80",
    likes: 367,
    comments: 45,
    reposts: 98,
    views: 5900,
  },
  {
    id: 5,
    date: "26 марта 2026",
    dateTs: 1742943600,
    category: "Анонсы",
    title: "Готовится большое обновление — следите за новостями!",
    text: "Команда работает над чем-то особенным. Уже совсем скоро мы представим новинку, которая изменит ваш опыт. Подписывайтесь, чтобы узнать первыми.",
    likes: 692,
    comments: 156,
    reposts: 278,
    views: 15300,
  },
  {
    id: 6,
    date: "25 марта 2026",
    dateTs: 1742857200,
    category: "Новости",
    title: "Партнёрство с ведущими брендами страны",
    text: "Мы заключили стратегическое партнёрство с тремя крупнейшими игроками рынка. Это значит — больше выбора, лучшие цены и расширенная сервисная поддержка для вас.",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&q=80",
    likes: 289,
    comments: 67,
    reposts: 112,
    views: 7200,
  },
];

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "k";
  return String(n);
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Новости: { bg: "rgba(168,85,247,0.18)", text: "#c084fc" },
  Акции: { bg: "rgba(244,114,182,0.18)", text: "#f472b6" },
  События: { bg: "rgba(251,146,60,0.18)", text: "#fb923c" },
  Анонсы: { bg: "rgba(34,211,238,0.18)", text: "#22d3ee" },
  Полезное: { bg: "rgba(74,222,128,0.18)", text: "#4ade80" },
};

function PostCard({ post, index }: { post: Post; index: number }) {
  const [liked, setLiked] = useState(false);
  const catStyle = CATEGORY_COLORS[post.category] ?? { bg: "rgba(168,85,247,0.15)", text: "#a855f7" };

  return (
    <div
      className="card-hover gradient-border rounded-2xl bg-card p-5 animate-fade-in"
      style={{ animationDelay: `${index * 70}ms`, animationFillMode: "both" }}
    >
      {post.image && (
        <div className="overflow-hidden rounded-xl mb-4" style={{ height: 200 }}>
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      )}

      <div className="flex items-start justify-between gap-3 mb-3">
        <span
          className="tag-pill"
          style={{ background: catStyle.bg, color: catStyle.text }}
        >
          {post.category}
        </span>
        <span className="text-xs text-muted-foreground whitespace-nowrap pt-0.5">{post.date}</span>
      </div>

      <h3
        className="text-base font-bold leading-snug mb-2 text-foreground"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        {post.title}
      </h3>

      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
        {post.text}
      </p>

      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
        <button
          onClick={() => setLiked(!liked)}
          className="flex items-center gap-1.5 text-xs transition-all duration-200 hover:scale-110"
          style={{ color: liked ? "#f472b6" : "hsl(var(--muted-foreground))" }}
        >
          <Icon name="Heart" size={14} />
          {formatNumber(post.likes + (liked ? 1 : 0))}
        </button>
        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-cyan-400 transition-colors duration-200">
          <Icon name="MessageCircle" size={14} />
          {formatNumber(post.comments)}
        </button>
        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-green-400 transition-colors duration-200">
          <Icon name="Share2" size={14} />
          {formatNumber(post.reposts)}
        </button>
        <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
          <Icon name="Eye" size={12} />
          {formatNumber(post.views)}
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  const [activeCategory, setActiveCategory] = useState("Все");
  const [sortBy, setSortBy] = useState("date_desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let posts = [...MOCK_POSTS];

    if (activeCategory !== "Все") {
      posts = posts.filter((p) => p.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      posts = posts.filter(
        (p) => p.title.toLowerCase().includes(q) || p.text.toLowerCase().includes(q)
      );
    }

    if (dateFrom) {
      const from = new Date(dateFrom).getTime() / 1000;
      posts = posts.filter((p) => p.dateTs >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo).getTime() / 1000 + 86399;
      posts = posts.filter((p) => p.dateTs <= to);
    }

    if (sortBy === "date_desc") posts.sort((a, b) => b.dateTs - a.dateTs);
    if (sortBy === "date_asc") posts.sort((a, b) => a.dateTs - b.dateTs);
    if (sortBy === "likes_desc") posts.sort((a, b) => b.likes - a.likes);

    return posts;
  }, [activeCategory, sortBy, searchQuery, dateFrom, dateTo]);

  return (
    <div className="min-h-screen px-4 py-10 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #a855f7 0%, #22d3ee 100%)" }}
          >
            <Icon name="Rss" size={18} className="text-white" />
          </div>
          <h1
            className="text-3xl font-black tracking-tight neon-text"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            Новости
          </h1>
        </div>
        <p className="text-muted-foreground text-sm ml-[52px]">
          Все публикации сообщества ВКонтакте
        </p>
      </div>

      {/* Search + filter toggle */}
      <div className="flex gap-2 mb-4 animate-fade-in" style={{ animationDelay: "60ms", animationFillMode: "both" }}>
        <div className="relative flex-1">
          <Icon
            name="Search"
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="text"
            placeholder="Поиск по новостям..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 transition-colors duration-200"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="filter-btn px-3.5 py-2.5 rounded-xl bg-card text-sm flex items-center gap-2 text-foreground"
          style={
            showFilters
              ? { borderColor: "rgba(168,85,247,0.6)", background: "rgba(168,85,247,0.1)" }
              : {}
          }
        >
          <Icon name="SlidersHorizontal" size={15} />
          <span className="hidden sm:inline text-sm">Фильтры</span>
        </button>
      </div>

      {/* Date filters */}
      {showFilters && (
        <div className="bg-card border border-border rounded-2xl p-4 mb-4 animate-fade-in">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Период публикации
          </p>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1.5 block">От</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1.5 block">До</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(""); setDateTo(""); }}
              className="mt-3 text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
            >
              <Icon name="X" size={11} />
              Сбросить период
            </button>
          )}
        </div>
      )}

      {/* Categories */}
      <div className="flex gap-2 flex-wrap mb-3 animate-fade-in" style={{ animationDelay: "100ms", animationFillMode: "both" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`filter-btn px-3.5 py-1.5 rounded-xl text-sm font-medium bg-card text-foreground ${
              activeCategory === cat ? "active" : ""
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2 mb-6 animate-fade-in" style={{ animationDelay: "130ms", animationFillMode: "both" }}>
        <span className="text-xs text-muted-foreground">Сортировка:</span>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSortBy(opt.value)}
            className={`filter-btn flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-card text-foreground font-medium ${
              sortBy === opt.value ? "active" : ""
            }`}
          >
            <Icon name={opt.icon as "Clock"} size={12} />
            {opt.label}
          </button>
        ))}
      </div>

      {/* Count */}
      <div className="text-xs text-muted-foreground mb-5 animate-fade-in" style={{ animationDelay: "150ms", animationFillMode: "both" }}>
        Найдено{" "}
        <span className="font-semibold" style={{ color: "#a855f7" }}>
          {filtered.length}
        </span>{" "}
        публикаций
      </div>

      {/* Posts */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground animate-fade-in">
          <Icon name="SearchX" size={44} className="mx-auto mb-3 opacity-25" />
          <p className="text-sm font-medium">Ничего не найдено</p>
          <p className="text-xs mt-1 opacity-50">Попробуйте изменить фильтры</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>
      )}

      <div className="mt-12 text-center text-xs text-muted-foreground opacity-30">
        Лента синхронизируется с ВКонтакте
      </div>
    </div>
  );
}
