const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "Czy to narzędzie daje 100% pewności?",
    a: "Nie. AI Scam Detector PL ocenia ryzyko na podstawie typowych wzorców oszustw, ale nie może zagwarantować, że wiadomość jest bezpieczna albo niebezpieczna. Metody oszustów zmieniają się cały czas — traktuj wynik jako wsparcie w podjęciu decyzji, nie ostateczny wyrok.",
  },
  {
    q: "Co dzieje się z wiadomością, którą wklejam?",
    a: "Analiza działa bezstanowo: treść trafia do silnika oceny ryzyka wyłącznie na czas sprawdzenia i nie jest nigdzie zapisywana ani logowana. Jeśli włączone jest wyjaśnienie AI, do modelu wysyłane są tylko wykryte sygnały (np. „podejrzany link”), nigdy pełna treść wiadomości.",
  },
  {
    q: "Jakie wiadomości mogę sprawdzić?",
    a: "SMS-y, e-maile, wiadomości z OLX, Allegro, WhatsApp, a także te podszywające się pod kuriera, bank czy urząd. Wystarczy wkleić samą treść.",
  },
  {
    q: "Czy powinienem/powinnam wklejać hasła albo kody BLIK?",
    a: "Nie. Do analizy nie jest to potrzebne. Nigdy nie wklejaj haseł, kodów BLIK, numerów kart, CVV ani numeru PESEL — ani tutaj, ani nigdzie indziej, gdy o to prosi wiadomość.",
  },
];

export function Faq() {
  return (
    <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
      {FAQ_ITEMS.map((item) => (
        <details key={item.q} className="group p-4 open:bg-slate-50">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-slate-800 marker:content-none">
            {item.q}
            <span className="shrink-0 text-lg text-slate-400 transition-transform duration-200 group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
