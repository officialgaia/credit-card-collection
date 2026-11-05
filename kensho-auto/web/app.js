"use strict";
/*
 * kensho-auto Webアプリ
 * - データは一切含まない静的サイト。GitHub API 経由で非公開リポジトリの data/*.json を読む
 * - トークンは localStorage にのみ保存
 */

const LS_KEY = "kensho-auto:config";
const WORKFLOW_FILE = "kensho-auto.yml";
const SOON_DAYS = 7;

const $ = (sel) => document.querySelector(sel);
const state = {
  cfg: null,
  campaigns: [],
  entries: [],
  lastRun: null,
  settings: { version: 1, sources: {} },
  sources: [],
  tab: "soon",
  query: "",
  method: "",
};

/* ---------- 設定 ---------- */
function loadCfg() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "null");
  } catch {
    return null;
  }
}
function saveCfg(cfg) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(cfg));
  } catch {
    toast("この端末では設定を保存できません（プライベートブラウズ等）");
  }
}

/* ---------- GitHub API ---------- */
function b64ToUtf8(b64) {
  const bin = atob(b64.replace(/\s/g, ""));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}
function utf8ToB64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

async function gh(path, opts = {}) {
  const { cfg } = state;
  const res = await fetch(`https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}${path}`, {
    ...opts,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${cfg.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(opts.body ? { "Content-Type": "application/json" } : {}),
      ...(opts.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const err = new Error(`GitHub API ${res.status}`);
    err.status = res.status;
    try {
      err.detail = (await res.json()).message;
    } catch {}
    throw err;
  }
  return res.status === 204 ? null : res.json();
}

const repoPath = (file) => `${state.cfg.dir ? `${state.cfg.dir.replace(/\/+$/, "")}/` : ""}${file}`;

async function getFile(file) {
  const meta = await gh(`/contents/${repoPath(file).split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(state.cfg.branch)}`);
  let text;
  if (meta.content) text = b64ToUtf8(meta.content);
  else {
    // 1MB 超は blob API で取得
    const blob = await gh(`/git/blobs/${meta.sha}`);
    text = b64ToUtf8(blob.content);
  }
  return { text, sha: meta.sha };
}

async function getJson(file, fallback) {
  try {
    const { text, sha } = await getFile(file);
    return { data: JSON.parse(text), sha };
  } catch (e) {
    if (e.status === 404) return { data: fallback, sha: null };
    throw e;
  }
}

/** JSON ファイルを読み→変更→書き込み（競合したら読み直してやり直す） */
async function updateJson(file, fallback, mutate, message) {
  for (let i = 0; i < 3; i++) {
    const { data, sha } = await getJson(file, fallback);
    const next = mutate(structuredClone(data));
    next.updatedAt = new Date().toISOString();
    try {
      await gh(`/contents/${repoPath(file).split("/").map(encodeURIComponent).join("/")}`, {
        method: "PUT",
        body: JSON.stringify({
          message,
          content: utf8ToB64(`${JSON.stringify(next, null, 2)}\n`),
          branch: state.cfg.branch,
          ...(sha ? { sha } : {}),
        }),
      });
      return next;
    } catch (e) {
      if (e.status !== 409 && e.status !== 422) throw e;
      await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
  throw new Error("書き込みが競合しました。少し待ってから再度お試しください");
}

async function dispatch(inputs) {
  await gh(`/actions/workflows/${WORKFLOW_FILE}/dispatches`, {
    method: "POST",
    body: JSON.stringify({ ref: state.cfg.branch, inputs }),
  });
}

/* ---------- URL 正規化（src/lib/url.ts と同じ規則） ---------- */
const TRACKING = [/^utm_/i, /^fbclid$/i, /^gclid$/i, /^yclid$/i, /^mc_(cid|eid)$/i, /^ref$/i, /^ref_src$/i, /^_ga$/i, /^s$/i, /^t$/i];
function normalizeUrl(input) {
  const u = new URL(input.trim());
  u.protocol = "https:";
  u.hostname = u.hostname.toLowerCase().replace(/^www\./, "").replace(/^mobile\./, "");
  if (u.hostname === "twitter.com") u.hostname = "x.com";
  u.hash = "";
  u.port = "";
  const params = [...u.searchParams.entries()]
    .filter(([k]) => !TRACKING.some((re) => re.test(k)))
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  u.search = "";
  for (const [k, v] of params) u.searchParams.append(k, v);
  let path = u.pathname.replace(/\/{2,}/g, "/").replace(/\/(index\.(html?|php))$/i, "/");
  if (path.length > 1) path = path.replace(/\/$/, "");
  u.pathname = path;
  return u.toString();
}
async function campaignId(url) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(normalizeUrl(url)));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

/* ---------- sources.yaml（id / name / enabled だけ読む簡易パーサ） ---------- */
function parseSources(yamlText) {
  const out = [];
  let cur = null;
  for (const raw of yamlText.split(/\r?\n/)) {
    const line = raw.replace(/\s+#.*$/, "");
    const item = line.match(/^\s*-\s+id:\s*["']?([^"'\s]+)["']?\s*$/);
    if (item) {
      cur = { id: item[1], name: item[1], type: "", enabled: true };
      out.push(cur);
      continue;
    }
    if (!cur) continue;
    const kv = line.match(/^\s+(name|type|enabled|url):\s*(.*)$/);
    if (!kv) continue;
    const v = kv[2].trim().replace(/^["']|["']$/g, "");
    if (kv[1] === "enabled") cur.enabled = v === "true";
    else cur[kv[1]] = v;
  }
  return out;
}

/* ---------- 表示用の計算 ---------- */
function todayJst() {
  return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
}
function daysUntil(date) {
  if (!date) return null;
  return Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${todayJst()}T00:00:00Z`)) / 86400e3);
}
function fmtDateTime(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
function safeHref(url) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:" ? u.href : null;
  } catch {
    return null;
  }
}

/** 懸賞 + 応募結果 を1行にまとめる */
function rows() {
  const entryById = new Map(state.entries.map((e) => [e.id, e]));
  const today = todayJst();
  const seen = new Set();
  const out = [];
  for (const c of state.campaigns) {
    seen.add(c.id);
    const e = entryById.get(c.id);
    let status = e ? e.status : "pending";
    let reason = e ? e.reason : null;
    // Web 以外（X・ハガキ等）で未処理のものは手動応募が必要
    if (!e && c.method !== "web") {
      status = "manual";
      reason = c.method === "x" ? "X キャンペーン（Xモジュール無効時は手動）" : "Web フォーム以外の応募方式";
    }
    if (!e && c.deadline && c.deadline < today) status = "closed";
    out.push({ ...c, status, reason, entry: e || null });
  }
  for (const e of state.entries) {
    if (seen.has(e.id)) continue;
    out.push({ id: e.id, url: e.url, title: e.title, deadline: null, prize: null, method: e.method, source: "-", addedAt: e.lastAttemptAt, status: e.status, reason: e.reason, entry: e });
  }
  return out;
}

const STATUS_LABEL = { success: "応募済み", failed: "失敗", manual: "要手動", closed: "締切済み", pending: "未処理" };
const TABS = [
  { id: "soon", label: "締切間近", match: (r) => !["success", "closed"].includes(r.status) && r.deadline && daysUntil(r.deadline) >= 0 && daysUntil(r.deadline) <= SOON_DAYS },
  { id: "manual", label: "要手動", match: (r) => r.status === "manual" },
  { id: "success", label: "応募済み", match: (r) => r.status === "success" },
  { id: "failed", label: "失敗", match: (r) => r.status === "failed" },
  { id: "pending", label: "未処理", match: (r) => r.status === "pending" },
  { id: "all", label: "すべて", match: () => true },
];

/* ---------- 描画 ---------- */
function el(tag, attrs = {}, ...children) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === "class") n.className = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? "" : v);
  }
  for (const c of children.flat()) if (c !== null && c !== undefined && c !== false) n.append(c instanceof Node ? c : String(c));
  return n;
}

function renderStats(all) {
  const today = todayJst();
  const count = (s) => all.filter((r) => r.status === s).length;
  const todaySuccess = state.entries.filter((e) => e.status === "success" && e.appliedAt && new Date(Date.parse(e.appliedAt) + 9 * 3600e3).toISOString().slice(0, 10) === today).length;
  const tried = count("success") + count("failed");
  const rate = tried ? Math.round((count("success") / tried) * 100) : null;
  const stats = [
    ["応募済み", count("success"), `今日 +${todaySuccess}`],
    ["要手動", count("manual"), null],
    ["失敗", count("failed"), rate === null ? null : `成功率 ${rate}%`],
    ["未処理", count("pending"), `全 ${all.length} 件`],
  ];
  $("#stats").replaceChildren(
    ...stats.map(([label, n, sub]) => el("div", { class: "stat" }, el("div", { class: "stat-n" }, n), el("div", { class: "stat-label" }, label), sub ? el("div", { class: "stat-sub" }, sub) : null)),
  );
  const lr = state.lastRun;
  $("#last-run").textContent = lr
    ? `${fmtDateTime(lr.at)}（${Object.entries(lr.summary || {}).map(([k, v]) => `${STATUS_LABEL[k] || k} ${v}`).join(" / ") || "対象なし"}）`
    : "まだ実行されていません";
}

function renderTabs(all) {
  $("#tabs").replaceChildren(
    ...TABS.map((t) =>
      el(
        "button",
        { type: "button", role: "tab", class: `tab${state.tab === t.id ? " active" : ""}`, "aria-selected": String(state.tab === t.id), onclick: () => { state.tab = t.id; render(); } },
        t.label,
        el("span", { class: "count" }, all.filter(t.match).length),
      ),
    ),
  );
}

function card(r) {
  const href = safeHref(r.url);
  const d = daysUntil(r.deadline);
  const deadline = r.deadline ? `締切 ${r.deadline.slice(5).replace("-", "/")}${d !== null && d >= 0 ? `（あと${d}日）` : ""}` : "締切不明";
  const host = (() => { try { return new URL(r.url).hostname; } catch { return ""; } })();
  const titleNode = el("div", { class: "card-title" }, r.title || r.url);

  const actions = el("div", { class: "card-actions" });
  if (href) actions.append(el("a", { class: "btn", href, target: "_blank", rel: "noopener noreferrer" }, r.status === "manual" ? "応募ページを開く" : "ページを開く"));
  if (r.status === "manual" || r.status === "failed" || r.status === "pending") {
    actions.append(el("button", { type: "button", class: "btn ghost", onclick: () => markDone(r) }, "応募済みにする"));
  }
  if (r.method === "web" && (r.status === "pending" || (r.status === "failed" && !r.entry?.submitted))) {
    actions.append(el("button", { type: "button", class: "btn ghost", onclick: () => runOne(r.url) }, "この懸賞だけ実行"));
  }

  const body = el(
    "details",
    { class: `card status-${r.status}` },
    el(
      "summary",
      {},
      el("div", { class: "card-head" }, el("span", { class: `badge ${r.status}` }, STATUS_LABEL[r.status] || r.status), el("span", { class: `badge method` }, r.method.toUpperCase()), el("span", { class: `deadline${d !== null && d <= 3 && d >= 0 ? " urgent" : ""}` }, deadline)),
      titleNode,
      r.reason ? el("div", { class: "card-reason" }, r.reason) : null,
    ),
    el(
      "dl",
      { class: "card-detail" },
      r.prize ? [el("dt", {}, "賞品"), el("dd", {}, r.prize)] : null,
      [el("dt", {}, "サイト"), el("dd", {}, host)],
      [el("dt", {}, "収集元"), el("dd", {}, r.source || "-")],
      r.entry ? [el("dt", {}, "最終処理"), el("dd", {}, `${fmtDateTime(r.entry.lastAttemptAt)}（${r.entry.attempts}回目）`)] : null,
      r.entry?.screenshot ? [el("dt", {}, "スクショ"), el("dd", {}, `Actions の artifact 内 ${r.entry.screenshot}`)] : null,
    ),
    actions,
  );
  // 要手動はタップで応募ページを開く
  if (r.status === "manual" && href) {
    titleNode.replaceWith(el("a", { class: "card-title link", href, target: "_blank", rel: "noopener noreferrer", onclick: (e) => e.stopPropagation() }, r.title || r.url, " ↗"));
  }
  return el("li", {}, body);
}

function render() {
  const all = rows();
  renderStats(all);
  renderTabs(all);
  const tab = TABS.find((t) => t.id === state.tab) || TABS[0];
  const q = state.query.trim().toLowerCase();
  const list = all
    .filter(tab.match)
    .filter((r) => !state.method || r.method === state.method)
    .filter((r) => !q || `${r.title} ${r.url} ${r.prize || ""} ${r.reason || ""}`.toLowerCase().includes(q))
    .sort((a, b) => (a.deadline || "9999").localeCompare(b.deadline || "9999") || (b.addedAt || "").localeCompare(a.addedAt || ""));
  $("#list").replaceChildren(...list.slice(0, 300).map(card));
  $("#empty").hidden = list.length > 0;
  renderSources();
}

function renderSources() {
  if (!state.sources.length) {
    $("#sources").replaceChildren(el("li", { class: "muted small" }, "sources.yaml に収集元がありません"));
    return;
  }
  $("#sources").replaceChildren(
    ...state.sources.map((s) => {
      const on = state.settings.sources?.[s.id] ?? s.enabled;
      return el(
        "li",
        {},
        el("label", { class: "switch" },
          el("input", { type: "checkbox", checked: on, onchange: (e) => toggleSource(s.id, e.target.checked, e.target) }),
          el("span", {}, s.name || s.id, el("span", { class: "muted small" }, ` ${s.type || ""}`)),
        ),
      );
    }),
  );
}

async function renderRuns() {
  try {
    const res = await gh(`/actions/workflows/${WORKFLOW_FILE}/runs?per_page=3`);
    $("#runs").replaceChildren(
      ...res.workflow_runs.map((run) => {
        const st = run.status === "completed" ? (run.conclusion === "success" ? "✓ 完了" : `✗ ${run.conclusion}`) : run.status === "in_progress" ? "● 実行中" : "○ 待機中";
        const href = safeHref(run.html_url);
        return el("li", {}, el("span", {}, `${fmtDateTime(run.created_at)} ${run.event === "schedule" ? "定期" : "手動"}`), href ? el("a", { href, target: "_blank", rel: "noopener noreferrer" }, st) : st);
      }),
    );
  } catch {
    $("#runs").replaceChildren();
  }
}

/* ---------- 操作 ---------- */
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 3500);
}

function explain(e) {
  if (e.status === 401) return "トークンが無効です。設定から入れ直してください";
  if (e.status === 403) return `権限が足りません（${e.detail || "403"}）。PAT の権限を確認してください`;
  if (e.status === 404) return "リポジトリ／ファイル／ワークフローが見つかりません。設定とブランチを確認してください";
  return e.message + (e.detail ? `: ${e.detail}` : "");
}

async function loadAll() {
  $("#btn-reload").disabled = true;
  try {
    const [c, e, s, src] = await Promise.all([
      getJson("data/campaigns.json", { campaigns: [] }),
      getJson("data/entries.json", { entries: [], lastRun: null }),
      getJson("data/settings.json", { version: 1, sources: {} }),
      getFile("sources.yaml").then((f) => f.text).catch(() => ""),
    ]);
    state.campaigns = c.data.campaigns || [];
    state.entries = e.data.entries || [];
    state.lastRun = e.data.lastRun || null;
    state.settings = s.data;
    state.sources = parseSources(src);
    render();
    renderRuns();
    return true;
  } catch (err) {
    toast(explain(err));
    return false;
  } finally {
    $("#btn-reload").disabled = false;
  }
}

async function runNow() {
  const dry = $("#run-dry").checked;
  if (!dry && !confirm("今すぐ応募を実行しますか？")) return;
  try {
    await dispatch({ dry_run: dry });
    toast(dry ? "dry-run を開始しました" : "実行を開始しました（数分かかります）");
    setTimeout(renderRuns, 4000);
  } catch (e) {
    toast(explain(e));
  }
}

async function runOne(url) {
  if (!confirm("この懸賞だけ応募を実行しますか？")) return;
  try {
    await dispatch({ url, dry_run: false, skip_collect: true });
    toast("実行を開始しました");
    setTimeout(renderRuns, 4000);
  } catch (e) {
    toast(explain(e));
  }
}

async function markDone(r) {
  if (!confirm("手動で応募済みとして記録しますか？")) return;
  try {
    const now = new Date().toISOString();
    const next = await updateJson(
      "data/entries.json",
      { version: 1, updatedAt: now, lastRun: null, entries: [] },
      (f) => {
        const prev = f.entries.find((x) => x.id === r.id);
        const e = { id: r.id, url: r.url, title: r.title, method: r.method, status: "success", reason: "手動で応募", attempts: prev ? prev.attempts : 0, submitted: true, lastAttemptAt: now, appliedAt: now, screenshot: prev ? prev.screenshot : null };
        f.entries = f.entries.filter((x) => x.id !== r.id).concat(e);
        return f;
      },
      `kensho-auto: 手動で応募済み ${r.id}`,
    );
    state.entries = next.entries;
    render();
    toast("応募済みにしました");
  } catch (e) {
    toast(explain(e));
  }
}

async function addUrl(ev) {
  ev.preventDefault();
  const form = ev.target;
  const fd = new FormData(form);
  const msg = $("#add-msg");
  let url;
  try {
    url = new URL(String(fd.get("url")).trim()).href;
  } catch {
    msg.textContent = "URL が正しくありません";
    return;
  }
  const id = await campaignId(url);
  let method = String(fd.get("method"));
  if (method === "auto") method = /^(www\.|mobile\.)?(x|twitter)\.com$/.test(new URL(url).hostname) ? "x" : "web";
  const campaign = {
    id,
    url,
    title: String(fd.get("title") || "").trim() || new URL(url).hostname,
    deadline: fd.get("deadline") || null,
    prize: String(fd.get("prize") || "").trim() || null,
    method,
    source: "manual",
    addedAt: new Date().toISOString(),
  };
  msg.textContent = "追加中…";
  form.querySelector("button[type=submit]").disabled = true;
  try {
    let duplicate = false;
    const next = await updateJson(
      "data/campaigns.json",
      { version: 1, updatedAt: "", campaigns: [] },
      (f) => {
        duplicate = f.campaigns.some((c) => c.id === id);
        if (!duplicate) f.campaigns.push(campaign);
        return f;
      },
      `kensho-auto: URL を手動追加 ${id}`,
    );
    state.campaigns = next.campaigns;
    render();
    msg.textContent = duplicate ? "この懸賞はすでに登録されています" : "追加しました";
    if (!duplicate && fd.get("now") && method === "web") {
      await dispatch({ url, dry_run: false, skip_collect: true });
      msg.textContent = "追加して応募を開始しました";
    }
    if (!duplicate) form.reset();
  } catch (e) {
    msg.textContent = explain(e);
  } finally {
    form.querySelector("button[type=submit]").disabled = false;
  }
}

async function toggleSource(id, on, input) {
  input.disabled = true;
  try {
    const next = await updateJson(
      "data/settings.json",
      { version: 1, sources: {} },
      (f) => {
        f.sources = { ...(f.sources || {}), [id]: on };
        return f;
      },
      `kensho-auto: 収集元 ${id} を${on ? "オン" : "オフ"}`,
    );
    state.settings = next;
    toast(`${id} を${on ? "オン" : "オフ"}にしました`);
  } catch (e) {
    input.checked = !on;
    toast(explain(e));
  } finally {
    input.disabled = false;
  }
}

/* ---------- 画面切り替え ---------- */
function showSetup(err) {
  $("#app").hidden = true;
  $("#setup").hidden = false;
  $("#btn-reload").hidden = true;
  const form = $("#setup-form");
  const cfg = state.cfg || loadCfg();
  if (cfg) {
    for (const k of ["owner", "repo", "branch", "dir"]) if (cfg[k] !== undefined) form.elements[k].value = cfg[k];
    $("#btn-forget").hidden = false;
    $("#btn-settings").hidden = false;
    if (cfg.token) {
      form.elements.token.required = false;
      form.elements.token.placeholder = "保存済み（変更する場合のみ入力）";
    }
  }
  $("#setup-error").textContent = err || "";
}

async function showApp() {
  $("#setup").hidden = true;
  $("#app").hidden = false;
  $("#btn-reload").hidden = false;
  $("#btn-settings").hidden = false;
  const ok = await loadAll();
  if (!ok && state.campaigns.length === 0) showSetup("読み込みに失敗しました。設定を確認してください");
}

function init() {
  $("#setup-form").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const f = ev.target.elements;
    const cfg = {
      owner: f.owner.value.trim(),
      repo: f.repo.value.trim(),
      branch: f.branch.value.trim() || "main",
      dir: f.dir.value.trim(),
      token: f.token.value.trim() || state.cfg?.token || "",
    };
    state.cfg = cfg;
    try {
      await gh("");
    } catch (e) {
      $("#setup-error").textContent = explain(e);
      return;
    }
    saveCfg(cfg);
    f.token.value = "";
    showApp();
  });
  $("#btn-forget").addEventListener("click", () => {
    if (!confirm("この端末からトークンと設定を削除しますか？")) return;
    try {
      localStorage.removeItem(LS_KEY);
    } catch {}
    state.cfg = null;
    location.reload();
  });
  $("#btn-settings").addEventListener("click", () => ($("#setup").hidden ? showSetup() : showApp()));
  $("#btn-reload").addEventListener("click", loadAll);
  $("#btn-run").addEventListener("click", runNow);
  $("#add-form").addEventListener("submit", addUrl);
  $("#search").addEventListener("input", (e) => {
    state.query = e.target.value;
    render();
  });
  $("#filter-method").addEventListener("change", (e) => {
    state.method = e.target.value;
    render();
  });

  state.cfg = loadCfg();
  if (state.cfg?.token) showApp();
  else showSetup();
}

init();
