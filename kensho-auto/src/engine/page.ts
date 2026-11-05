import type { Frame, Page } from "playwright";
import type { FieldInfo, FillAction } from "./types.js";

const IDX_ATTR = "data-kensho-idx";

/**
 * ページ内のフォーム項目を収集する。最も項目の多い form を対象にする。
 * 返す情報はラベル等のメタデータのみ（入力済みの値はアンケート判定用の value / checked のみ）。
 */
export async function collectFields(page: Page | Frame): Promise<FieldInfo[]> {
  return page.evaluate((IDX_ATTR) => {
    const clean = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim();
    const isVisible = (el: Element) => {
      const he = el as HTMLElement;
      const style = getComputedStyle(he);
      if (style.display === "none" || style.visibility === "hidden") return false;
      return he.getClientRects().length > 0;
    };
    const textOf = (el: Element | null): string => {
      if (!el) return "";
      const clone = el.cloneNode(true) as HTMLElement;
      clone.querySelectorAll("input,select,textarea,option,script,style,button").forEach((n) => n.remove());
      return clean(clone.textContent);
    };
    const labelFor = (el: HTMLElement): string => {
      const parts: string[] = [];
      if (el.id) {
        document.querySelectorAll(`label[for="${CSS.escape(el.id)}"]`).forEach((l) => parts.push(textOf(l)));
      }
      const wrap = el.closest("label");
      if (wrap) parts.push(textOf(wrap));
      const aria = el.getAttribute("aria-label");
      if (aria) parts.push(aria);
      const lb = el.getAttribute("aria-labelledby");
      if (lb) lb.split(/\s+/).forEach((id) => parts.push(textOf(document.getElementById(id))));
      if (el.getAttribute("title")) parts.push(el.getAttribute("title")!);
      return clean(parts.filter(Boolean).join(" "));
    };
    const short = (s: string) => (s.length <= 60 ? s : "");
    const groupLabelFor = (el: HTMLElement): string => {
      const fs = el.closest("fieldset");
      const legend = fs?.querySelector("legend");
      if (legend) return textOf(legend);
      const tr = el.closest("tr");
      if (tr) {
        const th = tr.querySelector("th");
        if (th) return textOf(th);
        const prevTr = tr.previousElementSibling;
        if (prevTr && prevTr.querySelector("th") && !prevTr.querySelector("input,select,textarea")) {
          return textOf(prevTr);
        }
      }
      const dd = el.closest("dd");
      if (dd) {
        let p = dd.previousElementSibling;
        while (p && p.tagName !== "DT") p = p.previousElementSibling;
        if (p) return textOf(p);
      }
      // 祖先をさかのぼり、直前の兄弟要素の短いテキストを見出しとみなす
      let node: HTMLElement | null = el;
      for (let depth = 0; depth < 4 && node && node !== document.body; depth++) {
        let sib = node.previousElementSibling as HTMLElement | null;
        while (sib && !textOf(sib) && !sib.querySelector("input,select,textarea")) {
          sib = sib.previousElementSibling as HTMLElement | null;
        }
        if (sib && !sib.querySelector("input,select,textarea")) {
          const t = short(textOf(sib));
          if (t) return t;
        }
        node = node.parentElement;
      }
      return "";
    };

    const SELECTOR = "input, select, textarea";
    const forms = [...document.querySelectorAll("form")];
    let scope: ParentNode = document;
    if (forms.length) {
      const scored = forms
        .map((f) => ({
          f,
          n: [...f.querySelectorAll(SELECTOR)].filter((e) => {
            const t = (e as HTMLInputElement).type;
            return !["hidden", "submit", "button", "image", "reset", "search"].includes(t);
          }).length,
        }))
        .sort((a, b) => b.n - a.n);
      if (scored[0].n > 0) scope = scored[0].f;
    }

    const out: FieldInfo[] = [];
    let idx = 0;
    for (const el of scope.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(SELECTOR)) {
      const tag = el.tagName.toLowerCase() as FieldInfo["tag"];
      const type = tag === "input" ? ((el as HTMLInputElement).type || "text").toLowerCase() : tag;
      if (["hidden", "submit", "button", "image", "reset", "search", "password"].includes(type)) continue;
      if (el.disabled || (el as HTMLInputElement).readOnly) continue;
      const visible = isVisible(el);
      const isChoice = type === "radio" || type === "checkbox";
      // カスタムデザインのラジオ等は input 自体が非表示のことが多いので、ラベルが見えていれば対象
      if (!visible && !(isChoice && el.closest("label, li, div") && isVisible(el.closest("label, li, div")!))) {
        if (!isChoice) continue;
        const lab = el.id ? document.querySelector(`label[for="${CSS.escape(el.id)}"]`) : null;
        if (!lab || !isVisible(lab)) continue;
      }
      el.setAttribute(IDX_ATTR, String(idx));
      const options =
        tag === "select"
          ? [...(el as HTMLSelectElement).options].map((o) => ({ value: o.value, text: clean(o.text), disabled: o.disabled }))
          : [];
      const ml = (el as HTMLInputElement).maxLength;
      out.push({
        idx,
        tag,
        type,
        name: el.getAttribute("name") ?? "",
        id: el.id ?? "",
        placeholder: el.getAttribute("placeholder") ?? "",
        autocomplete: el.getAttribute("autocomplete") ?? "",
        label: labelFor(el),
        groupLabel: groupLabelFor(el),
        required: el.required || el.getAttribute("aria-required") === "true",
        maxLength: typeof ml === "number" && ml > 0 ? ml : null,
        options,
        // テキスト系の値は返さない（アンケート判定用に選択系のみ）
        value: isChoice || tag === "select" ? el.value : el.value ? "(filled)" : "",
        checked: isChoice ? (el as HTMLInputElement).checked : false,
        visible,
      });
      idx++;
    }
    return out;
  }, IDX_ATTR);
}

