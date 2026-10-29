// Asset-specific editorial text (qualitative only: no numbers that need sourcing).
// A block is hidden on the asset page when its content is missing here.

export interface AssetContent {
  drivers: { title: string; text: string }[];
  bull: string[];
  bear: string[];
  /** comparison section, e.g. gold vs silver */
  compare?: { heading: string; paragraphs: string[]; link: { label: string; href?: string } };
}

export const CONTENT: Record<string, AssetContent> = {
  silver: {
    drivers: [
      { title: 'Industrial demand', text: 'Around half of the silver used each year goes into industry: solar panels, electronics, electric vehicles and medical uses. Stronger manufacturing usually supports the price.' },
      { title: 'Constrained supply', text: 'Most silver is mined as a by-product of lead, zinc, copper and gold, so output reacts slowly to price. The Silver Institute has reported market deficits in recent years.' },
      { title: 'Interest rates and the dollar', text: 'Silver pays no interest. Falling real interest rates and a weaker US dollar tend to lift it; rising rates and a strong dollar weigh on it.' },
      { title: 'Investment flows', text: 'Buying and selling by ETFs and of coins and bars can move the price quickly, in both directions.' },
      { title: 'The gold price', text: 'Silver usually follows gold, but with bigger swings: it tends to rise more in metal rallies and fall harder in sell-offs.' },
    ],
    bull: [
      'Industrial demand from solar, electronics and vehicles is structural, not cyclical only.',
      'Supply grows slowly because most silver is a by-product of other metals.',
      'Lower interest rates would reduce the cost of holding a metal that pays no income.',
    ],
    bear: [
      'A global slowdown would hit industrial demand.',
      'A strong dollar or higher rates usually weigh on precious metals.',
    ],
    compare: {
      heading: 'Gold vs silver forecast',
      paragraphs: [
        'Gold and silver often move together, but silver is the more volatile of the two because a large part of its demand is industrial. Investors compare them with the gold/silver ratio: how many ounces of silver one ounce of gold buys. A high ratio means silver is cheap relative to gold; a low ratio means it is expensive.',
        'A side-by-side gold and silver forecast will appear here when the gold price prediction page launches.',
      ],
      link: { label: 'Gold price prediction (coming soon)' },
    },
  },
};
