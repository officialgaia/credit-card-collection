import type { Metadata } from 'next';
import { getAllCards } from '@/lib/cards/queries';
import { getCurrentProfile } from '@/lib/auth';
import { shouldShowAds } from '@/lib/billing';
import { AdSlot } from '@/components/ads/AdSlot';
import { SimulatorClient } from '@/components/simulator/SimulatorClient';

export const metadata: Metadata = {
  title: 'ポイント還元シミュレーター｜クレジットカード比較',
  description:
    '毎月のカード利用額を入力すると、各クレジットカードで1年間に貯まるポイントと、年会費を差し引いた実質お得額をランキングで比較できます。',
  alternates: { canonical: '/simulator' },
};

export default async function SimulatorPage() {
  const [cards, profile] = await Promise.all([getAllCards(), getCurrentProfile()]);
  const showAds = shouldShowAds(profile);

  const simCards = cards.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    issuer: c.issuer,
    tier: c.tier,
    annual_fee: c.annual_fee,
    base_reward_rate: c.base_reward_rate,
  }));

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">ポイント還元シミュレーター</h1>
        <p className="text-sm text-muted">
          毎月のカード利用額から、各カードで年間に貯まるポイントと「実質お得額」を試算・比較します。
        </p>
      </header>

      {showAds && <AdSlot />}

      <SimulatorClient cards={simCards} />
    </div>
  );
}
