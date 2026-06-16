-- =============================================================
-- seed_extra3.sql  追加カード 第3弾（2026年6月時点の参考値・要公式確認）
--   slug で ON CONFLICT DO NOTHING のため重複しない。
-- =============================================================
insert into public.cards
  (slug, name, issuer, brands, tier, annual_fee, annual_fee_note,
   base_reward_rate, reward_note, point_program,
   priority_pass, priority_pass_note, airport_lounge,
   travel_insurance, travel_insurance_amount,
   shopping_insurance, concierge, touch_payment, numberless,
   eligibility, official_url)
values
  ('visa-line-pay-p', 'Visa LINE Payクレジットカード（P+）', '三井住友カード', '{visa}', '一般', 0, '永年無料',
   0.50, 'LINEのチャージ&ペイで最大5%（条件あり）', 'LINEポイント / Vポイント',
   'なし', null, false, 'なし', null, false, false, true, true,
   '18歳以上（高校生除く）', 'https://www.smbc-card.com/'),

  ('eneos-card-p', 'ENEOSカード P', 'トヨタファイナンス', '{visa,jcb}', '一般', 1375, '初年度無料',
   0.60, 'ENEOSでポイント高還元', 'ENEOSカードポイント',
   'なし', null, false, '利用付帯', '最高1000万円', false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.eneos.co.jp/'),

  ('idemitsu-maido', '出光カードまいどプラス', '出光クレジット', '{visa,mastercard,jcb,amex}', '一般', 0, '永年無料',
   0.50, '出光SSで燃料が値引', 'プラスポイント',
   'なし', null, false, 'なし', null, false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.idemitsucard.com/'),

  ('toyota-ttc-regular', 'TS CUBIC CARD レギュラー', 'トヨタファイナンス', '{visa,mastercard,jcb}', '一般', 0, '永年無料',
   0.50, 'トヨタ系列で優待', 'TS CUBICポイント',
   'なし', null, false, '利用付帯', '最高2000万円', false, false, true, false,
   '18歳以上（高校生除く）', 'https://ts3card.com/'),

  ('mufg-gold', '三菱UFJカード ゴールド', '三菱UFJニコス', '{visa,mastercard,jcb}', 'ゴールド', 2095, null,
   0.50, '空港ラウンジ付帯のお手頃ゴールド', 'グローバルポイント',
   'なし', null, true, '自動付帯', '最高2000万円', true, false, true, false,
   '18歳以上（学生除く）で安定収入のある方', 'https://www.cr.mufg.jp/'),

  ('mufg-platinum-amex', '三菱UFJカード・プラチナ・アメリカン・エキスプレス・カード', '三菱UFJニコス', '{amex}', 'プラチナ', 22000, null,
   0.50, 'コンシェルジュ・プライオリティパス', 'グローバルポイント',
   'プレステージ', '本会員無料', true, '自動付帯', '最高1億円', true, true, true, false,
   '20歳以上で安定収入のある方', 'https://www.cr.mufg.jp/'),

  ('ana-jcb-zero', 'ANA JCBカード ZERO', 'JCB', '{jcb}', '一般', 0, '入会後5年間年会費無料',
   0.30, '若年層向け・搭乗ボーナス', 'ANAマイル',
   'なし', null, false, '利用付帯', '最高1000万円', false, false, true, false,
   '18〜25歳の学生または社会人', 'https://www.jcb.co.jp/'),

  ('jal-card-navi', 'JALカード navi（学生専用）', 'JALカード', '{visa,mastercard,jcb}', '一般', 0, '在学中は年会費無料',
   0.50, '学生専用・マイル優遇', 'JALマイル',
   'なし', null, false, '利用付帯', '最高1000万円', false, false, true, false,
   '高校生を除く18歳以上の学生', 'https://www.jal.co.jp/jalcard/'),

  ('apollostation-card', 'apollostation card', '出光クレジット', '{visa,mastercard,jcb,amex}', '一般', 0, '永年無料',
   0.50, '出光SSで燃料値引・ポイント', 'プラスポイント',
   'なし', null, false, 'なし', null, false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.idemitsucard.com/'),

  ('cosmo-opus', 'コスモ・ザ・カード・オーパス', 'イオンクレジットサービス', '{visa,mastercard,jcb}', '一般', 0, '永年無料',
   0.50, 'コスモ石油で会員価格', 'WAON POINT',
   'なし', null, false, 'なし', null, false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.cosmo-oil.co.jp/'),

  ('tcard-prime', 'Tカード Prime', 'ジャックス', '{visa,mastercard}', '一般', 1375, '年1回利用で翌年無料',
   1.00, '日曜は還元率1.5%', 'Tポイント / Vポイント',
   'なし', null, false, '利用付帯', '最高2000万円', false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.jaccs.co.jp/'),

  ('marriott-bonvoy-premium', 'Marriott Bonvoy アメリカン・エキスプレス・プレミアム・カード', 'アメリカン・エキスプレス', '{amex}', 'プラチナ', 49500, null,
   1.00, '無料宿泊特典・ゴールドエリート資格', 'Marriott Bonvoyポイント',
   'プレステージ', '本会員無料', true, '自動付帯', '最高1億円', true, true, true, false,
   '20歳以上で定職のある方', 'https://www.americanexpress.com/ja-jp/'),

  ('hilton-amex', 'ヒルトン・オナーズ アメリカン・エキスプレス・カード', 'アメリカン・エキスプレス', '{amex}', 'ゴールド', 16500, null,
   1.00, 'ヒルトン・ゴールド会員資格', 'ヒルトン・オナーズポイント',
   'なし', null, true, '自動付帯', '最高5000万円', true, false, true, false,
   '20歳以上で定職のある方', 'https://www.americanexpress.com/ja-jp/'),

  ('hilton-amex-premium', 'ヒルトン・オナーズ アメリカン・エキスプレス・プレミアム・カード', 'アメリカン・エキスプレス', '{amex}', 'プラチナ', 66000, null,
   1.00, 'ヒルトン・ダイヤモンド会員資格・無料宿泊', 'ヒルトン・オナーズポイント',
   'プレステージ', '本会員無料', true, '自動付帯', '最高1億円', true, true, true, false,
   '20歳以上で定職のある方', 'https://www.americanexpress.com/ja-jp/'),

  ('lawson-ponta-plus', 'ローソンPontaプラス', 'アプラス', '{mastercard}', '一般', 0, '永年無料',
   1.00, 'ローソンで最大4%還元', 'Pontaポイント',
   'なし', null, false, 'なし', null, false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.aplus.co.jp/'),

  ('ana-visa-suica', 'ANA VISA Suicaカード', '三井住友カード', '{visa}', '一般', 2200, '初年度無料',
   0.50, 'マイルとSuica・搭乗ボーナス', 'ANAマイル / Vポイント',
   'なし', null, false, '利用付帯', '最高1000万円', false, false, true, false,
   '満18歳以上（高校生除く）', 'https://www.smbc-card.com/'),

  ('saison-platinum-business-amex', 'セゾンプラチナ・ビジネス・アメリカン・エキスプレス・カード', 'クレディセゾン', '{amex}', 'プラチナ', 22000, '年間200万円以上で翌年11000円',
   0.50, 'JALマイル高還元・経費管理に', '永久不滅ポイント',
   'プレステージ', '本会員無料', true, '自動付帯', '最高1億円', true, true, true, false,
   '個人事業主・経営者（会社員も申込可）', 'https://www.saisoncard.co.jp/'),

  ('resona-card-saison', 'りそなカード《セゾン》', 'クレディセゾン', '{visa,mastercard,jcb}', '一般', 1100, '初年度無料',
   0.50, 'りそな銀行と連携', '永久不滅ポイント',
   'なし', null, false, 'なし', null, false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.resonacard.co.jp/')

on conflict (slug) do nothing;
