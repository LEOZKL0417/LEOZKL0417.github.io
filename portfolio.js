const footerYear = document.getElementById("year");
if (footerYear) footerYear.textContent = new Date().getFullYear();

const albums = Array.isArray(window.photoAlbums) ? window.photoAlbums : [];

function parseLocalDate(dateValue) {
  if (typeof dateValue !== "string") return null;
  const matched = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!matched) return null;
  const yearNum = Number(matched[1]);
  const monthNum = Number(matched[2]) - 1;
  const dayNum = Number(matched[3]);
  const parsed = new Date(yearNum, monthNum, dayNum);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(dateValue) {
  const date = parseLocalDate(dateValue);
  if (!date) return dateValue || "";
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function runReveal() {
  const revealNodes = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    revealNodes.forEach((node) => node.classList.add("visible"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );

  revealNodes.forEach((node) => revealObserver.observe(node));
}

function renderAlbumListPage() {
  const grid = document.getElementById("album-grid");
  if (!grid) return;

  if (!albums.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "还没有相册，先去 portfolio-data.js 新增一组吧。";
    grid.appendChild(empty);
    return;
  }

  albums
    .slice()
    .sort((a, b) => {
      const timeA = parseLocalDate(a.date)?.getTime() || 0;
      const timeB = parseLocalDate(b.date)?.getTime() || 0;
      return timeB - timeA;
    })
    .forEach((album) => {
      const card = document.createElement("a");
      card.className = "album-card";
      card.href = `portfolio-album.html?id=${encodeURIComponent(album.id)}`;

      const imageWrap = document.createElement("div");
      imageWrap.className = "album-cover-wrap";
      const cover = document.createElement("img");
      cover.className = "album-cover";
      cover.src = album.coverSrc || "";
      cover.alt = album.coverAlt || album.title || "album cover";
      cover.loading = "lazy";
      imageWrap.appendChild(cover);

      const body = document.createElement("div");
      body.className = "album-body";

      const title = document.createElement("h3");
      title.textContent = album.title || "Untitled Album";

      const meta = document.createElement("p");
      meta.className = "album-meta";
      const photoCount = Array.isArray(album.photos) ? album.photos.length : 0;
      const parts = [
        album.location || "",
        formatDate(album.date),
        `${photoCount} 张`,
      ].filter(Boolean);
      meta.textContent = parts.join(" · ");

      const text = document.createElement("p");
      text.className = "album-text";
      text.textContent = album.text || "这组作品的文字说明。";

      body.append(title, meta, text);
      card.append(imageWrap, body);
      grid.appendChild(card);
    });
}

function renderAlbumDetailPage() {
  const hero = document.getElementById("album-hero");
  const viewer = document.getElementById("album-viewer");
  if (!hero || !viewer) return;

  const params = new URLSearchParams(window.location.search);
  const targetId = params.get("id");
  const album = albums.find((item) => item.id === targetId);

  if (!album) {
    hero.innerHTML = "<h1>未找到该相册</h1><p>请返回相册列表重新选择。</p>";
    viewer.innerHTML = "";
    return;
  }

  const photoCount = Array.isArray(album.photos) ? album.photos.length : 0;
  hero.textContent = "";

  const coverWrap = document.createElement("div");
  coverWrap.className = "album-hero-cover";
  const coverImage = document.createElement("img");
  coverImage.src = album.coverSrc || "";
  coverImage.alt = album.coverAlt || album.title || "album cover";
  coverWrap.appendChild(coverImage);

  const heroBody = document.createElement("div");
  heroBody.className = "album-hero-body";

  const kicker = document.createElement("p");
  kicker.className = "kicker";
  kicker.textContent = "Album Story";

  const title = document.createElement("h1");
  title.textContent = album.title || "Untitled Album";

  const meta = document.createElement("p");
  meta.className = "album-meta";
  meta.textContent = [album.location || "", formatDate(album.date), `${photoCount} 张`]
    .filter(Boolean)
    .join(" · ");

  const text = document.createElement("p");
  text.className = "album-text";
  text.textContent = album.text || "这组作品的文字说明。";

  heroBody.append(kicker, title, meta, text);
  hero.append(coverWrap, heroBody);

  if (!photoCount) {
    viewer.innerHTML = '<p class="empty-state">这个相册里还没有照片。</p>';
    return;
  }

  viewer.innerHTML = `
    <div class="viewer-head">
      <h2>Photo Stream</h2>
      <p id="slide-counter" class="viewer-counter"></p>
    </div>
    <div class="slider-shell">
      <button id="slide-prev" class="slide-nav" type="button" aria-label="上一张">←</button>
      <div id="slide-track" class="slide-track"></div>
      <button id="slide-next" class="slide-nav" type="button" aria-label="下一张">→</button>
    </div>
    <p id="slide-caption" class="slide-caption"></p>
  `;

  const track = document.getElementById("slide-track");
  const prevButton = document.getElementById("slide-prev");
  const nextButton = document.getElementById("slide-next");
  const counter = document.getElementById("slide-counter");
  const caption = document.getElementById("slide-caption");
  if (!track || !prevButton || !nextButton || !counter || !caption) return;

  album.photos.forEach((photo, index) => {
    const slide = document.createElement("figure");
    slide.className = "slide-item";
    slide.dataset.index = String(index);
    slide.dataset.caption = photo.caption || "";

    const image = document.createElement("img");
    image.className = "slide-image";
    image.src = photo.src || "";
    image.alt = photo.alt || album.title || `photo-${index + 1}`;
    image.loading = index === 0 ? "eager" : "lazy";

    slide.appendChild(image);
    track.appendChild(slide);
  });

  let currentIndex = 0;
  const slides = Array.from(track.querySelectorAll(".slide-item"));

  function updateControls(index) {
    currentIndex = index;
    counter.textContent = `${index + 1} / ${slides.length}`;
    caption.textContent = slides[index]?.dataset.caption || "";
    prevButton.disabled = index <= 0;
    nextButton.disabled = index >= slides.length - 1;
  }

  function scrollToSlide(index, smooth = true) {
    const target = slides[index];
    if (!target) return;
    target.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      inline: "start",
      block: "nearest",
    });
    updateControls(index);
  }

  function clampIndex(index) {
    if (index < 0) return 0;
    if (index > slides.length - 1) return slides.length - 1;
    return index;
  }

  prevButton.addEventListener("click", () => {
    scrollToSlide(clampIndex(currentIndex - 1));
  });

  nextButton.addEventListener("click", () => {
    scrollToSlide(clampIndex(currentIndex + 1));
  });

  let scrollTicking = false;
  track.addEventListener("scroll", () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(() => {
      const slideWidth = track.clientWidth;
      if (!slideWidth) {
        scrollTicking = false;
        return;
      }
      const index = clampIndex(Math.round(track.scrollLeft / slideWidth));
      updateControls(index);
      scrollTicking = false;
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      scrollToSlide(clampIndex(currentIndex - 1));
    }
    if (event.key === "ArrowRight") {
      scrollToSlide(clampIndex(currentIndex + 1));
    }
  });

  scrollToSlide(0, false);
}

renderAlbumListPage();
renderAlbumDetailPage();
runReveal();
