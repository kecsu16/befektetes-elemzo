// Kulcsok = JSON-mezők nevei. Minden nézetfeladat bővíti a sajátjaival.
export const TOOLTIPS = {
  prices_updated: {
    mit: "Az utolsó sikeres árfrissítés ideje.",
    jo: "Kereskedési időben legfeljebb 1 órás késés a normális.",
  },
  daily_updated: {
    mit: "A napi elemzések (mutatók, előrejelzések) utolsó futásának ideje.",
    jo: "Munkanapokon este frissül; a mai vagy az előző napi dátum rendben van.",
  },
  pe: { mit: "Árfolyam / egy részvényre jutó nyereség (P/E): hány évnyi mostani profitot fizetsz ki.", jo: "Szektorfüggő; a szektormediánnál alacsonyabb olcsóbbat jelez, de csökkenő profit mellett csapda lehet." },
  forward_pe: { mit: "Árfolyam / elemzők által várt jövő évi EPS.", jo: "Ha kisebb a mostani P/E-nél, profitnövekedést várnak." },
  peg: { mit: "P/E osztva az EPS-növekedés %-ával.", jo: "1 körül vagy alatta: a növekedéshez képest nem drága." },
  ev_ebitda: { mit: "Vállalatérték (piaci érték + nettó adósság) / EBITDA.", jo: "Adósságot is figyelembe vesz; 8–12 alatt sok iparágban mérsékelt." },
  ev_sales: { mit: "Vállalatérték / árbevétel.", jo: "Veszteséges cégeknél is használható; a marzzsal együtt értelmes." },
  pb: { mit: "Árfolyam / könyv szerinti érték.", jo: "Bankoknál fontos; 1 alatt a könyv szerinti érték alatt forog." },
  p_fcf: { mit: "Piaci érték / szabad cash flow.", jo: "Minél kisebb, annál több készpénzt termel az árhoz képest; 15–20 alatt kedvező." },
  div_yield: { mit: "Éves osztalék / árfolyam.", jo: "Fenntartható, ha az FCF fedezi; a nagyon magas hozam gyakran veszélyjel." },
  fcf_yield: { mit: "Szabad cash flow / piaci érték.", jo: "5% fölött általában vonzó, negatív = a cég éget pénzt." },
  dcf: { mit: "Diszkontált cash flow belső érték három növekedési forgatókönyvvel (bear/base/bull).", jo: "Erősen függ a feltevésektől (növekedés, WACC) — az érzékenységi táblát is nézd." },
  dcf_weighted: { mit: "A bear/base/bull értékek súlyozott átlaga (alap: 25/50/25%).", jo: "Ha jóval a mostani ár fölött van, alulértékeltséget jelezhet." },
  buy_below: { mit: "Súlyozott belső érték a biztonsági sávval csökkentve (alap: 25%).", jo: "Ez alatt vásárolni ad hibahatárt a téves feltevésekre." },
  margin_of_safety_pct: { mit: "Mennyivel van a súlyozott belső érték a mai ár felett (+) vagy alatt (−).", jo: "Pozitív és nagy = nagyobb tartalék; negatív = a piac többet áraz be." },
  upside: { mit: "Súlyozott DCF-érték / mai ár − 1.", jo: "Pozitív = a modell szerint alulértékelt; a modell érzékeny a növekedési feltevésre." },
  wacc: { mit: "Súlyozott átlagos tőkeköltség (CAPM sajáttőke-költség + adózott hitelköltség).", jo: "Ezzel diszkontál a DCF; magasabb WACC = alacsonyabb belső érték." },
  graham: { mit: "Graham-szám: √(22,5 × EPS × könyv szerinti érték/részvény).", jo: "Konzervatív felső határ védekező befektetőnek; a mai ár alatta = olcsó." },
  lynch: { mit: "Peter Lynch fair value: EPS × (növekedés% + osztalékhozam%).", jo: "Gyorsan növő cégekre; a növekedést 25%-nál vágjuk." },
  ddm: { mit: "Osztalékdiszkontáló modell: Gordon (állandó növekedés) és kétlépcsős.", jo: "Stabil osztalékfizetőknél (pl. bankok) értelmes." },
  residual_income: { mit: "Könyv szerinti érték + a tőkeköltség feletti jövőbeni többletprofit jelenértéke.", jo: "Bankoknál jobb, mint a DCF; a ROE-pálya feltevés." },
  piotroski: { mit: "Piotroski F-score: 9 egyszerű pénzügyi egészségteszt (profit, cash flow, adósság, hatékonyság).", jo: "7–9 erős, 0–3 gyenge." },
  altman_z: { mit: "Altman Z-score: csődkockázati mutató (nem pénzügyi cégekre).", jo: "2,99 felett biztonságos, 1,81 alatt veszélyzóna." },
  beneish_m: { mit: "Beneish M-score: a könyvelési manipuláció valószínűségét becsli.", jo: "−1,78 alatt nem gyanús; fölötte érdemes utánanézni." },
  roe: { mit: "Sajáttőke-arányos nyereség és eszközarányos nyereség.", jo: "ROE 15% fölött jó, ha nem túlzott tőkeáttételből jön." },
  roic_minus_wacc: { mit: "A befektetett tőke hozama mínusz a tőkeköltség.", jo: "Pozitív = értéket teremt; tartósan pozitív = versenyelőny." },
  cagr: { mit: "Átlagos éves növekedési ütem 1, 3 és 5 évre.", jo: "Egyenletes, pozitív növekedés a jó; 5 évhez a forrás gyakran kevés adatot ad." },
  gross_margin: { mit: "Bruttó fedezet / árbevétel.", jo: "Magas és stabil = árazási erő." },
  ebitda_margin: { mit: "EBITDA / árbevétel.", jo: "Iparágon belül összevetve értelmes." },
  operating_margin: { mit: "Működési eredmény / árbevétel.", jo: "Növekvő trend = javuló hatékonyság." },
  net_margin: { mit: "Nettó eredmény / árbevétel.", jo: "10% fölött sok iparágban erős." },
  net_debt_ebitda: { mit: "Nettó adósság / EBITDA: hány év alatt fizethető vissza az adósság.", jo: "2 alatt kényelmes, 3–4 fölött kockázatos." },
  interest_coverage: { mit: "Működési eredmény / kamatráfordítás.", jo: "5 fölött biztonságos, 2 alatt szoros." },
  current_ratio: { mit: "Forgóeszközök / rövid lejáratú kötelezettségek (quick: készletek nélkül).", jo: "1,2–2 körül egészséges." },
  de: { mit: "Adósság / saját tőke.", jo: "Iparágfüggő; 1 alatt mérsékelt." },
  cash_conversion: { mit: "Szabad cash flow / nettó eredmény.", jo: "1 körül vagy felett: a profit valódi készpénz." },
  capex_ratio: { mit: "Beruházás / árbevétel.", jo: "Alacsony = tőkekönnyű üzlet; magas lehet növekedési befektetés is." },
  share_change: { mit: "A részvényszám éves változása.", jo: "Negatív = visszavásárlás (jó a részvényeseknek), pozitív = hígulás." },
  dupont: { mit: "ROE felbontása: nettó marzs × eszközforgási sebesség × tőkeáttétel.", jo: "Megmutatja, hogy a ROE jövedelmezőségből vagy adósságból jön." },
  vol_annual: { mit: "Az árfolyam éves szórása (1 év napi hozamaiból).", jo: "Részvényeknél 20–30% átlagos; nagyobb = vadabb ingadozás." },
  beta: { mit: "Mennyire mozog együtt az indexszel (S&P 500, 5 év heti hozam).", jo: "1 = mint a piac; 1 felett hevesebb, alatta nyugodtabb." },
  sharpe: { mit: "Kockázatmentes hozam feletti hozam / volatilitás (Sortino: csak a lefelé mozgás számít).", jo: "1 felett jó, 2 felett kiváló." },
  sortino: { mit: "Mint a Sharpe, de csak a negatív ingadozást bünteti.", jo: "Magasabb = jobb; 1,5 fölött jó." },
  calmar: { mit: "Éves hozam / maximális visszaesés.", jo: "1 felett a hozam meghaladja a legnagyobb esést." },
  information_ratio: { mit: "Az indexhez mért többlethozam / annak ingadozása.", jo: "0,5 felett jó, 1 felett kiváló." },
  mdd: { mit: "Maximális visszaesés: a legnagyobb csúcs–mélypont esés (5 év).", jo: "Minél kisebb, annál könnyebb kitartani mellette." },
  recovery: { mit: "Hány kereskedési nap alatt érte el újra az előző csúcsot.", jo: "Rövid helyreállás = rugalmas papír." },
  hist_var: { mit: "Value at Risk: az a napi veszteség, amelyet az esetek 95%-ában nem lép túl (historikus és normális eloszlású becslés).", jo: "Minél kisebb, annál kisebb a tipikus rossz nap." },
  param_var: { mit: "99%-os VaR: a legrosszabb 1% napok határa.", jo: "Ha sokkal nagyobb a 95%-osnál, vastag a farok." },
  cvar: { mit: "CVaR: a VaR-nál rosszabb napok átlagos vesztesége.", jo: "A szélsőséges kockázatot mutatja; minél kisebb, annál jobb." },
  stress: { mit: "Hogyan teljesített volna a 2008-as, 2020-as és 2022-es esés idején.", jo: "A piacnál (S&P 500: kb. −55%, −34%, −25%) kisebb esés = védekezőbb." },
  rsi: { mit: "Relatív erő index (14 nap): a közelmúlt emelkedéseinek és eséseinek aránya.", jo: "70 felett túlvett, 30 alatt túladott." },
  macd: { mit: "Két mozgóátlag (12 és 26 nap) különbsége és annak 9 napos jelvonala.", jo: "A hisztogram pozitívvá válása emelkedő lendületet jelez." },
  bollinger: { mit: "20 napos átlag ± 2 szórás sáv.", jo: "A felső sáv érintése túlfeszítettséget, az alsóé gyengeséget jelezhet." },
  atr: { mit: "Átlagos valódi napi ártartomány (14 nap).", jo: "Stop-loss távolság becsléséhez hasznos." },
  stochastic: { mit: "Hol áll a záróár a 14 napos sávban (0–100).", jo: "80 felett túlvett, 20 alatt túladott." },
  sma: { mit: "Egyszerű mozgóátlagok 20, 50, 200 napra.", jo: "Ár a 200 napos felett = hosszú távú emelkedő trend." },
  cross: { mit: "Golden cross: az 50 napos átlag a 200 napos fölé megy; death cross: alá.", jo: "Golden = emelkedő trend, death = csökkenő trend (késve jelez)." },
  momentum: { mit: "Árfolyamváltozás 1, 3, 6 és 12 hónap alatt.", jo: "Tartósan pozitív momentum gyakran folytatódik, de nem garancia." },
  range_52w: { mit: "Távolság az 52 hetes csúcstól és mélyponttól.", jo: "Csúcs közelében erős trend, mélypont közelében gyengeség vagy lehetőség." },
  support: { mit: "Támasz: árszint, ahol korábban többször megállt az esés.", jo: "Áttörése lefelé gyengeségjel." },
  resistance: { mit: "Ellenállás: árszint, ahol korábban többször megállt az emelkedés.", jo: "Áttörése felfelé erősségjel." },
  rel_volume: { mit: "Mai forgalom / az előző 20 nap átlaga.", jo: "1,5 felett szokatlanul nagy érdeklődés." },
  total_huf: { mit: "A pozíciók aktuális értéke forintban (a deviza-papírok mai árfolyamon váltva).", jo: "Tájékoztató összeg; a devizaárfolyam is mozgatja." },
  day_change: { mit: "A portfólió értékének változása az előző záróárhoz képest.", jo: "Egy nap kevés: a hosszú távú trend számít." },
  realized: { mit: "Lezárt (eladott) pozíciók eredménye és a kapott osztalék (FIFO-elv).", jo: "Csak tranzakciós előzményből számolható." },
  xirr: { mit: "Pénzsúlyozott éves hozam: figyelembe veszi, mikor mennyi pénzt tettél be vagy vettél ki.", jo: "A választott benchmark (pl. MSCI World) éves hozama fölött jó." },
  twr: { mit: "Időarányos hozam: a befizetések időzítésétől független teljesítmény.", jo: "Ezzel lehet tisztességesen összevetni egy alappal vagy indexszel." },
  alpha_annual: { mit: "Jensen-alfa: a béta alapján várható hozam feletti többlet évente.", jo: "Pozitív = a kockázatához képest többet hozott, mint a benchmark." },
  risk_contribution: { mit: "Egy pozíció részesedése a portfólió teljes volatilitásából.", jo: "Nagyjából a súlyával arányos a kiegyensúlyozott." },
  max_sharpe: { mit: "A múltbeli adatok szerint a legjobb hozam/kockázat arányú súlyozás.", jo: "Tájékoztató: a várható hozam becslése bizonytalan." },
  min_var: { mit: "A legkisebb ingadozású súlyozás a papírjaidból.", jo: "Védekező kiindulópont." },
  mae: { mit: "Átlagos abszolút hiba: mennyivel tévedett átlagosan a medián előrejelzés (árban).", jo: "Minél kisebb; a naiv modellnél kisebbnek kell lennie, hogy súlyt kapjon." },
  mape: { mit: "Átlagos abszolút százalékos hiba.", jo: "Minél kisebb; 1 hónapra 5–8% alatt jó." },
  hit_rate: { mit: "Találati arány: milyen gyakran találta el az irányt (fel/le).", jo: "50% felett jobb a pénzfeldobásnál; 55–60% már érdemi." },
  cov90: { mit: "Kalibráció: az esetek hány százaléka esett a 90%-os sávba.", jo: "Kb. 90% a jó; jóval kevesebb = túl magabiztos a modell." },
  cov50: { mit: "Az esetek hány százaléka esett a 25–75%-os sávba.", jo: "Kb. 50% a jó." },
  p_below_buy: { mit: "Mekkora eséllyel lesz az ár a DCF-alapú vételi szint alatt a horizont végén.", jo: "Magasabb = nagyobb esély kedvező vételi lehetőségre." },
  p_above_now: { mit: "Mekkora eséllyel lesz az ár a mostani felett a horizont végén.", jo: "50% körül semleges; a modellek bizonytalanok, ne kezeld jóslatként." },
  garch_vol_annual: { mit: "GARCH-modell szerinti várható volatilitás a következő hónapra, évesítve.", jo: "Ha nagyobb a historikus volatilitásnál, élénkebb ingadozás várható." },
  target_mean: { mit: "Az elemzők átlagos 12 hónapos célára.", jo: "Tájékoztató; az elemzők gyakran túl optimisták." },
  target_range: { mit: "A legalacsonyabb és legmagasabb elemzői célár.", jo: "Széles sáv = nagy bizonytalanság." },
};

let pop = null;
function hide() { pop?.remove(); pop = null; }
export const hideTooltip = hide;

export function attachTooltip(el, key) {
  const t = TOOLTIPS[key];
  if (!t) return;
  el.classList.add("tip");
  el.tabIndex = 0;
  const show = () => {
    hide();
    pop = document.createElement("div");
    pop.className = "tooltip-pop";
    pop.setAttribute("role", "tooltip");
    const a = document.createElement("div");
    a.textContent = `Mit jelent: ${t.mit}`;
    const b = document.createElement("div");
    b.textContent = `Mi a jó: ${t.jo}`;
    pop.append(a, b);
    document.body.append(pop);
    const r = el.getBoundingClientRect();
    const left = Math.min(r.left + scrollX, document.documentElement.clientWidth - 276);
    pop.style.left = `${Math.max(8, left)}px`;
    pop.style.top = `${r.bottom + scrollY + 6}px`;
  };
  el.addEventListener("mouseenter", show);
  el.addEventListener("focus", show);
  el.addEventListener("click", show);
  el.addEventListener("mouseleave", hide);
  el.addEventListener("blur", hide);
}
