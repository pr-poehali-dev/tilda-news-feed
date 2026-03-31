import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

interface Post {
  id: number;
  category: string;
  categoryColor: string;
  date: string;
  title: string;
  text: string;
  image: string;
  likes: number;
  comments: number;
  views: number;
}

const POSTS: Post[] = [
  {
    id: 1,
    category: "Акции",
    categoryColor: "#f472b6",
    date: "30 марта 2026",
    title: "Скидка 40% на всё до конца месяца",
    text: "Грандиозная распродажа — только сегодня и завтра. Не упустите шанс приобрести любимые товары с невероятной скидкой. Акция строго ограничена по времени.",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=85",
    likes: 843,
    comments: 127,
    views: 12400,
  },
  {
    id: 2,
    category: "События",
    categoryColor: "#fb923c",
    date: "29 марта 2026",
    title: "Открытие нового шоурума в центре города",
    text: "Мы рады сообщить об открытии нашего нового шоурума по адресу ул. Ленина, 15. Приходите — вас ждёт незабываемый опыт и подарки первым 50 гостям.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=85",
    likes: 512,
    comments: 89,
    views: 8700,
  },
  {
    id: 3,
    category: "Новости",
    categoryColor: "#c084fc",
    date: "28 марта 2026",
    title: "Запускаем мобильное приложение",
    text: "Долгожданное обновление — теперь вы можете заказывать, отслеживать и управлять всем прямо с телефона. Уже доступно в App Store и Google Play.",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&q=85",
    likes: 1205,
    comments: 234,
    views: 24100,
  },
  {
    id: 4,
    category: "Анонсы",
    categoryColor: "#22d3ee",
    date: "27 марта 2026",
    title: "Готовится большое обновление",
    text: "Команда работает над чем-то особенным. Уже совсем скоро мы представим новинку, которая изменит ваш опыт. Подписывайтесь, чтобы узнать первыми.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=85",
    likes: 692,
    comments: 156,
    views: 15300,
  },
  {
    id: 5,
    category: "Полезное",
    categoryColor: "#4ade80",
    date: "26 марта 2026",
    title: "5 советов по выбору правильного продукта",
    text: "Наши эксперты подготовили гайд, который поможет разобраться в ассортименте и выбрать именно то, что нужно. Читайте и сохраняйте!",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=85",
    likes: 367,
    comments: 45,
    views: 5900,
  },
];

function fmt(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + "k" : String(n);
}

const DURATION = 5000;

export default function Index() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [dir, setDir] = useState<"next" | "prev">("next");
  const [animating, setAnimating] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (idx: number, d: "next" | "prev") => {
      if (animating || idx === current) return;
      setAnimating(true);
      setDir(d);
      setPrev(current);
      setCurrent(idx);
      setProgress(0);
      setTimeout(() => {
        setPrev(null);
        setAnimating(false);
      }, 540);
    },
    [animating, current]
  );

  const next = useCallback(() => {
    go((current + 1) % POSTS.length, "next");
  }, [current, go]);

  const goTo = useCallback(
    (idx: number) => go(idx, idx > current ? "next" : "prev"),
    [current, go]
  );

  const startCycle = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    setProgress(0);
    const tick = 40;
    const step = (100 / DURATION) * tick;
    progressRef.current = setInterval(() => {
      setProgress((p) => Math.min(p + step, 100));
    }, tick);
    timerRef.current = setInterval(next, DURATION);
  }, [next]);

  useEffect(() => {
    if (!paused) startCycle();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [paused, startCycle]);

  const post = POSTS[current];
  const prevPost = prev !== null ? POSTS[prev] : null;

  const enterAnim = dir === "next" ? "slide-enter-next" : "slide-enter-prev";
  const exitAnim = dir === "next" ? "slide-exit-next" : "slide-exit-prev";

  return (
    <div className="min-h-screen p-6 flex items-start justify-center">
    <div className="w-full max-w-2xl">
    <div
      className="slider-root"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const d = touchX.current - e.changedTouches[0].clientX;
        if (Math.abs(d) > 48) go(d > 0 ? (current + 1) % POSTS.length : (current - 1 + POSTS.length) % POSTS.length, d > 0 ? "next" : "prev");
        touchX.current = null;
      }}
    >
      {/* Background layers */}
      {prevPost && (
        <div
          key={`bg-p-${prev}`}
          className="slide-bg"
          style={{ backgroundImage: `url(${prevPost.image})`, animationName: exitAnim }}
        />
      )}
      <div
        key={`bg-c-${current}`}
        className="slide-bg"
        style={{ backgroundImage: `url(${post.image})`, animationName: prev !== null ? enterAnim : "none" }}
      />
      <div className="slide-overlay" />
      <div className="slide-vignette" />

      {/* Top bar */}
      <div className="top-bar">
        <div className="top-logo">
          <Icon name="Rss" size={14} />
          <span>Новости</span>
        </div>

        {/* Story-style progress bars */}
        <div className="story-bars">
          {POSTS.map((_, i) => (
            <button key={i} className="story-bar" onClick={() => goTo(i)}>
              <div
                className="story-bar-fill"
                style={{
                  width: i < current ? "100%" : i === current ? `${progress}%` : "0%",
                }}
              />
            </button>
          ))}
        </div>

        <span className="slide-num">{current + 1}/{POSTS.length}</span>
      </div>

      {/* Slide content */}
      <div
        key={`ct-${current}`}
        className="slide-content"
        style={{ animationName: "content-rise" }}
      >
        <span
          className="cat-pill"
          style={{ color: post.categoryColor, borderColor: post.categoryColor + "50", background: post.categoryColor + "18" }}
        >
          {post.category}
        </span>

        <h2 className="slide-title">{post.title}</h2>
        <p className="slide-desc">{post.text}</p>

        <div className="slide-footer">
          <span className="slide-date">
            <Icon name="CalendarDays" size={12} />
            {post.date}
          </span>
          <div className="slide-stats">
            <span><Icon name="Heart" size={12} />{fmt(post.likes)}</span>
            <span><Icon name="MessageCircle" size={12} />{fmt(post.comments)}</span>
            <span><Icon name="Eye" size={12} />{fmt(post.views)}</span>
          </div>
        </div>
      </div>

      {/* Nav arrows */}
      <button className="arrow arrow-l" onClick={() => go((current - 1 + POSTS.length) % POSTS.length, "prev")}>
        <Icon name="ChevronLeft" size={20} />
      </button>
      <button className="arrow arrow-r" onClick={() => go((current + 1) % POSTS.length, "next")}>
        <Icon name="ChevronRight" size={20} />
      </button>

      {/* Dot indicators */}
      <div className="dots">
        {POSTS.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`dot${i === current ? " dot-on" : ""}`}
            style={i === current ? { background: post.categoryColor } : {}}
          />
        ))}
      </div>
    </div>
    </div>
    </div>
  );
}