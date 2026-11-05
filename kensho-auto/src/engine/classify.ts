import type { Profile } from "../profile.js";
import { digits, norm, toHalfWidth } from "../lib/text.js";
import type { FieldInfo, FieldKey, FillAction, FillPlan, OptionInfo } from "./types.js";

type BaseKey =
  | "name" | "kana" | "zip" | "prefecture" | "city" | "street" | "building" | "address"
  | "phone" | "email" | "birth" | "age" | "gender" | "agree" | "newsletter" | "company";

interface Classified {
  field: FieldInfo;
  base: BaseKey | null;
  sub: "last" | "first" | "y" | "m" | "d" | null;
  hira: boolean;
}

const AUTOCOMPLETE: Record<string, [BaseKey, Classified["sub"]]> = {
  "family-name": ["name", "last"],
  "given-name": ["name", "first"],
  name: ["name", null],
  "postal-code": ["zip", null],
  "address-level1": ["prefecture", null],
  "address-level2": ["city", null],
  "address-line1": ["street", null],
  "address-line2": ["building", null],
  "street-address": ["address", null],
  tel: ["phone", null],
  "tel-national": ["phone", null],
  email: ["email", null],
  bday: ["birth", null],
  "bday-year": ["birth", "y"],
  "bday-month": ["birth", "m"],
  "bday-day": ["birth", "d"],
  sex: ["gender", null],
};

/** 優先度順のキーワードルール（同じテキスト内では上が優先） */
const RULES: [BaseKey, RegExp][] = [
  ["agree", /同意|規約|agree|consent|承諾|了承|privacy|プライバシー|terms|個人情報の取(り)?扱/],
  ["newsletter", /メルマガ|メールマガジン|newsletter|magazine|配信を希望|お知らせを受け取|案内を受け取/],
  ["email", /e-?mail|メール|mail_?addr|\bmail\b|mail\d|_mail|mail_/],
  ["kana", /kana|furigana|ruby|yomi|フリガナ|ふりがな|カナ|かな|ヨミ|よみ|^セイ$|^メイ$|セイ|メイ/],
  ["zip", /zip|postal|post_?code|postcode|post_?no|郵便|〒|yubin|yuubin/],
  ["prefecture", /pref|都道府県|prefecture|todofuken|\bstate\b/],
  ["phone", /\btel\b|tel\d|tel_|_tel|^tel|phone|電話|携帯番号|keitai|mobile/],
  ["birth", /birth|bday|生年月日|誕生日|birthday|seinengappi/],
  ["age", /年齢|年代|\bage\b|nenrei/],
  ["gender", /gender|\bsex\b|性別|seibetsu/],
  ["company", /company|会社|corp|法人|団体|勤務先|学校名/],
  ["building", /建物|マンション|ビル名|building|apartment|部屋番号|address-?line2|addr(ess)?_?3/],
  ["street", /番地|丁目|street|address-?line1|addr(ess)?_?2/],
  ["city", /市区町村|市町村|市区郡|\bcity\b|address-level2|addr(ess)?_?1/],
  ["address", /住所|address|addr|所在地|jusho|juusho/],
  ["name", /氏名|名前|お名前|^姓$|^名$|姓|shimei|namae|\bname\b|_name|name_|^name|sei|mei|first|last/],
];

const SUB_LAST = /(^|[^a-z])(sei|last|family|surname|lname)([^a-z]|$)|姓|苗字|名字|セイ|せい/;
const SUB_FIRST = /(^|[^a-z])(mei|first|given|fname)([^a-z]|$)|(?<![氏お姓])名(?!前)|メイ|めい/;
const SUB_Y = /(^|[^a-z])(year|yyyy|yy|_y)([^a-z]|$)|年(?!月)|^年$/;
const SUB_M = /(^|[^a-z])(month|mm|_m)([^a-z]|$)|(?<!年)月(?!日)|^月$/;
const SUB_D = /(^|[^a-z])(day|dd|date|_d)([^a-z]|$)|(?<!月)日|^日$/;

function matchRules(text: string): BaseKey | null {
  if (!text) return null;
  for (const [key, re] of RULES) if (re.test(text)) return key;
  return null;
}

function isHiraganaRequested(f: FieldInfo): boolean {
  const all = `${f.label} ${f.groupLabel} ${f.placeholder}`;
  if (/カタカナ|全角カナ|フリガナ|セイ|メイ/.test(all)) {
    if (/ひらがな/.test(all)) return true;
    return false;
  }
  if (/[ァ-ヶ]{2,}/.test(f.placeholder)) return false;
  if (/[ぁ-ゖ]{2,}/.test(f.placeholder)) return true;
  return /ひらがな|ふりがな|よみがな|かな/.test(all);
}

