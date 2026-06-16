-- =============================================================
-- seed_extra.sql  追加カード（公開情報ベースの近似値）
--   既存DBに後から追加する用。slug で ON CONFLICT DO NOTHING のため
--   何度実行しても重複しない。fresh setup の場合は seed.sql に同内容を含む。
-- =============================================================

insert into public.cards
  (slug, name, issuer, brands, tier, annual_fee, annual_fee_note,
   base_reward_rate, reward_note, point_program,
   priority_pass, priority_pass_note, airport_lounge,
   travel_insurance, travel_insurance_amount,
   shopping_insurance, concierge, touch_payment, numberless,
   eligibility, official_url)
values
  ('olive-flexible', '三井住友カード Olive フレキシブルペイ（一般）', '三井住友カード', '{visa}', '一般', 0, '永年無料',
   0.50, '選べる特典・対象店でタッチ決済最大7%', 'Vポイント',
   'なし', null, false, '利用付帯', '最高2000万円', false, false, true, true,
   '18歳以上（高校生除く）・SMBC口座', 'https://www.smbc-card.com/'),

  ('view-suica', '「ビュー・スイカ」カード', 'ビューカード', '{visa,mastercard,jcb}', '一般', 524, null,
   0.50, 'Suicaチャージ・定期で1.5%', 'JRE POINT',
   'なし', null, false, '利用付帯', '最高1000万円', false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.jreast.co.jp/card/'),

  ('tokyu-card', 'TOKYU CARD ClubQ JMB PASMO', '東急カード', '{visa,mastercard,jcb}', '一般', 1100, '初年度無料',
   1.00, '東急百貨店・PASMOオートチャージ', 'TOKYU POINT',
   'なし', null, false, '利用付帯', '最高1000万円', false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.topcard.co.jp/'),

  ('saison-gold-amex', 'セゾンゴールド・アメリカン・エキスプレス・カード', 'クレディセゾン', '{amex}', 'ゴールド', 11000, '年間100万円以上で翌年以降無料',
   0.75, '海外利用やセゾンポイントモールで優遇', '永久不滅ポイント',
   'なし', null, true, '利用付帯', '最高5000万円', true, false, true, false,
   '18歳以上（高校生除く）で安定収入のある方', 'https://www.saisoncard.co.jp/'),

  ('saison-platinum-amex', 'セゾンプラチナ・アメリカン・エキスプレス・カード', 'クレディセゾン', '{amex}', 'プラチナ', 22000, null,
   1.00, '永久不滅ポイント最大1.0%・グルメ優待', '永久不滅ポイント',
   'プレステージ', '本会員無料', true, '自動付帯', '最高1億円', true, true, true, false,
   '安定した収入と社会的信用のある方', 'https://www.saisoncard.co.jp/'),

  ('mufg-gold-prestige', '三菱UFJカード ゴールドプレステージ', '三菱UFJニコス', '{visa,mastercard,jcb,amex}', 'ゴールド', 11000, '年間100万円利用で翌年無料',
   0.50, '対象店でポイント大幅アップ', 'グローバルポイント',
   'なし', null, true, '自動付帯', '最高1億円', true, false, true, false,
   '18歳以上（学生除く）で安定収入のある方', 'https://www.cr.mufg.jp/'),

  ('orico-the-point', 'オリコカード THE POINT', 'オリコ', '{mastercard,jcb}', '一般', 0, '永年無料',
   1.00, '入会後6か月は2.0%', 'オリコポイント',
   'なし', null, false, 'なし', null, false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.orico.co.jp/'),

  ('orico-platinum', 'Orico Card THE PLATINUM', 'オリコ', '{mastercard}', 'プラチナ', 20370, null,
   1.00, '海外2.0%・誕生月加算', 'オリコポイント',
   'プレステージ', '本会員無料', true, '自動付帯', '最高1億円', true, true, true, false,
   '原則20歳以上で安定した収入のある方', 'https://www.orico.co.jp/'),

  ('ana-amex', 'ANAアメリカン・エキスプレス・カード', 'アメリカン・エキスプレス', '{amex}', '一般', 7700, null,
   1.00, '搭乗ボーナス・継続マイル', 'ANAマイル',
   'なし', null, true, '利用付帯', '最高3000万円', false, false, true, false,
   '20歳以上で定職のある方', 'https://www.americanexpress.com/ja-jp/'),

  ('ana-amex-gold', 'ANAアメリカン・エキスプレス・ゴールド・カード', 'アメリカン・エキスプレス', '{amex}', 'ゴールド', 34100, null,
   1.00, 'マイル還元率優遇・継続ボーナス', 'ANAマイル',
   'なし', null, true, '自動付帯', '最高1億円', true, false, true, false,
   '20歳以上で定職のある方', 'https://www.americanexpress.com/ja-jp/'),

  ('ana-visa-wide-gold', 'ANA VISAワイドゴールドカード', '三井住友カード', '{visa,mastercard}', 'ゴールド', 15400, null,
   1.00, 'マイル移行手数料無料・搭乗ボーナス', 'ANAマイル / Vポイント',
   'なし', null, true, '自動付帯', '最高5000万円', true, false, true, false,
   '満20歳以上で安定継続収入のある方', 'https://www.smbc-card.com/'),

  ('smcc-gold', '三井住友カード ゴールド', '三井住友カード', '{visa,mastercard}', 'ゴールド', 11000, '前年100万円以上で翌年無料',
   0.50, '空港ラウンジ・ゴールド特典', 'Vポイント',
   'なし', null, true, '利用付帯', '最高5000万円', true, false, true, false,
   '満20歳以上で安定継続収入のある方', 'https://www.smbc-card.com/'),

  ('smcc-platinum', '三井住友カード プラチナ', '三井住友カード', '{visa,mastercard}', 'プラチナ', 55000, null,
   0.50, 'コンシェルジュ・宿泊優待', 'Vポイント',
   'プレステージ', '同伴者条件あり', true, '自動付帯', '最高1億円', true, true, true, false,
   '満30歳以上で安定継続収入のある方', 'https://www.smbc-card.com/'),

  ('paypay-gold', 'PayPayカード ゴールド', 'PayPayカード', '{visa,mastercard,jcb}', 'ゴールド', 11000, null,
   1.50, 'PayPay・ソフトバンク連携で高還元', 'PayPayポイント',
   'なし', null, true, '利用付帯', '最高1億円', false, false, true, true,
   '18歳以上（高校生除く）で安定収入のある方', 'https://www.paypay-card.co.jp/'),

  ('rakuten-gold', '楽天ゴールドカード', '楽天カード', '{visa,mastercard,jcb}', 'ゴールド', 2200, null,
   1.00, '楽天市場でポイントアップ・国内ラウンジ', '楽天ポイント',
   'なし', null, true, '利用付帯', '最高2000万円', false, false, true, false,
   '20歳以上で安定収入のある方', 'https://www.rakuten-card.co.jp/'),

  ('amazon-mastercard', 'Amazon Mastercard', '三井住友カード', '{mastercard}', '一般', 0, '永年無料',
   1.00, 'Amazonで1.5〜2.0%（プライム会員）', 'Amazonポイント',
   'なし', null, false, 'なし', null, false, false, true, true,
   '18歳以上（高校生除く）', 'https://www.amazon.co.jp/'),

  ('jcb-card-s', 'JCB CARD S', 'JCB', '{jcb}', '一般', 0, '永年無料',
   0.50, 'JCB CARD S優待で割引', 'Oki Dokiポイント',
   'なし', null, false, '利用付帯', '最高2000万円', true, false, true, false,
   '18歳以上（高校生除く）', 'https://www.jcb.co.jp/'),

  ('dcard-platinum', 'dカード PLATINUM', 'NTTドコモ', '{visa,mastercard}', 'プラチナ', 29700, null,
   1.00, 'ドコモ料金最大20%還元・継続特典', 'dポイント',
   'なし', null, true, '自動付帯', '最高1億円', true, true, true, false,
   '満20歳以上で安定継続収入のある方', 'https://dcard.docomo.ne.jp/'),

  ('au-pay-gold', 'au PAY ゴールドカード', 'auフィナンシャルサービス', '{visa,mastercard}', 'ゴールド', 11000, null,
   1.00, 'au料金10%還元・Ponta優遇', 'Pontaポイント',
   'なし', null, true, '自動付帯', '最高1億円', true, false, true, false,
   '満20歳以上で安定継続収入のある方', 'https://www.au.com/payment/'),

  ('epos-platinum', 'エポスプラチナカード', '丸井（エポスカード）', '{visa}', 'プラチナ', 30000, '年間100万円利用で翌年以降20000円',
   0.50, '選べるポイントアップ・ボーナスポイント', 'エポスポイント',
   'プレステージ', '本会員無料', true, '自動付帯', '最高1億円', true, true, true, false,
   '原則20歳以上で安定収入のある方（招待制あり）', 'https://www.eposcard.co.jp/'),

  ('ana-diners', 'ANAダイナースカード', '三井住友トラストクラブ', '{diners}', 'プラチナ', 29700, null,
   1.00, '高マイル還元・グルメ優待', 'ANAマイル',
   'なし', '国内外1300カ所以上の空港ラウンジ無料', true, '自動付帯', '最高1億円', true, true, true, false,
   '原則27歳以上で安定収入と社会的信用のある方', 'https://www.diners.co.jp/'),

  ('jal-diners', 'JALダイナースカード', '三井住友トラストクラブ', '{diners}', 'プラチナ', 30800, null,
   1.00, 'JALマイル高還元・グルメ優待', 'JALマイル',
   'なし', '国内外1300カ所以上の空港ラウンジ無料', true, '自動付帯', '最高1億円', true, true, true, false,
   '原則27歳以上で安定収入と社会的信用のある方', 'https://www.diners.co.jp/'),

  ('mercard', 'メルカード', 'メルペイ', '{jcb}', '一般', 0, '永年無料',
   1.00, 'メルカリ利用実績で還元率アップ', 'メルカリポイント',
   'なし', null, false, 'なし', null, false, false, true, true,
   'メルカリ アプリから申込・18歳以上', 'https://jp.mercari.com/'),

  ('p-one-wiz', 'P-one Wiz', 'ポケットカード', '{visa,mastercard,jcb}', '一般', 0, '永年無料',
   1.00, '請求時1%自動値引き＋ポイント', 'ポケット・ポイント',
   'なし', null, false, 'なし', null, false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.pocketcard.co.jp/'),

  ('uc-card', 'UCカード（一般）', 'ユーシーカード', '{visa,mastercard}', '一般', 1375, '初年度無料',
   0.50, '永久不滅ポイント・優待', '永久不滅ポイント',
   'なし', null, false, '利用付帯', '最高2000万円', false, false, true, false,
   '18歳以上（高校生除く）', 'https://www2.uccard.co.jp/'),

  ('jal-card-cluba', 'JALカード CLUB-Aカード', 'JALカード', '{visa,mastercard,jcb}', 'ゴールド', 11000, null,
   1.00, '入会・搭乗ボーナスマイル増量', 'JALマイル',
   'なし', null, true, '自動付帯', '最高5000万円', true, false, true, false,
   '18歳以上（学生除く）', 'https://www.jal.co.jp/jalcard/'),

  ('jal-card-gold', 'JALカード CLUB-Aゴールドカード', 'JALカード', '{visa,mastercard}', 'ゴールド', 17600, null,
   1.00, '高マイル還元・ラウンジ', 'JALマイル',
   'なし', null, true, '自動付帯', '最高1億円', true, false, true, false,
   '20歳以上で安定継続収入のある方', 'https://www.jal.co.jp/jalcard/'),

  ('yodobashi-gold', 'ゴールドポイントカード・プラス', 'ヨドバシカメラ', '{visa}', '一般', 0, '永年無料',
   1.00, 'ヨドバシで最大11%ポイント', 'ゴールドポイント',
   'なし', null, false, 'なし', null, false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.yodobashi.com/'),

  ('mi-card-plus-gold', 'エムアイカード プラス ゴールド', 'エムアイカード', '{amex,visa}', 'ゴールド', 11000, null,
   0.50, '三越伊勢丹で最大10%・ラウンジ', 'エムアイポイント',
   'なし', null, true, '自動付帯', '最高5000万円', true, false, true, false,
   '20歳以上で安定収入のある方', 'https://www.micard.co.jp/'),

  ('takashimaya-card', 'タカシマヤカード', '高島屋', '{visa,mastercard,jcb}', '一般', 2200, '初年度無料',
   0.50, '高島屋で最大10%ポイント', 'タカシマヤポイント',
   'なし', null, false, '利用付帯', '最高1000万円', false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.takashimaya-financial-partners.co.jp/'),

  ('ana-jcb-wide-gold', 'ANA JCBワイドゴールドカード', 'JCB', '{jcb}', 'ゴールド', 15400, null,
   1.00, 'マイル移行手数料無料・搭乗ボーナス', 'ANAマイル / Oki Doki',
   'なし', null, true, '自動付帯', '最高1億円', true, false, true, false,
   '20歳以上で安定継続収入のある方', 'https://www.jcb.co.jp/'),

  ('jcb-card-w-plus-l', 'JCB CARD W plus L', 'JCB', '{jcb}', '一般', 0, '永年無料',
   1.00, '女性向け優待＋いつでも2倍', 'Oki Dokiポイント',
   'なし', null, false, '利用付帯', '最高2000万円', true, false, true, false,
   '18〜39歳でWeb入会限定', 'https://www.jcb.co.jp/')

on conflict (slug) do nothing;
