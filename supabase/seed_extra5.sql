-- =============================================================
-- seed_extra5.sql  追加カード 第5弾（2026年6月時点の参考値・要公式確認）
--   slug で ON CONFLICT DO NOTHING のため重複しない。
--   ビジネスカードには末尾の UPDATE で business=true を付与。
-- =============================================================
insert into public.cards
  (slug, name, issuer, brands, tier, annual_fee, annual_fee_note,
   base_reward_rate, reward_note, point_program,
   priority_pass, priority_pass_note, airport_lounge,
   travel_insurance, travel_insurance_amount,
   shopping_insurance, concierge, touch_payment, numberless,
   eligibility, official_url)
values
  ('amex-business-green', 'アメリカン・エキスプレス・ビジネス・グリーン・カード', 'アメリカン・エキスプレス', '{amex}', '一般', 13200, '月会費制（年間13200円）',
   1.00, '経費管理・ビジネス優待', 'メンバーシップ・リワード',
   'なし', '空港ラウンジ同伴1名無料', true, '利用付帯', '最高5000万円', true, false, true, false,
   '20歳以上の法人代表者・個人事業主', 'https://www.americanexpress.com/ja-jp/'),

  ('amex-business-gold', 'アメリカン・エキスプレス・ビジネス・ゴールド・カード', 'アメリカン・エキスプレス', '{amex}', 'ゴールド', 36300, null,
   1.00, '出張・経費に強いビジネスゴールド', 'メンバーシップ・リワード',
   'なし', null, true, '自動付帯', '最高1億円', true, false, true, false,
   '20歳以上の法人代表者・個人事業主', 'https://www.americanexpress.com/ja-jp/'),

  ('amex-business-platinum', 'アメリカン・エキスプレス・ビジネス・プラチナ・カード', 'アメリカン・エキスプレス', '{amex}', 'プラチナ', 165000, null,
   1.00, 'コンシェルジュ・上級会員資格', 'メンバーシップ・リワード',
   'プレステージ', '同伴者1名無料', true, '自動付帯', '最高1億円', true, true, true, false,
   '法人代表者・個人事業主', 'https://www.americanexpress.com/ja-jp/'),

  ('jcb-biz-one', 'JCB Biz ONE', 'JCB', '{jcb}', '一般', 0, '永年無料',
   1.00, '個人事業主・法人向けの高還元', 'Oki Dokiポイント',
   'なし', null, false, 'なし', null, false, false, true, true,
   '個人事業主・法人代表者', 'https://www.jcb.co.jp/'),

  ('miraino-gold', 'ミライノ カード GOLD', '住信SBIネット銀行', '{jcb}', 'ゴールド', 11000, '年間200万円利用で翌年無料',
   1.00, '高還元・空港ラウンジ', 'ミライノポイント',
   'なし', null, true, '自動付帯', '最高5000万円', true, false, true, false,
   '20歳以上で安定収入のある方', 'https://www.netbk.co.jp/'),

  ('miraino-platinum', 'ミライノ カード PLATINUM', '住信SBIネット銀行', '{jcb}', 'プラチナ', 27500, null,
   1.00, 'プライオリティ・パス付帯', 'ミライノポイント',
   'プレステージ', '本会員無料', true, '自動付帯', '最高1億円', true, true, true, false,
   '20歳以上で安定収入のある方', 'https://www.netbk.co.jp/'),

  ('luxury-gold', 'ラグジュアリーカード（ゴールド）', 'アプラス', '{mastercard}', 'ブラック', 220000, null,
   1.50, '金属製・最上位の優待とポイント1.5%', 'ラグジュアリーリワードポイント',
   'プレステージ', '同伴者条件あり', true, '自動付帯', '最高1.2億円', true, true, true, false,
   '原則として安定した収入のある方', 'https://www.luxurycard.co.jp/'),

  ('diners-premium', 'ダイナースクラブ プレミアムカード', '三井住友トラストクラブ', '{diners}', 'ブラック', 143000, null,
   1.00, '最上級の優待・コンシェルジュ', 'ダイナースクラブ リワードポイント',
   'なし', '国内外1300カ所以上の空港ラウンジ無料', true, '自動付帯', '最高1億円', true, true, true, false,
   '原則として招待制', 'https://www.diners.co.jp/'),

  ('jr-tokai-express', 'JR東海エクスプレス・カード', 'ジェイアール東海', '{jcb,visa,mastercard}', '一般', 1100, null,
   0.50, '東海道・山陽新幹線のEX予約に対応', null,
   'なし', null, false, 'なし', null, false, false, true, false,
   '18歳以上（高校生除く）', 'https://expy.jp/'),

  ('parco-card', 'PARCOカード', 'クレディセゾン', '{visa,mastercard,jcb}', '一般', 0, '永年無料',
   0.50, 'PARCOで割引・優待', '永久不滅ポイント',
   'なし', null, false, 'なし', null, false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.saisoncard.co.jp/'),

  ('mi-card', 'エムアイカード スタンダード', 'エムアイカード', '{amex,visa}', '一般', 550, '初年度無料',
   0.50, '三越伊勢丹で優待', 'エムアイポイント',
   'なし', null, false, 'なし', null, false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.micard.co.jp/'),

  ('tobu-card', 'TOBU CARD', '東武カード', '{visa,mastercard,jcb}', '一般', 0, '条件付き無料',
   0.50, '東武百貨店・東武グループで優待', 'TOBU POINT',
   'なし', null, false, 'なし', null, false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.tobucard.co.jp/'),

  ('kips-card', 'KIPSカード', '近鉄カード', '{visa,mastercard}', '一般', 1100, '初年度無料',
   0.50, '近鉄グループで優待', 'KIPSポイント',
   'なし', null, false, 'なし', null, false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.kintetsu.jp/'),

  ('eneos-card-s', 'ENEOSカード S', 'トヨタファイナンス', '{visa,jcb}', '一般', 1375, '年1回利用で翌年無料',
   0.60, '給油がいつでも値引', 'ENEOSカードポイント',
   'なし', null, false, '利用付帯', '最高1000万円', false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.eneos.co.jp/'),

  ('view-card-standard', 'ビューカード スタンダード', 'ビューカード', '{visa,mastercard,jcb}', '一般', 524, null,
   0.50, 'Suicaチャージで1.5%', 'JRE POINT',
   'なし', null, false, '利用付帯', '最高1000万円', false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.jreast.co.jp/card/'),

  ('rakuten-academy', '楽天カード アカデミー', '楽天カード', '{visa,jcb}', '一般', 0, '在学中は年会費無料',
   1.00, '学生専用・楽天市場で優遇', '楽天ポイント',
   'なし', null, false, '利用付帯', '最高2000万円', false, false, true, false,
   '高校生を除く18〜28歳の学生', 'https://www.rakuten-card.co.jp/'),

  ('jcb-general', 'JCB一般カード', 'JCB', '{jcb}', '一般', 1375, '初年度無料・条件で翌年無料',
   0.50, 'JCBオリジナルシリーズ', 'Oki Dokiポイント',
   'なし', null, false, '利用付帯', '最高3000万円', true, false, true, false,
   '18歳以上（高校生除く）', 'https://www.jcb.co.jp/'),

  ('saison-international', 'セゾンカードインターナショナル', 'クレディセゾン', '{visa,mastercard,jcb}', '一般', 0, '永年無料',
   0.50, '最短即日発行・永久不滅ポイント', '永久不滅ポイント',
   'なし', null, false, 'なし', null, false, false, true, true,
   '18歳以上（高校生除く）', 'https://www.saisoncard.co.jp/'),

  ('ana-jcb-wide', 'ANA JCBワイドカード', 'JCB', '{jcb}', '一般', 7975, null,
   1.00, '搭乗ボーナス・継続マイル', 'ANAマイル / Oki Doki',
   'なし', null, false, '自動付帯', '最高3000万円', false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.jcb.co.jp/'),

  ('jal-card-tokyu', 'JALカード TOKYU POINT ClubQ', 'JALカード', '{visa,mastercard,jcb}', '一般', 2200, '初年度無料',
   0.50, 'JALマイルとTOKYU POINTが貯まる', 'JALマイル / TOKYU POINT',
   'なし', null, false, '利用付帯', '最高1000万円', false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.jal.co.jp/jalcard/'),

  ('aeon-card-waon', 'イオンカード（WAON一体型）', 'イオン銀行', '{visa,mastercard,jcb}', '一般', 0, '永年無料',
   0.50, 'お客さま感謝デーで5%OFF', 'WAON POINT',
   'なし', null, false, 'なし', null, false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.aeon.co.jp/'),

  ('rakuten-ana', '楽天ANAマイレージクラブカード', '楽天カード', '{jcb}', '一般', 550, '年1回利用で翌年無料',
   1.00, '楽天ポイントとANAマイルを切替', '楽天ポイント / ANAマイル',
   'なし', null, false, '利用付帯', '最高2000万円', false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.rakuten-card.co.jp/'),

  ('jq-card-saison', 'JQ CARD セゾン', 'クレディセゾン', '{visa,mastercard,jcb}', '一般', 0, '永年無料',
   0.50, 'JR九州・SUGOCAで優待', 'JRキューポ / 永久不滅ポイント',
   'なし', null, false, 'なし', null, false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.saisoncard.co.jp/')

on conflict (slug) do nothing;

-- ビジネスカード区分を付与
update public.cards set business = true
where slug in (
  'amex-business-green',
  'amex-business-gold',
  'amex-business-platinum',
  'jcb-biz-one'
);