function classifyOne(f: FieldInfo): Classified {
  const ac = norm(f.autocomplete).split(/\s+/).pop() ?? "";
  const nameId = norm(`${f.name} ${f.id}`);
  const own = norm(`${f.label} ${f.placeholder}`);
  const group = norm(f.groupLabel);
  let base: BaseKey | null = null;
  let sub: Classified["sub"] = null;

  if (f.type === "checkbox") {
    // チェックボックスは同意系かメルマガ系のみ判定。それ以外はアンケート扱い
    const t = `${own} ${group} ${nameId}`;
    base = /メルマガ|メールマガジン|newsletter|magazine|配信を希望|お知らせを受け取|案内を受け取/.test(t)
      ? "newsletter"
      : /同意|規約|agree|consent|承諾|了承|privacy|プライバシー|terms|個人情報/.test(t)
        ? "agree"
        : null;
    return { field: f, base, sub: null, hira: false };
  }

  if (ac && ac !== "on" && ac !== "off" && AUTOCOMPLETE[ac]) {
    [base, sub] = AUTOCOMPLETE[ac];
  }
  if (!base) base = matchRules(nameId) ?? matchRules(own) ?? matchRules(group);
  // name属性が汎用（name="name1" 等）でも、ラベルがフリガナならカナを優先
  if (base === "name" && (matchRules(own) === "kana" || matchRules(group) === "kana")) base = "kana";
  if (base === "agree" || base === "newsletter") {
    // テキスト入力などで「同意」が見出しに出てくるだけのケースは無視
    base = null;
  }

  if (!sub && (base === "name" || base === "kana")) {
    for (const t of [nameId, own]) {
      const hasLast = SUB_LAST.test(t);
      const hasFirst = SUB_FIRST.test(t);
      if (hasLast && !hasFirst) { sub = "last"; break; }
      if (hasFirst && !hasLast) { sub = "first"; break; }
    }
  }
  if (!sub && base === "birth") sub = birthSub(f, nameId, own);
  // 生年月日グループ内の「年」「月」「日」だけの項目
  if (!base && /生年月日|誕生日|birth/.test(group)) {
    base = "birth";
    sub = birthSub(f, nameId, own);
  }
  return { field: f, base, sub, hira: base === "kana" && isHiraganaRequested(f) };
}

function birthSub(f: FieldInfo, nameId: string, own: string): Classified["sub"] {
  for (const t of [nameId, own]) {
    if (/年月日/.test(t)) continue;
    if (SUB_Y.test(t)) return "y";
    if (SUB_M.test(t)) return "m";
    if (SUB_D.test(t)) return "d";
  }
  if (f.tag === "select") return rangeSub(f.options);
  return null;
}

/** セレクトの選択肢の範囲から 年/月/日 を推定 */
function rangeSub(options: OptionInfo[]): Classified["sub"] {
  const nums = options.map((o) => numbersIn(`${o.text} ${o.value}`)).flat();
  if (!nums.length) return null;
  const max = Math.max(...nums);
  if (max >= 1900) return "y";
  if (max <= 12) return "m";
  if (max <= 31) return "d";
  return null;
}

function numbersIn(s: string): number[] {
  return (toHalfWidth(s).match(/\d+/g) ?? []).map(Number);
}

const PLACEHOLDER_OPTION = /選択|選んで|select|choose|^-+$|^—+$|^─+$|^$|^\*/;
const SAFE_OPTION = /どちらでもない|どちらとも|普通|ふつう|特になし|特にない|該当なし|わからない|分からない|回答しない|答えたくない/;
const RISKY_OPTION = /その他|other|自由記述|記入/;

function realOptions(options: OptionInfo[]): OptionInfo[] {
  return options.filter((o) => !o.disabled && !PLACEHOLDER_OPTION.test(norm(o.text)) && o.value !== "");
}

/** アンケート等で無難な選択肢を選ぶ */
export function pickSafeOption<T extends { text: string }>(options: T[]): T | null {
  if (!options.length) return null;
  const safe = options.find((o) => SAFE_OPTION.test(o.text));
  if (safe) return safe;
  const nonRisky = options.filter((o) => !RISKY_OPTION.test(norm(o.text)));
  const pool = nonRisky.length ? nonRisky : options;
  return pool[0];
}

