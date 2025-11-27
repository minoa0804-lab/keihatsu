const tickerMessages = [
  "還付金詐欺の自動音声に注意：役所はATM操作を案内しません。",
  "キャッシュカードを預かるという連絡は100%詐欺です。",
  "SMSで警察や金融庁を騙る偽サイトが増えています。",
  "迷った瞬間に #9110。家族で声をかけ合いましょう。",
  "検察庁の偽サイトが確認されています、気を付けてください。",
  "電話がかかってきたら、まずは落ち着いて確認を。",
  "高額報酬を約束するバイトには注意してください。"
];

const topics = [
  "高松地方検察庁特殊詐欺防止啓発ページを公開しました",
  "ポスター、待受画面を公開しました。",
  "特殊詐欺体験型の啓発ゲームを公開しました。"
];

const posters = [
  {
    title: "その電話、なりすましかも（ブラックへんろちゃん）",
    image: "assets/poster-warning-01.jpg",
    alt: "ブラックへんろちゃんのポスター",
    download: "assets/poster-warning-01-a3.pdf",
    size: "A4 300dpi",
    tip: "自治会や会社の掲示板・商店街に最適"
  },
  {
    title: "この検察官、何かがおかしい",
    image: "assets/poster-atm-02.jpg",
    alt: "女性検察官が電話をかけていますが、何か検察官らしくない",
    download: "assets/poster-atm-02-a3.pdf",
    size: "A4 300dpi",
    tip: "自宅の電話機付近に掲示するのに最適"
  },
  {
    title: "その電話、あなたの人生を奪いに来る",
    image: "assets/poster-03.jpg",
    alt: "電話の対応をしている男性のポスター、背後には怪しく目の光る人物が",
    download: "assets/poster-03-a3.pdf",
    size: "A4 300dpi",
    tip: "公共施設・医療機関・役所向け"
  }
];

const wallpapers = [
  {
    id: "wp01",
    title: "こへんろちゃん",
    description: "検事を名乗る電話がかかってきたら、落ち着いて話を聞いてください。",
    category: "all",
    preview: "assets/wallpaper-kohenro-chan.jpg",
    downloads: {
      jpg: "assets/wallpaper-kohenro-chan.jpg",
      webp: "assets/wallpaper-kohenro-chan.webp"
    },
    tags: ["確認励行", "落ち着いて"]
  },
  {
    id: "wp02",
    title: "ダークへんろちゃん",
    description: "検事を名乗る電話先にいるのは、本当に検事でしょうか？",
    category: "all",
    preview: "assets/wallpaper-dark-kohenro.jpg",
    downloads: {
      jpg: "assets/wallpaper-dark-kohenro.jpg",
      webp: "assets/wallpaper-dark-kohenro.webp"
    },
    tags: ["怪しいと思ったら最寄りの検察庁へ", "＃9110に相談"]
  }
];

const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let prefersReducedMotion = reduceMotionQuery.matches;

const mediaHandler = event => {
  prefersReducedMotion = event.matches;
};

if (typeof reduceMotionQuery.addEventListener === "function") {
  reduceMotionQuery.addEventListener("change", mediaHandler);
} else if (typeof reduceMotionQuery.addListener === "function") {
  reduceMotionQuery.addListener(mediaHandler);
}

window.addEventListener("DOMContentLoaded", () => {
  initTicker();
  populateTopics();
  initPosters();
  initWallpapers();
  initNav();
  initAnimations();
  initBackToTop();
  setUpdateLabels();
});

function initTicker() {
  const ticker = document.getElementById("tickerMessage");
  if (!ticker || !tickerMessages.length) return;

  let index = 0;
  ticker.textContent = tickerMessages[index];

  if (tickerMessages.length < 2 || prefersReducedMotion) return;

  setInterval(() => {
    index = (index + 1) % tickerMessages.length;
    ticker.textContent = tickerMessages[index];
  }, 4500);
}

function populateTopics() {
  const list = document.getElementById("topicList");
  if (!list) return;

  topics.forEach(topic => {
    const li = document.createElement("li");
    li.textContent = topic;
    list.appendChild(li);
  });

  if (prefersReducedMotion || topics.length < 2) return;

  let current = 0;
  setInterval(() => {
    const items = [...list.children];
    items.forEach((item, idx) => item.classList.toggle("is-active", idx === current));
    current = (current + 1) % items.length;
  }, 5000);
}

