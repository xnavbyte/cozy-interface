import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import heroImg from "@/assets/sibirland-hero.jpg";
import joinImg from "@/assets/sibirland-join.jpg";

const SERVER_IP = "play.sibirland.fun";
const NEWS_API_URL = "https://api.sibihouse.ru/api/news";

type NewsItem = {
  cat: string;
  name: string;
  date: string;
  img: string;
  description?: string;
  video?: string;
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SibirLand — Minecraft-сервер снежной тайги" },
      {
        name: "description",
        content:
          "SibirLand — уютный Minecraft-сервер в снежной тайге: выживание, свои механики, новости и живое сообщество. IP: play.sibirland.fun",
      },
      { property: "og:title", content: "SibirLand — Minecraft-сервер снежной тайги" },
      {
        property: "og:description",
        content:
          "Холодная тайга, тёплое сообщество. Выживание, свои механики и активное сообщество.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

/* ---------- icons ---------- */
const PATHS: Record<string, React.ReactNode> = {
  pine: <path d="M12 2 7 9h3l-4 6h4l-3 5h10l-3-5h4l-4-6h3z" />,
  copy: (
    <>
      <rect x="8" y="8" width="13" height="13" rx="3" />
      <path d="M4 16a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2" />
    </>
  ),
  cal: (
    <>
      <path d="M8 2v4M16 2v4" />
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <path d="M3 10h18" />
    </>
  ),
  x: <path d="M18 6 6 18M6 6l12 12" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  chev: <path d="m6 9 6 6 6-6" />,
  axe: (
    <>
      <path d="M14 3 7 10l3 3 7-7z" />
      <path d="m10 13-7 7 2 2 7-7" />
      <path d="M14 3c3 0 6 2 7 5l-6 5" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2 2 2 0 1 1-4 0 1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 15a2 2 0 1 1 0-4 1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 4.2a2 2 0 1 1 4 0 1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l.1.1A1.7 1.7 0 0 0 21 11a2 2 0 1 1 0 4z" />
    </>
  ),
  send: <path d="m22 2-7 20-4-9-9-4z" />,
  book: (
    <>
      <path d="M4 4a2 2 0 0 1 2-2h14v18H6a2 2 0 0 0-2 2z" />
      <path d="M8 7h8M8 11h6" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v18h18" />
      <path d="m7 15 4-5 3 3 5-7" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
    </>
  ),
};

function I({ n, size = 20, className = "i" }: { n: string; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      {PATHS[n]}
    </svg>
  );
}

/* ---------- page ---------- */
function Index() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [online, setOnline] = useState<string>("Сервер онлайн");
  const [toasts, setToasts] = useState<{ id: number; title: string; sub: string | undefined }[]>([]);
  const toastId = useRef(0);

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "news" | "updates">("all");
  const [showAll, setShowAll] = useState(false);
  const [modal, setModal] = useState<NewsItem | null>(null);

  /* snow */
  useEffect(() => {
    const box = document.querySelector(".snow");
    if (!box) return;
    const n = window.innerWidth < 700 ? 26 : 55;
    for (let i = 0; i < n; i++) {
      const f = document.createElement("i");
      const s = 2 + Math.random() * 4;
      f.style.cssText = `left:${Math.random() * 100}vw;width:${s}px;height:${s}px;opacity:${
        0.25 + Math.random() * 0.5
      };--dx:${Math.random() * 80 - 40}px;animation-duration:${9 + Math.random() * 14}s;animation-delay:${-Math.random() * 20}s`;
      box.appendChild(f);
    }
    return () => {
      box.innerHTML = "";
    };
  }, []);

  /* server status */
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`https://api.mcsrvstat.us/3/${SERVER_IP}`);
        const d = await r.json();
        if (d?.online && d?.players) {
          setOnline(`${d.players.online} / ${d.players.max}`);
        }
      } catch {
        /* best effort */
      }
    })();
  }, []);

  /* news */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(NEWS_API_URL, { headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        if (Array.isArray(data)) setNews(data);
      } catch {
        /* keep empty */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* modal esc */
  useEffect(() => {
    if (!modal) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setModal(null);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [modal]);

  const toast = useCallback((title: string, sub?: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, title, sub }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  const copyIp = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(SERVER_IP);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = SERVER_IP;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    toast("IP скопирован", SERVER_IP);
  }, [toast]);

  const filtered = filter === "all" ? news : news.filter((n) => n.cat === filter);
  const visible = showAll ? filtered : filtered.slice(0, 9);

  return (
    <>
      <div className="snow" aria-hidden="true" />

      <header className="site-header">
        <div className="wrap">
          <div className="hd">
            <a href="#top" className="brand">
              <span className="mark">
                <I n="pine" />
              </span>
              <span>
                <b>SibirLand</b>
                <span className="sub">Snow survival</span>
              </span>
            </a>
            <nav className="main">
              <a href="#top">Главная</a>
              <a href="#about">О сервере</a>
              <a href="#join">Как зайти</a>
              <a href="#news">Новости</a>
              <a href="https://wiki.sibirland.fun/">Википедия</a>
              <a href="#faq">FAQ</a>
            </nav>
            <button className="burger" aria-label="Меню" onClick={() => setDrawerOpen((o) => !o)}>
              <I n="menu" />
            </button>
          </div>
          <div className={`drawer${drawerOpen ? " open" : ""}`} onClick={() => setDrawerOpen(false)}>
            <a href="#top">Главная</a>
            <a href="#about">О сервере</a>
            <a href="#join">Как зайти</a>
            <a href="#news">Новости</a>
            <a href="https://wiki.sibirland.fun/">Википедия</a>
            <a href="#faq">FAQ</a>
          </div>
        </div>
      </header>

      <main>
        <section className="hero" id="top">
          <img className="bg" src={heroImg} alt="Снежная тайга SibirLand ночью" width={1920} height={1080} />
          <div className="veil" />
          <div className="veil2" />
          <div className="aurora" aria-hidden="true" />

          <div className="wrap inner rise">
            <p className="kicker">Холодная тайга, тёплое сообщество</p>
            <h1 className="title">SibirLand</h1>
            <p className="lead">
              Уютный Minecraft-сервер о выживании в снежной тайге. Ванильная основа, аккуратные
              самописные механики и сообщество, где играют ради игры — без витрин и привилегий за
              деньги.
            </p>
            <div className="cta">
              <a className="btn ghost" href="https://t.me/SibirLandMC" target="_blank" rel="noreferrer">
                <I n="send" size={18} />
                Телеграм
              </a>
              <a className="btn ghost" href="https://wiki.sibirland.fun/" target="_blank" rel="noreferrer">
                <I n="book" size={18} />
                Википедия
              </a>
            </div>

            {/* Minecraft-style server list entry — click to copy */}
            <button className="servercard" onClick={copyIp} aria-label={`Скопировать IP сервера ${SERVER_IP}`}>
              <span className="hint">Нажми — IP скопируется</span>
              <span className="sicon">
                <I n="pine" size={26} />
              </span>
              <span className="sbody">
                <span className="sname">
                  <span className="dot" />
                  SibirLand · Snow Survival
                </span>
                <span className="smotd">Холодная тайга, тёплое сообщество · версия 1.21+</span>
                <span className="sip">
                  <I n="copy" size={14} />
                  {SERVER_IP}
                </span>
              </span>
              <span className="sside">
                <span className="count">
                  {online}
                  <small>онлайн</small>
                </span>
                <span className="ping" aria-hidden="true">
                  <i /><i /><i /><i /><i />
                </span>
              </span>
            </button>
          </div>
        </section>

        <section className="blk" id="about">
          <div className="wrap">
            <div className="head rise">
              <p className="kicker">про сервер</p>
              <h2>Выживание, которое не спешит</h2>
              <p>
                SibirLand держится за настоящую ваниль: никаких китов, кейсов и покупок. Всё, что у
                тебя есть, добыто руками — а сервер лишь добавляет удобства и атмосферы северного
                мира.
              </p>
            </div>
            <div className="grid3">
              <div className="card rise">
                <div className="ico">
                  <I n="axe" size={22} />
                </div>
                <h3>Честная ваниль</h3>
                <p>
                  Никакого доната и преимуществ за деньги. Прогресс строится только через игру,
                  торговлю и союзы с другими игроками.
                </p>
              </div>
              <div className="card rise" style={{ animationDelay: ".1s" }}>
                <div className="ico">
                  <I n="globe" size={22} />
                </div>
                <h3>Северная генерация</h3>
                <p>
                  Заснеженная тайга, замёрзшие реки, горные перевалы и редкие тёплые долины — мир,
                  который хочется исследовать пешком.
                </p>
              </div>
              <div className="card rise" style={{ animationDelay: ".2s" }}>
                <div className="ico">
                  <I n="gear" size={22} />
                </div>
                <h3>Свои механики</h3>
                <p>
                  Территории, командные чаты, удобные метки на карте и небольшие плагины,
                  написанные под наш сервер, а не скачанные пачкой.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="blk" id="join">
          <div className="wrap split">
            <div className="rise">
              <p className="kicker">как попасть</p>
              <h2
                style={{
                  fontFamily: "var(--display)",
                  fontWeight: 800,
                  letterSpacing: "-.03em",
                  fontSize: "clamp(1.8rem,4.4vw,2.9rem)",
                  marginTop: 10,
                  lineHeight: 1.1,
                }}
              >
                Три шага до первой ночи в тайге
              </h2>
              <p style={{ margin: "14px 0 26px", color: "var(--ink-2)", lineHeight: 1.75 }}>
                Вход свободный: лицензия не обязательна, заявки и очереди не нужны.
              </p>
              <div className="steps">
                <div className="step">
                  <span className="n">1</span>
                  <div>
                    <b>Скопируй адрес</b>
                    <p>Нажми на карточку сервера вверху страницы — IP сразу окажется в буфере обмена.</p>
                  </div>
                </div>
                <div className="step">
                  <span className="n">2</span>
                  <div>
                    <b>Добавь сервер в клиент</b>
                    <p>Minecraft 1.21 и выше, вкладка «Сетевая игра» → «Добавить сервер» → вставь адрес.</p>
                  </div>
                </div>
                <div className="step">
                  <span className="n">3</span>
                  <div>
                    <b>Загляни в Телеграм</b>
                    <p>Там новости, техработы и общение. Правила и гайды — в Википедии проекта.</p>
                  </div>
                </div>
              </div>
              <div className="cta" style={{ marginTop: 26 }}>
                <button className="btn primary" onClick={copyIp}>
                  <I n="copy" size={18} />
                  {SERVER_IP}
                </button>
                <a className="btn ghost" href="https://wiki.sibirland.fun/" target="_blank" rel="noreferrer">
                  Правила и гайды
                </a>
              </div>
            </div>
            <div className="shot rise" style={{ animationDelay: ".15s" }}>
              <img src={joinImg} alt="Снежная деревня SibirLand под северным сиянием" loading="lazy" width={1024} height={1024} />
            </div>
          </div>
        </section>

        <section className="blk" id="news">
          <div className="wrap">
            <div className="newshead rise">
              <div className="head" style={{ margin: 0 }}>
                <p className="kicker">что нового</p>
                <h2>Новости и обновления</h2>
              </div>
              <div className="tabs">
                {(
                  [
                    ["all", "Всё"],
                    ["news", "Новости"],
                    ["updates", "Обновления"],
                  ] as const
                ).map(([f, label]) => (
                  <button
                    key={f}
                    className={filter === f ? "active" : ""}
                    onClick={() => {
                      setFilter(f);
                      setShowAll(false);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="ngrid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div className="skel" key={i} />
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="empty">Пока тихо, как в зимнем лесу. Новости скоро появятся.</div>
            ) : (
              <div className="ngrid">
                {visible.map((item, i) => {
                  const upd = item.cat === "updates";
                  return (
                    <button
                      className="ncard rise"
                      style={{ animationDelay: `${i * 60}ms` }}
                      key={`${item.name}-${i}`}
                      onClick={() => setModal(item)}
                    >
                      <div className="thumb">
                        <img src={item.img} alt={item.name} loading="lazy" />
                        <span className={`tag${upd ? " upd" : ""}`}>{upd ? "Обновление" : "Новость"}</span>
                      </div>
                      <div className="body">
                        <h3>{item.name}</h3>
                        <div className="meta">
                          <I n="cal" size={14} />
                          <time>{item.date}</time>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {filtered.length > 9 && !showAll && !loading && (
              <div className="more">
                <button className="btn ghost" onClick={() => setShowAll(true)}>
                  Показать все новости
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="blk" id="links">
          <div className="wrap">
            <div className="head rise">
              <p className="kicker">ссылки проекта</p>
              <h2>Всё важное в одном месте</h2>
            </div>
            <div className="lgrid">
              <a className="lcard rise" href="https://t.me/SibirLandMC" target="_blank" rel="noreferrer">
                <span className="ico">
                  <I n="send" />
                </span>
                <span>
                  <b>Телеграм</b>
                  <span className="s">Новости сервера</span>
                </span>
              </a>
              <a className="lcard rise" style={{ animationDelay: ".07s" }} href="https://wiki.sibirland.fun/" target="_blank" rel="noreferrer">
                <span className="ico">
                  <I n="book" />
                </span>
                <span>
                  <b>Википедия</b>
                  <span className="s">Гайды и команды</span>
                </span>
              </a>
              <a className="lcard rise" style={{ animationDelay: ".14s" }} href="https://hotmc.ru/minecraft-server-289790" target="_blank" rel="noreferrer">
                <span className="ico">
                  <I n="chart" />
                </span>
                <span>
                  <b>Мониторинг</b>
                  <span className="s">Голосовать за сервер</span>
                </span>
              </a>
              <a className="lcard rise" style={{ animationDelay: ".21s" }} href="#news">
                <span className="ico">
                  <I n="users" />
                </span>
                <span>
                  <b>Сообщество</b>
                  <span className="s">Что происходит сейчас</span>
                </span>
              </a>
            </div>
          </div>
        </section>

        <section className="blk" id="faq">
          <div className="wrap">
            <div className="head rise">
              <p className="kicker">вопрос — ответ</p>
              <h2>Частые вопросы</h2>
            </div>
            <div className="faq">
              {[
                [
                  "Нужна ли лицензия Minecraft?",
                  "Нет. Зайти можно и с лицензионного, и с пиратского аккаунта — ник просто закрепляется за тобой при первом входе.",
                ],
                [
                  "Есть ли донат и привилегии за деньги?",
                  "Нет и не будет. Все игроки в равных условиях: никаких платных китов, кейсов, полётов и наборов ресурсов.",
                ],
                [
                  "Какая версия и как подключиться?",
                  "Сервер работает на 1.21 и выше. Адрес: play.sibirland.fun — добавь его в список серверов в клиенте.",
                ],
                [
                  "Есть ли приваты территорий?",
                  "Да, свои участки можно отметить и управлять ими. Но гриферство и воровство запрещены правилами даже вне защищённых зон.",
                ],
                [
                  "Бывают ли вайпы карты?",
                  "Полные вайпы мы не планируем. Обновления версии проводим так, чтобы сохранить постройки и прогресс игроков.",
                ],
                [
                  "Сервер работает круглосуточно?",
                  "Да, 24/7. Исключение — короткие технические работы и перезапуски, о которых заранее пишем в Телеграме.",
                ],
              ].map(([q, a]) => (
                <details key={q}>
                  <summary>
                    {q}
                    <I n="chev" className="i chev" />
                  </summary>
                  <div className="ans">{a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="ft">
          <div className="l">
            <I n="pine" size={16} />
            <b style={{ color: "var(--ink)" }}>SibirLand</b>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <nav>
            <a href="#about">О сервере</a>
            <a href="#join">Как зайти</a>
            <a href="#news">Новости</a>
            <a href="https://t.me/SibirLandMC">Телеграм</a>
            <a href="https://wiki.sibirland.fun/">Википедия</a>
            <a href="#faq">FAQ</a>
          </nav>
        </div>
      </footer>

      {modal && <NewsModal item={modal} onClose={() => setModal(null)} />}

      <div className="toasts">
        {toasts.map((t) => (
          <div className="toast" key={t.id}>
            {t.title}
            {t.sub && <small>{t.sub}</small>}
          </div>
        ))}
      </div>
    </>
  );
}

function ytEmbed(url: string) {
  const m = String(url).match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([\w-]{11})/);
  return m ? "https://www.youtube.com/embed/" + m[1] : null;
}

function NewsModal({ item, onClose }: { item: NewsItem; onClose: () => void }) {
  const upd = item.cat === "updates";
  const yt = item.video ? ytEmbed(item.video) : null;
  return (
    <div className="modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet">
        <button className="close" aria-label="Закрыть" onClick={onClose}>
          <I n="x" size={18} />
        </button>
        <div className="pad">
          <div className="rowmeta">
            <span className={`tag${upd ? " upd" : ""}`}>{upd ? "Обновление" : "Новость"}</span>
            <span>
              <I n="cal" size={14} /> {item.date}
            </span>
          </div>
          <h2>{item.name}</h2>
        </div>
        <div className="media">
          <img src={item.img} alt={item.name} />
        </div>
        {item.video && (
          <div className="vid">
            {yt ? (
              <iframe
                src={yt}
                title={item.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video src={item.video} controls />
            )}
          </div>
        )}
        <div className="pad">
          <p className="desc">{item.description}</p>
          <button className="btn primary" style={{ marginTop: 22 }} onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