export async function applyActions(page: Page | Frame, actions: FillAction[]): Promise<void> {
  for (const a of actions) {
    const loc = page.locator(`[${IDX_ATTR}="${a.idx}"]`).first();
    try {
      if (a.kind === "fill") {
        await loc.fill(a.value, { timeout: 5000 });
        // blur で郵便番号→住所の自動補完などが走る
        await loc.dispatchEvent("change").catch(() => {});
        await loc.dispatchEvent("blur").catch(() => {});
      } else if (a.kind === "select") {
        await loc.selectOption(a.optionValue, { timeout: 5000 });
      } else {
        await loc.check({ timeout: 3000, force: true });
      }
    } catch {
      // 非表示のカスタムUI等：DOMを直接操作
      await loc
        .evaluate((el, a) => {
          const input = el as HTMLInputElement;
          if (a.kind === "check") {
            if (!input.checked) input.click();
            if (!input.checked) input.checked = true;
          } else if (a.kind === "fill") {
            input.value = a.value;
          } else {
            (el as HTMLSelectElement).value = a.optionValue;
          }
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }, a)
        .catch(() => {});
    }
  }
}

/** 自動補完スクリプトに上書きされた住所欄などを入れ直す */
export async function reapplyIfChanged(page: Page | Frame, actions: FillAction[]): Promise<void> {
  const keys = new Set(["prefecture", "city", "street", "building", "address"]);
  for (const a of actions) {
    if (!keys.has(a.key)) continue;
    const loc = page.locator(`[${IDX_ATTR}="${a.idx}"]`).first();
    const current = await loc.inputValue().catch(() => null);
    const expected = a.kind === "fill" ? a.value : a.kind === "select" ? a.optionValue : null;
    if (expected !== null && current !== null && current !== expected) await applyActions(page, [a]);
  }
}

export async function bodyText(page: Page): Promise<string> {
  return page
    .evaluate(() => (document.body?.innerText ?? "").replace(/\s+/g, " "))
    .catch(() => "");
}
