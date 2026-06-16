-- =============================================================
-- seed_extra2.sql  追加カード 第2弾（公開情報ベースの近似値）
--   既存DBに追加する用。slug で ON CONFLICT DO NOTHING のため重複しない。
-- =============================================================

insert into public.cards
  (slug, name, issuer, brands, tier, annual_fee, annual_fee_note,
   base_reward_rate, reward_note, point_program,
   priority_pass, priority_pass_note, airport_lounge,
   travel_insurance, travel_insurance_amount,
   shopping_insurance, concierge, touch_payment, numberless,
   eligibility, official_url)
values
  ('jre-card', 'JRE CARD', 'ビューカード', '{visa,mastercard,jcb}', '一般', 524, '初年度無料',
   0.50, 'アトレ等で3.5%・Suica積立', 'JRE POINT',
   'なし', null, false, '利用付帯', '最高1000万円', false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.jreast.co.jp/card/'),

  ('lumine-card', 'ルミネカード', 'ビューカード', '{visa,mastercard,jcb}', '一般', 1048, '初年度無料',
   0.50, 'ルミネで常時5%OFF', 'JRE POINT',
   'なし', null, false, '利用付帯', '最高1000万円', false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.jreast.co.jp/card/'),

  ('olive-gold', '三井住友カード Olive ゴールド', '三井住友カード', '{visa}', 'ゴールド', 5500, '年間100万円利用で翌年以降永年無料',
   0.50, '対象店タッチ決済最大7%・100万円ボーナス', 'Vポイント',
   'なし', null, true, '利用付帯', '最高2000万円', true, false, true, true,
   '満20歳以上で安定継続収入のある方', 'https://www.smbc-card.com/'),

  ('olive-platinum-preferred', '三井住友カード Olive プラチナプリファード', '三井住友カード', '{visa}', 'プラチナ', 33000, null,
   1.00, '継続特典・高還元プログラム', 'Vポイント',
   'なし', null, true, '利用付帯', '最高5000万円', true, true, true, true,
   '満20歳以上で安定継続収入のある方', 'https://www.smbc-card.com/'),

  ('rakuten-pink', '楽天PINKカード', '楽天カード', '{visa,mastercard,jcb}', '一般', 0, '永年無料',
   1.00, '女性向けオプション・楽天市場優遇', '楽天ポイント',
   'なし', null, false, '利用付帯', '最高2000万円', false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.rakuten-card.co.jp/'),

  ('aeon-gold', 'イオンゴールドカード', 'イオン銀行', '{visa,mastercard,jcb}', 'ゴールド', 0, '招待制・年会費無料',
   0.50, 'イオンラウンジ・空港ラウンジ利用可', 'WAON POINT',
   'なし', null, true, '自動付帯', '最高3000万円', true, false, true, false,
   'イオンカードの利用実績による招待制', 'https://www.aeon.co.jp/'),

  ('aeon-suica', 'イオンSuicaカード', 'イオン銀行', '{visa,mastercard,jcb}', '一般', 0, '永年無料',
   0.50, 'Suica一体型・イオンで優待', 'WAON POINT',
   'なし', null, false, '利用付帯', '最高1000万円', false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.aeon.co.jp/'),

  ('view-gold-plus', 'ビューゴールドプラスカード', 'ビューカード', '{visa,jcb}', 'ゴールド', 11000, null,
   0.50, '新幹線・Suica積立で高還元・ラウンジ', 'JRE POINT',
   'なし', null, true, '自動付帯', '最高5000万円', true, false, true, false,
   '20歳以上で安定継続収入のある方', 'https://www.jreast.co.jp/card/'),

  ('ana-jcb-general', 'ANA JCB一般カード', 'JCB', '{jcb}', '一般', 2200, '初年度無料',
   0.50, '搭乗ボーナス・継続マイル', 'ANAマイル / Oki Doki',
   'なし', null, false, '利用付帯', '最高1000万円', false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.jcb.co.jp/'),

  ('ana-to-me-pasmo', 'ANA To Me CARD PASMO JCB（ソラチカカード）', 'JCB', '{jcb}', '一般', 2200, '初年度無料',
   0.50, 'メトロ乗車・PASMOオートチャージでマイル', 'ANAマイル / メトロポイント',
   'なし', null, false, '利用付帯', '最高1000万円', false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.jcb.co.jp/'),

  ('jal-card-suica', 'JALカードSuica', 'JALカード', '{jcb}', '一般', 2200, '初年度無料',
   0.50, 'マイルとJRE POINTが貯まる', 'JALマイル / JRE POINT',
   'なし', null, false, '利用付帯', '最高1000万円', false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.jal.co.jp/jalcard/'),

  ('jal-platinum', 'JALカード プラチナ', 'JALカード', '{amex,jcb}', 'プラチナ', 34100, null,
   1.00, '高マイル還元・コンシェルジュ', 'JALマイル',
   'プレステージ', '本会員無料', true, '自動付帯', '最高1億円', true, true, true, false,
   '20歳以上で安定継続収入のある方', 'https://www.jal.co.jp/jalcard/'),

  ('ana-amex-premium', 'ANAアメリカン・エキスプレス・プレミアム・カード', 'アメリカン・エキスプレス', '{amex}', 'ブラック', 165000, null,
   1.50, '最高水準のマイル還元・上級会員資格', 'ANAマイル',
   'プレステージ', '同伴者1名無料', true, '自動付帯', '最高1億円', true, true, true, false,
   '20歳以上で安定収入のある方', 'https://www.americanexpress.com/ja-jp/'),

  ('saison-blue-amex', 'セゾンブルー・アメリカン・エキスプレス・カード', 'クレディセゾン', '{amex}', '一般', 3300, '初年度無料・26歳まで年会費無料',
   0.50, '海外利用2倍・若年層優遇', '永久不滅ポイント',
   'なし', null, false, '自動付帯', '最高3000万円', true, false, true, false,
   '18歳以上（高校生除く）', 'https://www.saisoncard.co.jp/'),

  ('zozocard', 'ZOZOCARD', 'ポケットカード', '{visa,mastercard,jcb}', '一般', 0, '永年無料',
   1.00, 'ZOZOTOWNでポイントアップ', 'ZOZOポイント / ポケットポイント',
   'なし', null, false, 'なし', null, false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.pocketcard.co.jp/'),

  ('mufg-card', '三菱UFJカード', '三菱UFJニコス', '{visa,mastercard,jcb,amex}', '一般', 0, '永年無料',
   0.50, '対象店でポイント大幅アップ', 'グローバルポイント',
   'なし', null, false, '利用付帯', '最高2000万円', false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.cr.mufg.jp/'),

  ('tokyu-gold', 'TOKYU CARD ClubQ JMB ゴールド', '東急カード', '{visa,mastercard}', 'ゴールド', 6600, null,
   1.00, '東急グループ優待・ラウンジ', 'TOKYU POINT',
   'なし', null, true, '自動付帯', '最高5000万円', true, false, true, false,
   '20歳以上で安定収入のある方', 'https://www.topcard.co.jp/'),

  ('life-gold', 'ライフカードゴールド', 'ライフカード', '{visa,mastercard,jcb}', 'ゴールド', 11000, null,
   0.50, '空港ラウンジ・誕生月ポイントアップ', 'LIFEサンクスポイント',
   'なし', null, true, '自動付帯', '最高1億円', true, false, true, false,
   '23歳以上で安定収入のある方', 'https://www.lifecard.co.jp/'),

  ('rex-card', 'REX CARD', 'ジャックス', '{visa,mastercard,jcb}', '一般', 0, '永年無料',
   1.25, '常時1.25%の高還元', 'REX POINT',
   'なし', null, false, '利用付帯', '最高2000万円', true, false, true, false,
   '18歳以上（高校生除く）', 'https://www.jaccs.co.jp/'),

  ('seibu-prince', 'SEIBU PRINCE CLUBカード セゾン', 'クレディセゾン', '{visa,mastercard,jcb}', '一般', 0, '永年無料',
   0.50, '西武・プリンスホテルで優待', '永久不滅ポイント / SEIBUプリンスポイント',
   'なし', null, false, 'なし', null, false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.saisoncard.co.jp/'),

  ('jcb-gold-extage', 'JCB GOLD EXTAGE', 'JCB', '{jcb}', 'ゴールド', 3300, '初年度無料',
   0.50, '20代向けゴールド・ポイント優遇', 'Oki Dokiポイント',
   'なし', null, true, '利用付帯', '最高5000万円', true, false, true, false,
   '20〜29歳で安定継続収入のある方', 'https://www.jcb.co.jp/'),

  ('jp-bank-card', 'JP BANK カード', 'ゆうちょ銀行', '{visa,mastercard,jcb}', '一般', 1375, '初年度無料・年1回利用で翌年無料',
   0.50, 'ゆうちょ口座と連携', 'JPバンクカードポイント',
   'なし', null, false, 'なし', null, false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.jp-bank.japanpost.jp/'),

  ('orico-gold-prime', 'Orico Card THE POINT PREMIUM GOLD', 'オリコ', '{mastercard,jcb}', 'ゴールド', 1986, null,
   1.00, '基本1.0%＋特約店加算', 'オリコポイント',
   'なし', null, false, '自動付帯', '最高2000万円', true, false, true, false,
   '原則20歳以上で安定収入のある方', 'https://www.orico.co.jp/')

on conflict (slug) do nothing;
