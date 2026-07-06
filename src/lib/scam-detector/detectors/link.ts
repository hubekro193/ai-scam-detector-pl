import type { Detector, Signal } from "../types";
import { extractUrls } from "../utils";
import { isDomainFlagged } from "../threatIntel";

const SHORTENERS = [
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "cutt.ly",
  "is.gd",
  "buff.ly",
  "shorturl.at",
  "rebrand.ly",
  "s.id",
];

/** Brands commonly impersonated in PL scam messages, and their real domains. */
const BRANDS: { name: string; keywords: string[]; officialDomains: string[] }[] = [
  { name: "InPost", keywords: ["inpost"], officialDomains: ["inpost.pl"] },
  { name: "DPD", keywords: ["dpd"], officialDomains: ["dpd.com.pl", "dpd.com"] },
  { name: "DHL", keywords: ["dhl"], officialDomains: ["dhl.com", "dhl.de"] },
  { name: "Poczta Polska", keywords: ["poczta-polska", "pocztapolska", "poczta polska"], officialDomains: ["poczta-polska.pl"] },
  { name: "Allegro", keywords: ["allegro"], officialDomains: ["allegro.pl"] },
  { name: "OLX", keywords: ["olx"], officialDomains: ["olx.pl"] },
  { name: "PayU", keywords: ["payu"], officialDomains: ["payu.pl", "payu.com"] },
  { name: "mBank", keywords: ["mbank"], officialDomains: ["mbank.pl"] },
  { name: "PKO BP", keywords: ["pkobp", "pko bp", "ipko"], officialDomains: ["pkobp.pl", "ipko.pl"] },
  { name: "ING", keywords: ["ing bank", "ingbank"], officialDomains: ["ing.pl"] },
  { name: "Santander", keywords: ["santander"], officialDomains: ["santander.pl"] },
];

const SUSPICIOUS_TLDS = [
  ".xyz",
  ".top",
  ".club",
  ".info",
  ".site",
  ".online",
  ".click",
  ".buzz",
  ".link",
  ".icu",
  ".cfd",
  ".live",
  ".cc",
  ".cyou",
  ".gq",
  ".tk",
  ".ml",
  ".cam",
  ".rest",
];

export const detectLinkRisk: Detector = (text, normalized) => {
  const signals: Signal[] = [];
  const urls = extractUrls(text);
  if (urls.length === 0) return signals;

  for (const url of urls) {
    const { hostname, raw } = url;

    // 0. Confirmed hit against the CERT Polska Warning List — a curated,
    // continuously updated feed of real phishing domains targeting Polish
    // users. Checked against a locally cached copy (see threatIntel.ts) —
    // this domain is never sent anywhere. Highest-confidence link signal
    // in the engine, since it's a verified report rather than a heuristic.
    if (isDomainFlagged(hostname)) {
      signals.push({
        id: "link.cert-polska-warning-list",
        category: "link",
        severity: "critical",
        label: "Domena na liście ostrzeżeń CERT Polska",
        explanation:
          "Ta domena znajduje się na oficjalnej Liście Ostrzeżeń CERT Polska — potwierdzonym, na bieżąco aktualizowanym rejestrze stron wykorzystywanych do oszustw wobec polskich internautów.",
        evidence: hostname,
        authoritative: true,
      });
    }

    // 1. URL shorteners hide the real destination.
    if (SHORTENERS.some((s) => hostname === s || hostname.endsWith(`.${s}`))) {
      signals.push({
        id: "link.shortener",
        category: "link",
        severity: "medium",
        label: "Skrócony link",
        explanation:
          "Wiadomość zawiera skrócony link, który ukrywa prawdziwy adres strony docelowej.",
        evidence: raw,
      });
    }

    // 2. Brand impersonation: brand name appears in message or domain, but domain
    // isn't one of the brand's official domains.
    for (const brand of BRANDS) {
      const brandMentioned =
        brand.keywords.some((k) => normalized.includes(k)) ||
        brand.keywords.some((k) => hostname.includes(k.replace(/\s/g, "")));

      if (!brandMentioned) continue;

      const isOfficial = brand.officialDomains.some(
        (d) => hostname === d || hostname.endsWith(`.${d}`)
      );

      if (!isOfficial) {
        signals.push({
          id: `link.brand-mismatch.${brand.name.toLowerCase()}`,
          category: "link",
          severity: "high",
          label: `Domena podszywa się pod ${brand.name}`,
          explanation: `Wiadomość powołuje się na ${brand.name}, ale link prowadzi do domeny "${hostname}", która nie jest oficjalną domeną ${brand.name}.`,
          evidence: raw,
        });
      }
    }

    // 3. Suspicious / cheap TLDs often used for throwaway phishing domains.
    if (SUSPICIOUS_TLDS.some((tld) => hostname.endsWith(tld))) {
      signals.push({
        id: "link.suspicious-tld",
        category: "link",
        severity: "low",
        label: "Nietypowa końcówka domeny",
        explanation:
          "Domena ma końcówkę rzadko używaną przez legalne polskie firmy (np. .xyz, .top, .click) — często wykorzystywaną do jednorazowych stron phishingowych.",
        evidence: hostname,
      });
    }

    // 4. Domain with many hyphens or digits — typical of auto-generated phishing domains.
    const hyphenCount = (hostname.match(/-/g) ?? []).length;
    if (hyphenCount >= 2 || /\d{3,}/.test(hostname)) {
      signals.push({
        id: "link.suspicious-structure",
        category: "link",
        severity: "medium",
        label: "Podejrzana struktura domeny",
        explanation:
          "Domena zawiera nietypowo dużo myślników lub cyfr — częsta cecha domen generowanych do phishingu.",
        evidence: hostname,
      });
    }
  }

  return signals;
};
