const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

const items = Array.isArray(window.interestingItems) ? window.interestingItems : [];

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

function formatDate(dateValue) {
  const date = parseLocalDate(dateValue);
  if (!date) return dateValue;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function parseLocalDate(dateValue) {
  if (typeof dateValue !== "string") return null;
  const matched = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!matched) {
    const fallback = new Date(dateValue);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }
  const yearNum = Number(matched[1]);
  const monthNum = Number(matched[2]) - 1;
  const dayNum = Number(matched[3]);
  const parsed = new Date(yearNum, monthNum, dayNum);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function createTagLabel(typeValue) {
  if (typeValue === "paper") return "Paper";
  if (typeValue === "video") return "Video";
  return "Note";
}

function renderListPage() {
  const listNode = document.getElementById("item-list");
  if (!listNode) return;

  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "还没有条目，先去 interesting-data.js 新增一条吧。";
    listNode.appendChild(empty);
    return;
  }

  items
    .slice()
    .sort((a, b) => {
      const timeA = parseLocalDate(a.date)?.getTime() || 0;
      const timeB = parseLocalDate(b.date)?.getTime() || 0;
      return timeB - timeA;
    })
    .forEach((item) => {
      const card = document.createElement("a");
      card.className = "feed-button";
      card.href = `interesting-detail.html?id=${encodeURIComponent(item.id)}`;

      const title = document.createElement("h3");
      title.textContent = item.title;

      const summary = document.createElement("p");
      summary.textContent = item.summary;

      const meta = document.createElement("div");
      meta.className = "meta-row";

      const typeTag = document.createElement("span");
      typeTag.className = "tag";
      typeTag.textContent = createTagLabel(item.type);

      const domainTag = document.createElement("span");
      domainTag.className = "tag";
      domainTag.textContent = item.tag || "General";

      const date = document.createElement("span");
      date.className = "meta-date";
      date.textContent = formatDate(item.date);

      meta.append(typeTag, domainTag, date);
      card.append(title, summary, meta);
      listNode.appendChild(card);
    });
}

function renderDetailPage() {
  const detailNode = document.getElementById("detail-view");
  if (!detailNode) return;

  const params = new URLSearchParams(window.location.search);
  const targetId = params.get("id");
  const item = items.find((entry) => entry.id === targetId);

  if (!item) {
    const title = document.createElement("h1");
    title.textContent = "未找到该条目";
    const text = document.createElement("p");
    text.textContent = "请返回列表页重新选择，或者检查链接参数是否正确。";
    detailNode.append(title, text);
    return;
  }

  const title = document.createElement("h1");
  title.textContent = item.title;

  const meta = document.createElement("div");
  meta.className = "meta-row";

  const typeTag = document.createElement("span");
  typeTag.className = "tag";
  typeTag.textContent = createTagLabel(item.type);

  const domainTag = document.createElement("span");
  domainTag.className = "tag";
  domainTag.textContent = item.tag || "General";

  const source = document.createElement("a");
  source.className = "meta-link";
  source.href = item.sourceUrl || "#";
  source.textContent = item.source || "Source";
  if (item.sourceUrl && item.sourceUrl !== "#") {
    source.target = "_blank";
    source.rel = "noreferrer";
  }

  const date = document.createElement("span");
  date.className = "meta-date";
  date.textContent = formatDate(item.date);

  meta.append(typeTag, domainTag, source, date);

  const summaryBlock = document.createElement("section");
  summaryBlock.className = "section-block";
  const summaryTitle = document.createElement("h2");
  summaryTitle.textContent = "Summary";
  const summaryText = document.createElement("p");
  summaryText.textContent = item.summary || "暂无 summary";
  summaryBlock.append(summaryTitle, summaryText);

  const thoughtBlock = document.createElement("section");
  thoughtBlock.className = "section-block";
  const thoughtTitle = document.createElement("h2");
  thoughtTitle.textContent = "My Thoughts";
  const thoughtText = document.createElement("p");
  thoughtText.textContent = item.thoughts || "暂无想法记录";
  thoughtBlock.append(thoughtTitle, thoughtText);

  detailNode.append(title, meta, summaryBlock, thoughtBlock);
}

renderListPage();
renderDetailPage();
runReveal();
