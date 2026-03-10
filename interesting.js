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
  if (typeValue === "project" || typeValue === "Project") return "Project";
  if (typeValue === "dailylog" || typeValue === "DailyLog") return "Daily Log";
  if (typeValue === "paper") return "Paper";
  if (typeValue === "video") return "Video";
  return "Note";
}

function normalizeTextList(value) {
  if (Array.isArray(value)) {
    return value
      .filter((entry) => typeof entry === "string")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }
  return [];
}

function isDailyLogItem(item) {
  return Boolean(item) && (item.type === "DailyLog" || Array.isArray(item.updates));
}

function getSortedUpdates(item) {
  if (!item || !Array.isArray(item.updates)) return [];
  return item.updates
    .filter((update) => update && typeof update === "object")
    .slice()
    .sort((a, b) => {
      const timeA = parseLocalDate(a.date)?.getTime() || 0;
      const timeB = parseLocalDate(b.date)?.getTime() || 0;
      return timeB - timeA;
    });
}

function getItemDisplayDate(item) {
  if (!item) return "";
  if (!isDailyLogItem(item)) return item.date;
  const latestDate = getSortedUpdates(item)[0]?.date;
  return latestDate || item.date;
}

function getDailyLogCardSummary(item) {
  const updates = getSortedUpdates(item);
  if (!updates.length) return item.summary || "还没有日志更新。";

  const latest = updates[0];
  const latestProgress = normalizeTextList(latest.progress)[0];
  const updateCount = `共 ${updates.length} 条更新`;
  if (latestProgress) {
    return `最新：${latestProgress}（${updateCount}）`;
  }
  return `已更新（${updateCount}）。`;
}

function getItemCardSummary(item) {
  if (isDailyLogItem(item)) return getDailyLogCardSummary(item);
  return item.summary || "暂无 summary";
}

function createLogGroup(titleText, entries, emptyText) {
  const group = document.createElement("section");
  group.className = "log-group";

  const title = document.createElement("h4");
  title.textContent = titleText;
  group.appendChild(title);

  if (!entries.length) {
    const empty = document.createElement("p");
    empty.className = "log-empty";
    empty.textContent = emptyText;
    group.appendChild(empty);
    return group;
  }

  const list = document.createElement("ul");
  list.className = "log-list";
  entries.forEach((entry) => {
    const line = document.createElement("li");
    line.textContent = entry;
    list.appendChild(line);
  });
  group.appendChild(list);
  return group;
}

function renderRegularDetailBlocks(detailNode, item) {
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

  detailNode.append(summaryBlock, thoughtBlock);
}

function renderDailyLogDetailBlocks(detailNode, item) {
  const updates = getSortedUpdates(item);

  const overviewBlock = document.createElement("section");
  overviewBlock.className = "section-block";
  const overviewTitle = document.createElement("h2");
  overviewTitle.textContent = "Log Overview";
  const overviewText = document.createElement("p");
  const latestDate = updates[0]?.date;
  overviewText.textContent =
    item.summary ||
    (latestDate
      ? `共 ${updates.length} 条日志，最近一次更新于 ${formatDate(latestDate)}。`
      : "这是一个持续更新的 daily log。");
  overviewBlock.append(overviewTitle, overviewText);

  const timelineBlock = document.createElement("section");
  timelineBlock.className = "section-block";
  const timelineTitle = document.createElement("h2");
  timelineTitle.textContent = "Daily Updates";
  timelineBlock.appendChild(timelineTitle);

  if (!updates.length) {
    const empty = document.createElement("p");
    empty.textContent = "还没有日志更新。";
    timelineBlock.appendChild(empty);
  } else {
    const timeline = document.createElement("div");
    timeline.className = "log-timeline";

    updates.forEach((update, index) => {
      const entry = document.createElement("article");
      entry.className = "log-entry";

      const head = document.createElement("div");
      head.className = "log-entry-head";

      const heading = document.createElement("h3");
      heading.textContent = formatDate(update.date) || "未标注日期";

      const seq = document.createElement("span");
      seq.className = "log-seq";
      seq.textContent = `#${updates.length - index}`;

      head.append(heading, seq);
      entry.appendChild(head);

      const progress = normalizeTextList(update.progress);
      const blockers = normalizeTextList(update.blockers);
      const next = normalizeTextList(update.next);

      entry.append(
        createLogGroup("Progress", progress, "暂无进展记录"),
        createLogGroup("Blockers", blockers, "暂无阻塞问题"),
        createLogGroup("Next", next, "暂无下一步计划")
      );

      timeline.appendChild(entry);
    });

    timelineBlock.appendChild(timeline);
  }

  detailNode.append(overviewBlock, timelineBlock);

  if (item.thoughts) {
    const thoughtBlock = document.createElement("section");
    thoughtBlock.className = "section-block";
    const thoughtTitle = document.createElement("h2");
    thoughtTitle.textContent = "Notes";
    const thoughtText = document.createElement("p");
    thoughtText.textContent = item.thoughts;
    thoughtBlock.append(thoughtTitle, thoughtText);
    detailNode.appendChild(thoughtBlock);
  }
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
      const timeA = parseLocalDate(getItemDisplayDate(a))?.getTime() || 0;
      const timeB = parseLocalDate(getItemDisplayDate(b))?.getTime() || 0;
      return timeB - timeA;
    })
    .forEach((item) => {
      const card = document.createElement("a");
      card.className = "feed-button";
      card.href = `interesting-detail.html?id=${encodeURIComponent(item.id)}`;

      const title = document.createElement("h3");
      title.textContent = item.title;

      const summary = document.createElement("p");
      summary.textContent = getItemCardSummary(item);

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
      date.textContent = formatDate(getItemDisplayDate(item));

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
  date.textContent = formatDate(getItemDisplayDate(item));

  meta.append(typeTag, domainTag, source, date);
  detailNode.append(title, meta);

  if (isDailyLogItem(item)) {
    renderDailyLogDetailBlocks(detailNode, item);
    return;
  }
  renderRegularDetailBlocks(detailNode, item);
}

renderListPage();
renderDetailPage();
runReveal();
