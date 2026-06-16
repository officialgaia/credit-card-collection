-- =============================================================
-- seed_extra4.sql  追加カード 第4弾（2026年6月時点の参考値・要公式確認）
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
  ('saison-rose-gold-amex', 'セゾンローズゴールド・アメリカン・エキスプレス・カード', 'クレディセゾン', '{amex}', 'ゴールド', 11000, '月額制（年間11000円相当）',
   0.50, 'ローズゴールドの券面・カフェ等優待', '永久不滅ポイント',
   'なし', null, true, '利用付帯', '最高3000万円', true, false, true, false,
   '18歳以上（高校生除く）', 'https://www.saisoncard.co.jp/'),

  ('trustclub-platinum-master', 'TRUST CLUB プラチナマスターカード', '三井住友トラストクラブ', '{mastercard}', 'プラチナ', 3300, null,
   0.50, '高コスパなプラチナ・コンシェルジュ', 'TRUST CLUB リワードポイント',
   'なし', null, true, '自動付帯', '最高3000万円', true, true, true, false,
   '22歳以上で安定した収入のある方', 'https://www.trustclub.jp/'),

  ('trustclub-world', 'TRUST CLUB ワールドカード', '三井住友トラストクラブ', '{mastercard}', 'プラチナ', 13200, null,
   0.50, 'World Mastercard特典・ラウンジ', 'TRUST CLUB リワードポイント',
   'プレステージ', '本会員無料', true, '自動付帯', '最高5000万円', true, true, true, false,
   '25歳以上で安定した収入のある方', 'https://www.trustclub.jp/'),

  ('trustclub-world-elite', 'TRUST CLUB ワールドエリートカード', '三井住友トラストクラブ', '{mastercard}', 'ブラック', 143000, null,
   1.00, '最上級World Elite特典', 'TRUST CLUB リワードポイント',
   'プレステージ', '本会員無料', true, '自動付帯', '最高1億円', true, true, true, false,
   '原則として安定した収入と社会的信用のある方', 'https://www.trustclub.jp/'),

  ('mileageplus-saison', 'MileagePlusセゾンカード', 'クレディセゾン', '{amex,mastercard}', '一般', 1650, null,
   0.50, 'ユナイテッド航空のマイルが貯まる', 'MileagePlusマイル',
   'なし', null, false, 'なし', null, false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.saisoncard.co.jp/'),

  ('ana-visa-platinum', 'ANA VISA プラチナ プレミアムカード', '三井住友カード', '{visa}', 'プラチナ', 88000, null,
   1.00, '最高峰のANAマイル特典・コンシェルジュ', 'ANAマイル / Vポイント',
   'プレステージ', '同伴者条件あり', true, '自動付帯', '最高1億円', true, true, true, false,
   '原則30歳以上で安定継続収入のある方', 'https://www.smbc-card.com/'),

  ('ntt-group-card', 'NTTグループカード', 'NTTファイナンス', '{visa,mastercard}', '一般', 0, '永年無料',
   0.60, '通信料割引コースも選べる', 'NTTグループカードポイント',
   'なし', null, false, 'なし', null, false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.ntt-card.com/'),

  ('cedyna-jiyuda', 'セディナカードJiyu!da!', 'SMBCファイナンスサービス', '{visa,mastercard,jcb}', '一般', 0, '永年無料',
   0.50, '支払い方法を自由に設定', 'わくわくポイント',
   'なし', null, false, 'なし', null, false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.cedyna.co.jp/'),

  ('odakyu-op', 'OPクレジット', '小田急電鉄', '{visa,mastercard,jcb}', '一般', 0, '永年無料',
   0.50, '小田急百貨店・乗車でポイント', '小田急ポイント',
   'なし', null, false, 'なし', null, false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.odakyu-card.jp/'),

  ('keio-passport', '京王パスポートPASMOカードVISA', '京王パスポートクラブ', '{visa,mastercard,jcb}', '一般', 262, '初年度無料',
   0.50, '京王百貨店・乗車でポイント', '京王ポイント',
   'なし', null, false, 'なし', null, false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.keio-passport.jp/'),

  ('daimaru-matsuzakaya', '大丸松坂屋カード', 'JFRカード', '{visa,mastercard,amex}', '一般', 2200, '初年度無料',
   0.50, '大丸・松坂屋で優待', 'QIRA[キラ]ポイント',
   'なし', null, false, '利用付帯', '最高1000万円', false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.jfr-card.co.jp/'),

  ('edion-card', 'エディオンカード', 'オリコ', '{jcb}', '一般', 1078, '年1回利用で翌年無料',
   0.50, 'エディオンで長期保証・割引', 'エディオンポイント',
   'なし', null, false, 'なし', null, false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.edion.co.jp/'),

  ('ana-jcb-premium', 'ANA JCBカード プレミアム', 'JCB', '{jcb}', 'ブラック', 77000, null,
   1.30, 'ANA最高峰JCB・プライオリティパス', 'ANAマイル',
   'プレステージ', '同伴者無料', true, '自動付帯', '最高1億円', true, true, true, false,
   '原則として招待制・安定収入のある方', 'https://www.jcb.co.jp/'),

  ('majica-donpen', 'マジカドンペンカード', 'UCS', '{visa,mastercard,jcb}', '一般', 0, '永年無料',
   0.50, 'ドン・キホーテでmajica優待', 'majicaポイント',
   'なし', null, false, 'なし', null, false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.ucscard.co.jp/'),

  ('nudge', 'Nudge（ナッジ）', 'ナッジ', '{visa}', '一般', 0, '永年無料',
   0.00, '推し活クラブと連携・アプリ完結', '—',
   'なし', null, false, 'なし', null, false, false, true, true,
   '18歳以上（本人確認必須）', 'https://nudge.bank/'),

  ('p-one-standard', 'P-oneカード（スタンダード）', 'ポケットカード', '{visa,mastercard,jcb}', '一般', 0, '年1回利用で翌年無料',
   1.00, '請求時に1%自動値引き', 'ポケット・ポイント',
   'なし', null, false, 'なし', null, false, false, true, false,
   '18歳以上（高校生除く）', 'https://www.pocketcard.co.jp/'),

  ('saison-cobalt-business-amex', 'セゾンコバルト・ビジネス・アメリカン・エキスプレス・カード', 'クレディセゾン', '{amex}', '一般', 0, '永年無料',
   0.50, '個人事業主・経営者向け・経費管理', '永久不滅ポイント',
   'なし', null, false, 'なし', null, false, false, true, false,
   '個人事業主・経営者（フリーランス含む）', 'https://www.saisoncard.co.jp/'),

  ('smbc-business-owners', '三井住友カード ビジネスオーナーズ', '三井住友カード', '{visa,mastercard}', '一般', 0, '永年無料',
   0.50, '法人代表者・個人事業主向け', 'Vポイント',
   'なし', null, false, '利用付帯', '最高2000万円', false, false, true, false,
   '満18歳以上の法人代表者・個人事業主', 'https://www.smbc-card.com/'),

  ('smbc-business-owners-gold', '三井住友カード ビジネスオーナーズ ゴールド', '三井住友カード', '{visa,mastercard}', 'ゴールド', 5500, '年間100万円利用で翌年以降永年無料',
   0.50, '空港ラウンジ・ビジネス向け特典', 'Vポイント',
   'なし', null, true, '利用付帯', '最高2000万円', true, false, true, false,
   '満20歳以上の法人代表者・個人事業主', 'https://www.smbc-card.com/')

on conflict (slug) do nothing;