function findOption(options: OptionInfo[], pred: (text: string, value: string) => boolean): OptionInfo | null {
  for (const o of realOptions(options)) if (pred(norm(o.text), norm(o.value))) return o;
  return null;
}

function numberOption(options: OptionInfo[], n: number): OptionInfo | null {
  return (
    findOption(options, (t) => numbersIn(t).includes(n)) ??
    findOption(options, (_t, v) => numbersIn(v).includes(n))
  );
}

function genderMatcher(g: Profile["gender"]): (t: string, v: string) => boolean {
  if (g === "female") return (t, v) => /女|female|woman/.test(t) || ["f", "female", "woman", "2"].includes(v) && !/男/.test(t);
  if (g === "male") return (t, v) => (/男/.test(t) || /^(male|man|men|m)$/.test(t) || ["m", "male", "man"].includes(v)) && !/女|female/.test(t);
  return (t) => /その他|回答しない|答えたくない|無回答|other/.test(t);
}

function ageMatches(text: string, age: number): boolean {
  const t = toHalfWidth(text);
  const nums = numbersIn(t);
  if (/代/.test(t) && nums.length === 1) return age >= nums[0] && age < nums[0] + 10;
  if (nums.length >= 2) return age >= nums[0] && age <= nums[1];
  if (nums.length === 1) {
    if (/以上|over|～$|〜$|~$/.test(t)) return age >= nums[0];
    if (/以下|未満|under|^[～〜~]/.test(t)) return /未満/.test(t) ? age < nums[0] : age <= nums[0];
    return age === nums[0];
  }
  return false;
}

/** 分割入力の形式に合わせた値を返す */
function formatZip(f: FieldInfo, p: Profile): string {
  const t = `${f.label} ${f.groupLabel} ${f.placeholder}`;
  if (/ハイフンなし|ハイフン不要|ハイフン無し|-なし/.test(t)) return p.zip7;
  if (f.maxLength && f.maxLength >= 8) return /-|－/.test(f.placeholder) ? p.zipHyphen : p.zip7;
  if (/ハイフンあり|ハイフン付|ハイフンを含/.test(t) || /\d{3}[-－]\d{4}/.test(toHalfWidth(f.placeholder))) return p.zipHyphen;
  return p.zip7;
}

function formatPhone(f: FieldInfo, p: Profile): string {
  const t = `${f.label} ${f.groupLabel} ${f.placeholder}`;
  if (/ハイフンなし|ハイフン不要|ハイフン無し|-なし/.test(t)) return p.phoneDigits;
  if (f.maxLength && f.maxLength <= 11) return p.phoneDigits;
  if (/ハイフンあり|ハイフン付|ハイフンを含/.test(t) || /\d+[-－]\d+[-－]\d+/.test(toHalfWidth(f.placeholder))) return p.phoneHyphen;
  return p.phoneDigits;
}

function formatBirthDate(f: FieldInfo, p: Profile): string {
  const y = p.birthYear;
  const m = p.birthMonth.padStart(2, "0");
  const d = p.birthDay.padStart(2, "0");
  if (f.type === "date") return `${y}-${m}-${d}`;
  const ph = toHalfWidth(f.placeholder);
  if (/\d{4}-\d{1,2}-\d{1,2}|yyyy-mm-dd/i.test(ph)) return `${y}-${m}-${d}`;
  if (/^\d{8}$/.test(ph) || /yyyymmdd/i.test(ph) || f.maxLength === 8) return `${y}${m}${d}`;
  if (/年/.test(ph)) return `${y}年${Number(m)}月${Number(d)}日`;
  return `${y}/${m}/${d}`;
}

/**
 * 分割入力（姓/名、郵便番号3-4、電話3分割、生年月日3分割）を、
 * 同じ種類の項目が並んでいることから推定して sub を割り当てる
 */
