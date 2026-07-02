import { describe, expect, it } from "vitest";
import { normalize, extractUrls } from "../utils.js";

describe("normalize() — Polish letter handling (Module 10 regression)", () => {
  it("converts 'ł' to 'l', since NFD does not decompose it on its own", () => {
    expect(normalize("przesyłka")).toBe("przesylka");
    expect(normalize("dopłata")).toBe("doplata");
    expect(normalize("błąd")).toBe("blad");
    expect(normalize("złoty")).toBe("zloty");
  });

  it("still strips ordinary combining diacritics", () => {
    expect(normalize("Zwrócona przesyłka, część kwoty")).toBe("zwrocona przesylka, czesc kwoty");
  });
});

describe("extractUrls() — defanged link handling", () => {
  it("refangs hxxp(s):// and [.] notation before parsing", () => {
    const urls = extractUrls("Link: hxxps://inpost-weryfikacja[.]example[.]com/PL");
    expect(urls).toHaveLength(1);
    expect(urls[0]?.hostname).toBe("inpost-weryfikacja.example.com");
  });

  it("still parses normal, non-defanged URLs", () => {
    const urls = extractUrls("Zobacz: https://allegro.pl/oferta/123");
    expect(urls).toHaveLength(1);
    expect(urls[0]?.hostname).toBe("allegro.pl");
  });
});
