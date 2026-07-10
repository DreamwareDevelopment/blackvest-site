/**
 * site.config.ts: blackvest.ai marketing front door.
 *
 * Launch posture (2026-07-09 spec): full mechanic, NO dollar figures and NO
 * refund-guarantee claims (ADR-020 OQ#1 pending counsel). Every CTA routes to
 * the live funnel. Never imports the vault.
 */
export interface SiteConfig {
  name: string;
  tagline: string;
  origin: string;
  funnelUrl: string;
  showcaseUrl: string;
  /** Proof-strip claims. Each MUST trace to a real system fact (ADR-019 invariants). */
  proof: { n: string; label: string }[];
}

export const site: SiteConfig = {
  name: 'blackvest',
  tagline: 'The role you actually want has a gate.',
  origin: 'https://blackvest.ai',
  funnelUrl: 'https://app.blackvest.ai',
  showcaseUrl: 'https://showcase.blackvest.ai',
  // Verified against the real system (ADR-019 invariants + the live showcase):
  //  - human-approval gate before every send → "100% human-approved"
  //  - no-fabricate-metrics rule → "0 fabricated claims"
  //  - agent does ~95% of the work, human gates the send → "95% automated"
  proof: [
    { n: '95%', label: 'of the work, automated' },
    { n: '100%', label: 'human-approved before send' },
    { n: '0', label: 'fabricated claims, ever' },
  ],
};
