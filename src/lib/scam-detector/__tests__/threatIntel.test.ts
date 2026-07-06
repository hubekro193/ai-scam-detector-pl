import { afterEach, describe, expect, it } from "vitest";
import {
  _resetCacheForTesting,
  _setCacheForTesting,
  isDomainFlagged,
  getThreatIntelStatus,
} from "../threatIntel";
import { analyzeMessage } from "../index";

describe("threatIntel — CERT Polska Warning List cache (offline, no real network calls)", () => {
  afterEach(() => {
    _resetCacheForTesting();
  });

  it("returns false for everything when the cache is empty (never fetched yet)", () => {
    expect(isDomainFlagged("dowolna-domena.example.com")).toBe(false);
  });

  it("flags an exact match against the cached list", () => {
    _setCacheForTesting(["zly-phishing.example-flagged.com"]);
    expect(isDomainFlagged("zly-phishing.example-flagged.com")).toBe(true);
  });

  it("flags a subdomain of a listed domain (per CERT Polska's own spec)", () => {
    _setCacheForTesting(["a.example-flagged.com"]);
    expect(isDomainFlagged("b.a.example-flagged.com")).toBe(true);
  });

  it("does NOT flag the parent of a listed subdomain", () => {
    _setCacheForTesting(["a.example-flagged.com"]);
    expect(isDomainFlagged("example-flagged.com")).toBe(false);
  });

  it("does not flag unrelated domains", () => {
    _setCacheForTesting(["zly-phishing.example-flagged.com"]);
    expect(isDomainFlagged("allegro.pl")).toBe(false);
  });

  it("exposes cache status for diagnostics", () => {
    _setCacheForTesting(["a.example.com", "b.example.com"], 12345);
    const status = getThreatIntelStatus();
    expect(status.domainCount).toBe(2);
    expect(status.lastFetchedAt).toBe(12345);
  });
});

describe("threatIntel integration with the link detector", () => {
  afterEach(() => {
    _resetCacheForTesting();
  });

  it("flags a link whose domain is on the (test-seeded) CERT Polska list as Critical", () => {
    _setCacheForTesting(["zly-phishing.example-flagged.com"]);
    const result = analyzeMessage(
      "Sprawdz status przesylki tutaj: http://zly-phishing.example-flagged.com/status"
    );
    expect(result.detectedSignals.map((s) => s.id)).toContain("link.cert-polska-warning-list");
    expect(result.riskLevel).toBe("Critical");
  });

  it("does not add the CERT Polska signal when the cache is empty (graceful degradation)", () => {
    const result = analyzeMessage("Sprawdz status przesylki tutaj: http://przyklad.example.com/status");
    expect(result.detectedSignals.map((s) => s.id)).not.toContain("link.cert-polska-warning-list");
  });
});
