-- =============================================================
-- seed.sql  代表的な日本のクレジットカード（公開情報ベースの近似値）
--   ※ 年会費・還元率等は一般的な公開情報をもとにした目安です。
--     最新・正確な条件は管理画面から随時補正してください。
--   再実行しても重複しないよう slug で ON CONFLICT DO NOTHING。
-- =============================================================

insert into public.cards
  (slug, name, issuer, brands, tier, annual_fee, annual_fee_note,
   base_reward_rate, reward_note, point_program,
   priority_pass, priority_pass_note, airport_lounge,
   travel_insurance, travel_insurance_amount,
   shopping_insurance, concierge, touch_payment, numberless,
   eligibility, official_url)
values
  ('rakuten-card', '楽天カード', '楽天カード', '{visa,mastercard,jcb,amex}', '一般', 0, '永年無料',
   1.00, '楽天市場でポイントアップ', '楽天ポイント',
   'なし', null, false,
   '利用付帯', '最高2000万円', false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.rakuten-card.co.jp/'),

  ('smcc-nl', '三井住友カード（NL）', '三井住友カード', '{visa,mastercard}', '一般', 0, '永年無料',
   0.50, '対象のコンビニ・飲食店でタッチ決済最大7%', 'Vポイント',
   'なし', null, false,
   '利用付帯', '最高2000万円', false, false, true, true,
   '18歳以上（高校生除く）', 'https://www.smbc-card.com/'),

  ('smcc-gold-nl', '三井住友カード ゴールド（NL）', '三井住友カード', '{visa,mastercard}', 'ゴールド', 5500, '年間100万円利用で翌年以降永年無料',
   0.50, '年間100万円利用で10000ポイント', 'Vポイント',
   'なし', null, true,
   '利用付帯', '最高2000万円', true, false, true, true,
   '満20歳以上で安定継続収入のある方', 'https://www.smbc-card.com/'),

  ('jcb-card-w', 'JCB CARD W', 'JCB', '{jcb}', '一般', 0, '永年無料',
   1.00, 'いつでもポイント2倍', 'Oki Dokiポイント',
   'なし', null, false,
   '利用付帯', '最高2000万円', true, false, true, false,
   '18〜39歳でWeb入会限定', 'https://www.jcb.co.jp/'),

  ('recruit-card', 'リクルートカード', 'リクルート', '{visa,mastercard,jcb}', '一般', 0, '永年無料',
   1.20, '常時1.2%還元', 'リクルートポイント',
   'なし', null, false,
   '利用付帯', '最高2000万円', true, false, true, false,
   '18歳以上（高校生除く）', 'https://recruit-card.jp/'),

  ('dcard', 'dカード', 'NTTドコモ', '{visa,mastercard}', '一般', 0, '永年無料',
   1.00, 'd払いと併用でポイントアップ', 'dポイント',
   'なし', null, false,
   'なし', null, true, false, true, false,
   '18歳以上（高校生除く）', 'https://dcard.docomo.ne.jp/'),

  ('dcard-gold', 'dカード GOLD', 'NTTドコモ', '{visa,mastercard}', 'ゴールド', 11000, null,
   1.00, 'ドコモ料金の10%還元', 'dポイント',
   'なし', null, true,
   '自動付帯', '最高1億円', true, false, true, false,
   '満20歳以上で安定継続収入のある方', 'https://dcard.docomo.ne.jp/'),

  ('paypay-card', 'PayPayカード', 'PayPayカード', '{visa,mastercard,jcb}', '一般', 0, '永年無料',
   1.00, 'PayPay残高チャージ対応', 'PayPayポイント',
   'なし', null, false,
   'なし', null, false, false, true, true,
   '18歳以上（高校生除く）', 'https://www.paypay-card.co.jp/'),

  ('aeon-select', 'イオンカードセレクト', 'イオン銀行', '{visa,mastercard,jcb}', '一般', 0, '永年無料',
   0.50, 'イオングループで還元アップ', 'WAON POINT',
   'なし', null, false,
   'なし', null, true, false, true, false,
   '18歳以上（高校生除く）', 'https://www.aeon.co.jp/'),

  ('epos-card', 'エポスカード', '丸井（エポスカード）', '{visa}', '一般', 0, '永年無料',
   0.50, 'マルイ・提携店で優待', 'エポスポイント',
   'なし', null, false,
   '利用付帯', '最高3000万円', false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.eposcard.co.jp/'),

  ('epos-gold', 'エポスゴールドカード', '丸井（エポスカード）', '{visa}', 'ゴールド', 5000, '年間50万円利用または招待で年会費無料',
   0.50, '選べるポイントアップショップ', 'エポスポイント',
   'なし', null, true,
   '利用付帯', '最高5000万円', false, false, true, false,
   '20歳以上で安定収入のある方（招待制あり）', 'https://www.eposcard.co.jp/'),

  ('life-card', 'ライフカード', 'ライフカード', '{visa,mastercard,jcb}', '一般', 0, '永年無料',
   0.50, '誕生月はポイント3倍', 'LIFEサンクスポイント',
   'なし', null, false,
   'なし', null, false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.lifecard.co.jp/'),

  ('bic-suica', 'ビックカメラSuicaカード', 'ビューカード', '{visa,jcb}', '一般', 524, '初年度無料・年1回利用で翌年無料',
   1.00, 'Suicaチャージで1.5%', 'JRE POINT / ビックポイント',
   'なし', null, false,
   '利用付帯', '最高1000万円', false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.jreast.co.jp/card/'),

  ('ana-visa-general', 'ANA VISA一般カード', '三井住友カード', '{visa,mastercard}', '一般', 2200, '初年度無料',
   0.50, '搭乗ボーナスマイル付与', 'ANAマイル / Vポイント',
   'なし', null, false,
   '利用付帯', '最高1000万円', false, false, true, false,
   '満18歳以上（高校生除く）', 'https://www.smbc-card.com/'),

  ('jal-card-ordinary', 'JALカード（普通カード）', 'JALカード', '{visa,mastercard,jcb}', '一般', 2200, '初年度無料',
   0.50, '搭乗ごとにフライトマイル', 'JALマイル',
   'なし', null, false,
   '利用付帯', '最高1000万円', false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.jal.co.jp/jalcard/'),

  ('saison-pearl-amex', 'セゾンパール・アメリカン・エキスプレス・カード', 'クレディセゾン', '{amex}', '一般', 0, '初年度無料・年1回利用で翌年無料',
   0.50, 'QUICPay利用で最大2%', '永久不滅ポイント',
   'なし', null, false,
   'なし', null, false, false, true, true,
   '18歳以上（高校生除く）', 'https://www.saisoncard.co.jp/'),

  ('amex-green', 'アメリカン・エキスプレス・グリーン・カード', 'アメリカン・エキスプレス', '{amex}', '一般', 13200, '月会費1100円（年間13200円）',
   1.00, '海外利用ポイント2倍', 'メンバーシップ・リワード',
   'なし', '空港ラウンジ同伴1名無料', true,
   '利用付帯', '最高5000万円', true, false, true, false,
   '20歳以上で定職のある方', 'https://www.americanexpress.com/ja-jp/'),

  ('amex-gold-preferred', 'アメリカン・エキスプレス・ゴールド・プリファード・カード', 'アメリカン・エキスプレス', '{amex}', 'ゴールド', 39600, null,
   1.00, '対象レストランやトラベルで優待', 'メンバーシップ・リワード',
   'スタンダード', '年2回まで無料同伴', true,
   '自動付帯', '最高1億円', true, false, true, false,
   '20歳以上で定職のある方', 'https://www.americanexpress.com/ja-jp/'),

  ('amex-platinum', 'アメリカン・エキスプレス・プラチナ・カード', 'アメリカン・エキスプレス', '{amex}', 'プラチナ', 165000, null,
   1.00, 'ホテル上級会員資格・各種優待', 'メンバーシップ・リワード',
   'プレステージ', '同伴者1名無料', true,
   '自動付帯', '最高1億円', true, true, true, false,
   '原則20歳以上（招待制ではなく申込可）', 'https://www.americanexpress.com/ja-jp/'),

  ('jcb-gold', 'JCB ゴールド', 'JCB', '{jcb}', 'ゴールド', 11000, 'オンライン入会で初年度無料',
   0.50, 'グルメ優待・ゴールド特典', 'Oki Dokiポイント',
   'なし', null, true,
   '自動付帯', '最高1億円', true, false, true, false,
   '20歳以上で安定継続収入のある方', 'https://www.jcb.co.jp/'),

  ('jcb-platinum', 'JCB プラチナ', 'JCB', '{jcb}', 'プラチナ', 27500, null,
   0.50, 'グルメ・ベネフィット優待', 'Oki Dokiポイント',
   'プレステージ', '同伴者条件あり', true,
   '自動付帯', '最高1億円', true, true, true, false,
   '25歳以上で安定継続収入のある方', 'https://www.jcb.co.jp/'),

  ('jcb-the-class', 'JCB ザ・クラス', 'JCB', '{jcb}', 'ブラック', 55000, null,
   0.50, 'メンバーズセレクション等の最上級特典', 'Oki Dokiポイント',
   'プレステージ', '同伴者条件あり', true,
   '自動付帯', '最高1億円', true, true, true, false,
   '原則として招待制（インビテーション）', 'https://www.jcb.co.jp/'),

  ('smcc-platinum-preferred', '三井住友カード プラチナプリファード', '三井住友カード', '{visa}', 'プラチナ', 33000, null,
   1.00, '継続特典・高還元プログラム', 'Vポイント',
   'なし', null, true,
   '利用付帯', '最高5000万円', true, true, true, true,
   '満20歳以上で安定継続収入のある方', 'https://www.smbc-card.com/'),

  ('diners-club', 'ダイナースクラブカード', '三井住友トラストクラブ', '{diners}', 'プラチナ', 24200, null,
   0.40, '所定の利用で還元・グルメ優待', 'ダイナースクラブ リワードポイント',
   'なし', '国内外1300カ所以上の空港ラウンジ無料', true,
   '自動付帯', '最高1億円', true, true, true, false,
   '原則27歳以上で安定した収入と社会的信用のある方', 'https://www.diners.co.jp/'),

  ('luxury-titanium', 'ラグジュアリーカード（チタン）', 'アプラス', '{mastercard}', 'プラチナ', 55000, null,
   1.00, '金属製カード・ポイント1.0%', 'ラグジュアリーリワードポイント',
   'プレステージ', '同伴者条件あり', true,
   '自動付帯', '最高1.2億円', true, true, true, false,
   '20歳以上で安定した収入のある方', 'https://www.luxurycard.co.jp/'),

  ('luxury-black', 'ラグジュアリーカード（ブラック）', 'アプラス', '{mastercard}', 'ブラック', 110000, null,
   1.25, '金属製カード・ポイント1.25%', 'ラグジュアリーリワードポイント',
   'プレステージ', '同伴者条件あり', true,
   '自動付帯', '最高1.2億円', true, true, true, false,
   '20歳以上で安定した収入のある方', 'https://www.luxurycard.co.jp/'),

  ('mufg-viaso', '三菱UFJカード VIASOカード', '三菱UFJニコス', '{mastercard}', '一般', 0, '永年無料',
   0.50, '貯まったポイントを自動キャッシュバック', 'VIASOポイント',
   'なし', null, false,
   '利用付帯', '最高2000万円', false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.cr.mufg.jp/'),

  ('au-pay-card', 'au PAY カード', 'auフィナンシャルサービス', '{visa,mastercard}', '一般', 0, '永年無料',
   1.00, 'au PAY チャージ・Ponta連携', 'Pontaポイント',
   'なし', null, false,
   '利用付帯', '最高2000万円', false, false, true, false,
   '18歳以上（高校生除く・au会員以外も可）', 'https://www.au.com/payment/'),

  ('seven-card-plus', 'セブンカード・プラス', 'セブン・カードサービス', '{visa,jcb}', '一般', 0, '永年無料',
   0.50, 'nanaco一体型・セブン&アイで優待', 'nanacoポイント',
   'なし', null, false,
   'なし', null, false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.7card.co.jp/'),

  ('rakuten-premium', '楽天プレミアムカード', '楽天カード', '{visa,mastercard,jcb,amex}', 'ゴールド', 11000, null,
   1.00, '楽天市場で最大+4倍・プライオリティパス付帯', '楽天ポイント',
   'プレステージ', '本会員無料（同伴者有料）', true,
   '自動付帯', '最高5000万円', true, false, true, false,
   '20歳以上で安定収入のある方', 'https://www.rakuten-card.co.jp/')

on conflict (slug) do nothing;
