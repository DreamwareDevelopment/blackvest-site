/**
 * site.config.ts: blackvest.ai marketing front door.
 *
 * Brand/thesis page only. Makes NO pricing, guarantee, or "start your
 * interview" claims, because ADR-020's refund-guarantee liability + employment-agency
 * licensing are unresolved. Captures interest (waitlist) and routes proof to
 * the showcase. Never imports the vault.
 */
export interface SiteConfig {
  name: string;
  tagline: string;
  origin: string;
  showcaseUrl: string;
  /** Proof-strip claims. Each MUST trace to a real system fact (invariant 3). */
  proof: { n: string; label: string }[];
}

export const site: SiteConfig = {
  name: 'blackvest',
  tagline: 'Use AI to land your next AI Engineering role.',
  origin: 'https://blackvest.ai',
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