function initPosters() {
  const figure = document.getElementById("posterFigure");
  const posterImg = figure?.querySelector("img");
  const posterTitle = figure?.querySelector(".poster-figure__title");
  const posterMeta = figure?.querySelector(".poster-figure__meta");
  const downloadBtn = document.getElementById("posterDownload");
  const shareBtn = document.getElementById("posterShare");
  const thumbsWrap = document.getElementById("posterThumbs");
  const controls = document.querySelectorAll(".poster-slider__control");
  if (!figure || !posterImg || !posterTitle || !posterMeta || !downloadBtn || !thumbsWrap) return;

  let current = 0;

  const renderPoster = index => {
    const poster = posters[index];
    if (!poster) return;
    posterImg.src = poster.image;
    posterImg.alt = poster.alt;
    posterTitle.textContent = poster.title;
    posterMeta.textContent = `${poster.size}｜${poster.tip}`;
    downloadBtn.href = poster.download;
    downloadBtn.setAttribute("download", poster.download.split("/").pop() || "poster.pdf");
    current = index;
    [...thumbsWrap.children].forEach((btn, btnIdx) => {
      btn.classList.toggle("is-active", btnIdx === current);
      btn.setAttribute("aria-selected", btnIdx === current ? "true" : "false");
    });
  };

  posters.forEach((poster, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "poster-thumb";
    button.innerHTML = `<img src="${poster.image}" alt="${poster.alt}" loading="lazy"><span>${poster.title}</span>`;
    button.addEventListener("click", () => renderPoster(index));
    thumbsWrap.appendChild(button);
  });

  controls.forEach(control => {
    control.addEventListener("click", () => {
      const direction = control.dataset.direction === "next" ? 1 : -1;
      const nextIndex = (current + direction + posters.length) % posters.length;
      renderPoster(nextIndex);
    });
  });

  shareBtn?.addEventListener("click", async () => {
    const poster = posters[current];
    if (!poster) return;
    const shareUrl = new URL(poster.download, document.baseURI).href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      shareBtn.textContent = "コピーしました";
      setTimeout(() => (shareBtn.textContent = "共有リンクをコピー"), 2000);
    } catch (error) {
      window.alert(`クリップボードにコピーできませんでした: ${shareUrl}`);
    }
  });

  renderPoster(0);
}

function initWallpapers() {
  const grid = document.getElementById("wallpaperGrid");
  const filterButtons = document.querySelectorAll(".filter__btn");
  if (!grid) return;

  const render = filter => {
    grid.innerHTML = "";
    const filtered = wallpapers.filter(wp => filter === "all" || wp.category === filter);
    if (!filtered.length) {
      const empty = document.createElement("p");
      empty.className = "note";
      empty.textContent = "該当する壁紙はありません。";
      grid.appendChild(empty);
      return;
    }

    filtered.forEach(wp => {
      const card = document.createElement("article");
      card.className = "card card--wallpaper";
      card.innerHTML = `
        <img src="${wp.preview}" alt="${wp.title}のプレビュー" width="360" height="640" loading="lazy">
        <div class="card-body">
          <h3>${wp.title}</h3>
          <p>${wp.description}</p>
          <ul class="tag-list">${wp.tags.map(tag => `<li>${tag}</li>`).join("")}</ul>
          <div class="download-row">
            <a class="btn btn--primary" href="${wp.downloads.jpg}" download>JPG</a>
            <a class="btn btn--ghost" href="${wp.downloads.webp}" download>WebP</a>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  };

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      filterButtons.forEach(btn => btn.classList.remove("is-active"));
      button.classList.add("is-active");
      render(button.dataset.filter || "all");
    });
  });

  render("all");
}

function initNav() {
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.getElementById("navMenu");

  navToggle?.addEventListener("click", () => {
    const isOpen = navMenu?.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
    document.body.classList.toggle("nav-open", Boolean(isOpen));
  });

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const target = document.querySelector(targetId);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
      navMenu?.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    });
  });

  initScrollSpy();
}

function initScrollSpy() {
  const sections = document.querySelectorAll("main section[id]");
  const links = document.querySelectorAll("[data-nav-link]");
  if (!sections.length || !links.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        links.forEach(link => {
          const target = link.getAttribute("href")?.replace("#", "");
          link.classList.toggle("is-active", target === id);
        });
      });
    },
    { rootMargin: "-45% 0px -45% 0px" }
  );

  sections.forEach(section => observer.observe(section));
}

function initAnimations() {
  const animated = document.querySelectorAll("[data-animate]");
  if (!animated.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  animated.forEach(el => observer.observe(el));
}

function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    btn.classList.toggle("is-visible", window.scrollY > 500);
  });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function setUpdateLabels() {
  const updateLabel = document.getElementById("updateLabel");
  const releaseLabel = document.getElementById("releaseLabel");
  const formatter = new Intl.DateTimeFormat("ja-JP", { dateStyle: "medium" });
  const now = formatter.format(new Date());
  if (updateLabel) updateLabel.textContent = `最終更新: ${now}`;
  if (releaseLabel) releaseLabel.textContent = `｜最新アップデート: ${now}`;
}