function assignPositional(items: Classified[]): void {
  const runs: Classified[][] = [];
  let current: Classified[] = [];
  let prevKey = "";
  for (const c of items) {
    if (c.field.type === "radio" || c.field.type === "checkbox" || !c.base) {
      if (current.length) runs.push(current);
      current = [];
      prevKey = "";
      continue;
    }
    const key = c.base;
    if (key === prevKey) current.push(c);
    else {
      if (current.length) runs.push(current);
      current = [c];
    }
    prevKey = key;
  }
  if (current.length) runs.push(current);

  for (const run of runs) {
    const base = run[0].base;
    const unsub = run.filter((c) => !c.sub);
    if ((base === "name" || base === "kana") && run.length === 2 && unsub.length) {
      run[0].sub = run[0].sub ?? "last";
      run[1].sub = run[1].sub ?? (run[0].sub === "first" ? "last" : "first");
    }
    if (base === "birth" && run.length === 3 && unsub.length) {
      const order: Classified["sub"][] = ["y", "m", "d"];
      run.forEach((c, i) => (c.sub = c.sub ?? order[i]));
    }
  }
}

/**
 * フォーム項目の一覧から、入力・選択・チェックの計画を立てる（純粋関数・テスト対象）
 */
export function planFill(fields: FieldInfo[], p: Profile): FillPlan {
  const items = fields.map(classifyOne);
  assignPositional(items);
  const actions: FillAction[] = [];
  const manualReasons: string[] = [];
  const hasPrefField = items.some((c) => c.base === "prefecture");
  const hasCityField = items.some((c) => c.base === "city");
  const hasStreetField = items.some((c) => c.base === "street");
  const hasBuildingField = items.some((c) => c.base === "building");
  const SEP = "　";

  // 同種の連続項目（zip / phone）のインデックス
  const runIndex = new Map<number, { pos: number; len: number }>();
  for (const base of ["zip", "phone"] as const) {
    let run: Classified[] = [];
    const flush = () => {
      run.forEach((c, i) => runIndex.set(c.field.idx, { pos: i, len: run.length }));
      run = [];
    };
    for (const c of items) {
      if (c.base === base && c.field.tag === "input") run.push(c);
      else if (run.length) flush();
    }
    if (run.length) flush();
  }

  const radioGroups = new Map<string, Classified[]>();
  const checkboxGroups = new Map<string, Classified[]>();

  const textValue = (c: Classified): [FieldKey, string] | null => {
    const f = c.field;
    switch (c.base) {
      case "name":
        if (c.sub === "last") return ["lastName", p.lastName];
        if (c.sub === "first") return ["firstName", p.firstName];
        return ["fullName", `${p.lastName}${SEP}${p.firstName}`];
      case "kana": {
        const [l, fi] = c.hira ? [p.lastNameHira, p.firstNameHira] : [p.lastNameKana, p.firstNameKana];
        if (c.sub === "last") return ["lastNameKana", l];
        if (c.sub === "first") return ["firstNameKana", fi];
        return ["fullNameKana", `${l}${SEP}${fi}`];
      }
      case "zip": {
        const r = runIndex.get(f.idx);
        if (r && r.len === 2) return r.pos === 0 ? ["zip1", p.zip1] : ["zip2", p.zip2];
        return ["zip", formatZip(f, p)];
      }
      case "phone": {
        const r = runIndex.get(f.idx);
        if (r && r.len === 3) return [(["phone1", "phone2", "phone3"] as const)[r.pos], p.phoneParts[r.pos]];
        return ["phone", formatPhone(f, p)];
      }
      case "email":
        return ["email", p.email];
      case "prefecture":
        return ["prefecture", p.prefecture];
      case "city":
        // 市区町村欄しかない場合は番地まで入れる
        return ["city", hasStreetField ? p.city : hasBuildingField ? `${p.city}${p.address1}` : `${p.city}${p.street}`];
      case "street":
        return ["street", hasBuildingField ? p.address1 : p.street];
      case "building":
        return ["building", p.address2 ?? ""];
      case "address": {
        let v = hasPrefField ? `${p.city}${p.street}` : p.fullAddress;
        if (hasCityField) v = hasBuildingField ? p.address1 : p.street;
        else if (hasBuildingField) v = hasPrefField ? `${p.city}${p.address1}` : `${p.prefecture}${p.city}${p.address1}`;
        return ["address", v];
      }
      case "birth":
        if (c.sub === "y") return ["birthYear", p.birthYear];
        if (c.sub === "m") return ["birthMonth", p.birthMonth];
        if (c.sub === "d") return ["birthDay", p.birthDay];
        return ["birthDate", formatBirthDate(f, p)];
      case "age":
        return ["age", String(p.age)];
      default:
        return null;
    }
  };

  for (const c of items) {
    const f = c.field;
    const label = (f.label || f.groupLabel || f.placeholder || f.name).slice(0, 40);
    if (f.type === "radio") {
      const g = radioGroups.get(f.name || `#${f.idx}`) ?? [];
      g.push(c);
      radioGroups.set(f.name || `#${f.idx}`, g);
      continue;
    }
    if (f.type === "checkbox") {
      if (c.base === "agree") {
        if (!f.checked) actions.push({ idx: f.idx, kind: "check", key: "agree" });
        continue;
      }
      if (c.base === "newsletter") continue; // 任意のメルマガ購読は触らない
      const key = f.name || `#${f.idx}`;
      const g = checkboxGroups.get(key) ?? [];
      g.push(c);
      checkboxGroups.set(key, g);
      continue;
    }
    if (f.type === "file") {
      if (f.required) manualReasons.push(`必須のファイル添付: ${label}`);
      continue;
    }

    if (f.tag === "select") {
      const opt = selectOption(c, p);
      if (opt) actions.push({ idx: f.idx, kind: "select", key: (c.base ?? "survey") as FieldKey, optionValue: opt.value });
      else if (c.base && f.required) manualReasons.push(`選択肢を決められない必須項目: ${label}`);
      continue;
    }

    const tv = textValue(c);
    if (tv && tv[1] !== "") {
      actions.push({ idx: f.idx, kind: "fill", key: tv[0], value: tv[1] });
      continue;
    }
    if (c.base === "building") continue;
    const required = f.required || /必須|\*|※/.test(`${f.label} ${f.groupLabel}`);
    if (required && !f.value) {
      manualReasons.push(
        f.tag === "textarea" || !c.base ? `必須の記述式設問: ${label}` : `自動入力できない必須項目: ${label}`,
      );
    }
  }

  for (const [, group] of radioGroups) {
    if (group.some((c) => c.field.checked)) continue;
    const isGender = group.some((c) => c.base === "gender");
    const opts = group.map((c) => ({ text: norm(`${c.field.label} ${c.field.value}`), c }));
    let chosen: (typeof opts)[number] | null = null;
    if (isGender) {
      const m = genderMatcher(p.gender);
      chosen = opts.find((o) => m(o.text, norm(o.c.field.value))) ?? null;
    } else if (group.some((c) => c.base === "age")) {
      chosen = opts.find((o) => ageMatches(o.text, p.age)) ?? null;
    }
    if (!chosen) chosen = pickSafeOption(opts);
    if (chosen) actions.push({ idx: chosen.c.field.idx, kind: "check", key: isGender ? "gender" : "survey" });
  }

  for (const [, group] of checkboxGroups) {
    const required =
      group.some((c) => c.field.required) || group.some((c) => /必須/.test(`${c.field.groupLabel}`));
    if (!required || group.some((c) => c.field.checked)) continue;
    const opts = group.map((c) => ({ text: norm(c.field.label || c.field.value), c }));
    const chosen = pickSafeOption(opts);
    if (chosen) actions.push({ idx: chosen.c.field.idx, kind: "check", key: "survey" });
  }

  return {
    actions,
    manualReasons,
    classified: items.map((c) => ({
      idx: c.field.idx,
      key: c.base ? `${c.base}${c.sub ? `:${c.sub}` : ""}${c.hira ? ":hira" : ""}` : "unknown",
      label: (c.field.label || c.field.groupLabel || c.field.name).slice(0, 40),
    })),
  };
}

function selectOption(c: Classified, p: Profile): OptionInfo | null {
  const f = c.field;
  const opts = realOptions(f.options);
  switch (c.base) {
    case "prefecture": {
      const short = p.prefecture.replace(/(都|府|県)$/, "");
      return findOption(f.options, (t) => t === p.prefecture || t === short || t.includes(p.prefecture));
    }
    case "birth": {
      const sub = c.sub ?? rangeSub(f.options);
      if (sub === "y") return numberOption(f.options, Number(p.birthYear));
      if (sub === "m") return numberOption(f.options, Number(p.birthMonth));
      if (sub === "d") return numberOption(f.options, Number(p.birthDay));
      return null;
    }
    case "gender":
      return findOption(f.options, genderMatcher(p.gender));
    case "age":
      return findOption(f.options, (t) => ageMatches(t, p.age));
    case "city":
    case "address":
      return findOption(f.options, (t) => p.city.includes(t) || t.includes(p.city));
    default: {
      // 既に有効な値が選ばれていればそのまま
      const selected = f.value && opts.some((o) => o.value === f.value);
      if (selected) return null;
      return pickSafeOption(opts);
    }
  }
}

export const __test = { classifyOne, digits };
