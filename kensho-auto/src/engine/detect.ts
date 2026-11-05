import type { Page } from "playwright";

/** 完了ページの判定キーワード */
export const COMPLETE_RE =
  /応募(が|を)?(完了|受け付け|受付(いた)?し|受付(が)?完了)|ご応募(いただき|頂き)?(まして|、)?(誠に)?ありがとう|ご?応募ありがとう|エントリー(が)?完了|ありがとうございました|受け付けました|受付(が|を)?完了|送信(が)?完了|送信しました|thank you for (your )?(entry|entering|applying|submission)|thanks for entering/i;

/** 締切済みの判定キーワード */
export const CLOSED_RE =
  /(応募|受付|募集|エントリー|キャンペーン)(の受付|期間)?(は|を)?(すでに|既に)?(終了|締め切|締切)(しました|いたしました|致しました|となりました|しております|させていただきました|り?ました)|(応募|受付|募集)期間(は|が)?終了|(本|この)キャンペーンは終了|キャンペーンは(終了|締め切)|this (campaign|promotion|sweepstakes) (has )?ended|entries are closed/i;

const SMS_RE = /SMS認証|SMSで(認証|送信)|認証コード|ワンタイムパスワード|確認コードを入力|ショートメッセージ|電話番号認証/i;
const LOGIN_RE = /ログインしてください|ログインが必要|ログイン後に|会員登録(が|後)|要ログイン|会員(の方)?限定|サインインしてください|please (log|sign) in/i;

export type Blocker = { kind: "captcha" | "login" | "sms"; reason: string };

/** CAPTCHA・ログイン・SMS認証の有無。見つかったら回避は試みず manual にする */
export async function detectBlocker(page: Page, opts: { formFieldCount: number }): Promise<Blocker | null> {
  const captcha = await page
    .evaluate(() => {
      const sel = [
        'iframe[src*="recaptcha"]',
        'iframe[src*="hcaptcha"]',
        'iframe[src*="challenges.cloudflare.com"]',
        'iframe[title*="reCAPTCHA"]',
        ".g-recaptcha",
        ".grecaptcha-badge",
        ".h-captcha",
        ".cf-turnstile",
        "[data-sitekey]",
        'script[src*="recaptcha"]',
        'script[src*="hcaptcha"]',
        'script[src*="turnstile"]',
        'img[src*="captcha" i]',
        'input[name*="captcha" i]',
      ];
      for (const s of sel) if (document.querySelector(s)) return s;
      if (/画像認証|画像に表示されている文字|私はロボットではありません|I'm not a robot/.test(document.body?.innerText ?? "")) {
        return "text";
      }
      return null;
    })
    .catch(() => null);
  if (captcha) return { kind: "captcha", reason: `CAPTCHA/reCAPTCHAあり（${captcha}）` };

  const hasPassword = await page
    .locator('input[type="password"]')
    .first()
    .isVisible()
    .catch(() => false);
  if (hasPassword) return { kind: "login", reason: "ログインが必要（パスワード欄あり）" };

  const text = await page.evaluate(() => document.body?.innerText ?? "").catch(() => "");
  if (SMS_RE.test(text)) return { kind: "sms", reason: "SMS・認証コードによる本人確認が必要" };
  if (LOGIN_RE.test(text) && opts.formFieldCount < 3) return { kind: "login", reason: "ログイン・会員登録が必要" };
  return null;
}

export function isComplete(text: string): boolean {
  return COMPLETE_RE.test(text);
}

export function isClosed(text: string): boolean {
  return CLOSED_RE.test(text);
}

/** 入力エラーの表示 */
export const VALIDATION_ERROR_RE =
  /(を|が)?(正しく)?入力してください|必須項目です|入力されていません|選択してください|正しくありません|入力内容に(誤り|エラー)|エラーがあります|is required|invalid/i;
