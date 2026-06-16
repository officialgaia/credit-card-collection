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


-- ===== 追加カード（seed_extra.sql と同内容） =====
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


-- ===== 追加カード第2弾（seed_extra2.sql と同内容） =====
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
