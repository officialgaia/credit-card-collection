import { digits, hiraToKata, kataToHira, toHalfWidth } from "./lib/text.js";

/** PROFILE_JSON の形式。値はログ・スクショ・コミットに出さないこと */
export interface RawProfile {
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  zip: string;
  prefecture: string;
  city: string;
  address1: string;
  address2?: string;
  phone: string;
  email: string;
  /** YYYY-MM-DD */
  birthDate: string;
  gender: "male" | "female" | "other";
}

export interface Profile extends RawProfile {
  fullName: string;
  fullNameKana: string;
  lastNameHira: string;
  firstNameHira: string;
  fullNameHira: string;
  zip7: string;
  zip1: string;
  zip2: string;
  zipHyphen: string;
  phoneDigits: string;
  phoneParts: [string, string, string];
  phoneHyphen: string;
  fullAddress: string;
  street: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  age: number;
}

const REQUIRED: (keyof RawProfile)[] = [
  "lastName", "firstName", "lastNameKana", "firstNameKana", "zip", "prefecture",
  "city", "address1", "phone", "email", "birthDate", "gender",
];

/** 電話番号を市外局番・市内局番・加入者番号に分ける（厳密ではないが懸賞フォームには十分） */
export function splitPhone(d: string): [string, string, string] {
  if (/^0[5789]0/.test(d) && d.length === 11) return [d.slice(0, 3), d.slice(3, 7), d.slice(7)];
  if (/^0120/.test(d)) return [d.slice(0, 4), d.slice(4, 7), d.slice(7)];
  if (/^0[36]/.test(d) && d.length === 10) return [d.slice(0, 2), d.slice(2, 6), d.slice(6)];
  if (d.length === 10) return [d.slice(0, 3), d.slice(3, 6), d.slice(6)];
  return [d.slice(0, 3), d.slice(3, 7), d.slice(7)];
}

export function buildProfile(raw: RawProfile, now = new Date()): Profile {
  const missing = REQUIRED.filter((k) => !raw[k]);
  if (missing.length) throw new Error(`PROFILE_JSON に必須項目がありません: ${missing.join(", ")}`);
  const zip7 = digits(raw.zip);
  if (zip7.length !== 7) throw new Error("PROFILE_JSON の zip は7桁で指定してください");
  const phoneDigits = digits(raw.phone);
  const phoneParts = splitPhone(phoneDigits);
  const bm = toHalfWidth(raw.birthDate).match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (!bm) throw new Error("PROFILE_JSON の birthDate は YYYY-MM-DD で指定してください");
  const [by, bmo, bd] = [Number(bm[1]), Number(bm[2]), Number(bm[3])];
  let age = now.getFullYear() - by;
  if (now.getMonth() + 1 < bmo || (now.getMonth() + 1 === bmo && now.getDate() < bd)) age--;
  const lastNameKana = hiraToKata(raw.lastNameKana);
  const firstNameKana = hiraToKata(raw.firstNameKana);
  const street = [raw.address1, raw.address2].filter(Boolean).join(" ");
  return {
    ...raw,
    lastNameKana,
    firstNameKana,
    fullName: `${raw.lastName} ${raw.firstName}`,
    fullNameKana: `${lastNameKana} ${firstNameKana}`,
    lastNameHira: kataToHira(lastNameKana),
    firstNameHira: kataToHira(firstNameKana),
    fullNameHira: kataToHira(`${lastNameKana} ${firstNameKana}`),
    zip7,
    zip1: zip7.slice(0, 3),
    zip2: zip7.slice(3),
    zipHyphen: `${zip7.slice(0, 3)}-${zip7.slice(3)}`,
    phoneDigits,
    phoneParts,
    phoneHyphen: phoneParts.join("-"),
    fullAddress: `${raw.prefecture}${raw.city}${street}`,
    street,
    birthYear: String(by),
    birthMonth: String(bmo),
    birthDay: String(bd),
    age,
  };
}

/** テスト・dry-run 用のダミープロフィール（実在しない値） */
export const DUMMY_PROFILE: RawProfile = {
  lastName: "懸賞",
  firstName: "太郎",
  lastNameKana: "ケンショウ",
  firstNameKana: "タロウ",
  zip: "100-0001",
  prefecture: "東京都",
  city: "千代田区",
  address1: "千代田1-1",
  address2: "テストハイツ101",
  phone: "090-0000-0000",
  email: "dummy@example.com",
  birthDate: "1990-04-15",
  gender: "male",
};

export function loadProfile(opts: { allowDummy: boolean }): { profile: Profile; dummy: boolean } {
  const json = process.env.PROFILE_JSON;
  if (!json) {
    if (!opts.allowDummy) throw new Error("環境変数 PROFILE_JSON が設定されていません");
    return { profile: buildProfile(DUMMY_PROFILE), dummy: true };
  }
  let raw: RawProfile;
  try {
    raw = JSON.parse(json);
  } catch {
    // 中身をエラーに含めない
    throw new Error("PROFILE_JSON がJSONとして読めません");
  }
  const profile = buildProfile(raw);
  maskInActions(profile);
  return { profile, dummy: false };
}

/** GitHub Actions のログに値が出ても伏字になるよう登録する */
function maskInActions(p: Profile): void {
  if (!process.env.GITHUB_ACTIONS) return;
  const values = new Set<string>();
  for (const v of Object.values(p)) {
    if (typeof v === "string" && v.length >= 2) values.add(v);
    if (Array.isArray(v)) v.forEach((x) => x.length >= 3 && values.add(x));
  }
  for (const v of values) process.stdout.write(`::add-mask::${v}\n`);
}
