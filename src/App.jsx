import Chat from "./Chat"
import { useState } from "react";
import "./App.css";

const REGIONS = [
  "Северо-Казахстанская область",
  "Акмолинская область",
  "Костанайская область",
  "Павлодарская область",
  "Восточно-Казахстанская область",
  "Карагандинская область",
  "Алматинская область",
  "Жамбылская область",
  "Туркестанская область",
  "Кызылординская область",
  "Актюбинская область",
  "Западно-Казахстанская область",
  "Атырауская область",
  "Мангистауская область",
];

const SEASONS = {
  ru: ["Весна", "Лето", "Осень", "Зима"],
  kz: ["Көктем", "Жаз", "Күз", "Қыс"],
  en: ["Spring", "Summer", "Autumn", "Winter"],
};

const LABELS = {
  ru: {
    title: "ClimateGuard",
    subtitle: "Анализ климатических рисков Казахстана",
    region: "Регион",
    region2: "Второй регион (для сравнения)",
    risk: "Тип риска",
    season: "Сезон",
    flood: "Паводок",
    drought: "Засуха",
    analyze: "Анализировать",
    compare: "Сравнить регионы",
    loading: "Анализируем...",
    history: "История запросов",
    placeholder: "Выберите регион",
    placeholder2: "Выберите второй регион (необязательно)",
    error: "Ошибка. Попробуйте снова.",
    result: "Результат анализа",
    summary: "Краткий итог",
    copy: "Скопировать",
    copied: "Скопировано",
    vs: "vs",
    high: "ВЫСОКИЙ",
    medium: "СРЕДНИЙ",
    low: "НИЗКИЙ",
  },
  kz: {
    title: "ClimateGuard",
    subtitle: "Қазақстанның климаттық тәуекелдерін талдау",
    region: "Аймақ",
    region2: "Екінші аймақ (салыстыру үшін)",
    risk: "Тәуекел түрі",
    season: "Мезгіл",
    flood: "Су тасқыны",
    drought: "Қуаңшылық",
    analyze: "Талдау",
    compare: "Аймақтарды салыстыру",
    loading: "Талдануда...",
    history: "Сұраулар тарихы",
    placeholder: "Аймақты таңдаңыз",
    placeholder2: "Екінші аймақты таңдаңыз (міндетті емес)",
    error: "Қате. Қайталап көріңіз.",
    result: "Талдау нәтижесі",
    summary: "Қысқаша қорытынды",
    copy: "Көшіру",
    copied: "Көшірілді",
    vs: "vs",
    high: "ЖОҒАРЫ",
    medium: "ОРТАША",
    low: "ТӨМЕН",
  },
  en: {
    title: "ClimateGuard",
    subtitle: "Kazakhstan Climate Risk Analysis",
    region: "Region",
    region2: "Second region (for comparison)",
    risk: "Risk Type",
    season: "Season",
    flood: "Flood",
    drought: "Drought",
    analyze: "Analyze",
    compare: "Compare Regions",
    loading: "Analyzing...",
    history: "Recent Queries",
    placeholder: "Select a region",
    placeholder2: "Select second region (optional)",
    error: "Error. Please try again.",
    result: "Analysis Result",
    summary: "Summary",
    copy: "Copy",
    copied: "Copied",
    vs: "vs",
    high: "HIGH",
    medium: "MEDIUM",
    low: "LOW",
  },
};

function getRiskLevel(text) {
  const upper = (text || "").toUpperCase();
  if (upper.includes("HIGH") || upper.includes("ВЫСОК") || upper.includes("ЖОҒАРЫ")) return "high";
  if (upper.includes("MEDIUM") || upper.includes("СРЕДН") || upper.includes("ОРТАША")) return "medium";
  if (upper.includes("LOW") || upper.includes("НИЗК") || upper.includes("ТӨМЕН")) return "low";
  return "medium";
}

function RiskBadge({ text, t }) {
  const level = getRiskLevel(text);
  const label = t[level];
  return <div className={`risk-badge ${level}`}>{label}</div>;
}

function ResultCard({ region, result, summary, error, t }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(result || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`result-card ${result ? getRiskLevel(result) : ""}`}>
      {result && <RiskBadge text={result} t={t} />}
      <div className="result-header">
        <div>
          <h2 className="result-title">{t.result}</h2>
          <p className="result-region">{region}</p>
        </div>
        {result && (
          <button className="copy-btn" onClick={handleCopy}>
            {copied ? t.copied : t.copy}
          </button>
        )}
      </div>
      {error ? (
        <p className="error-text">{error}</p>
      ) : (
        <div className="result-text">{result}</div>
      )}
      {summary && (
        <div className="summary-block">
          <p className="summary-label">{t.summary}</p>
          <p className="summary-text">{summary}</p>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState("ru");
  const [region, setRegion] = useState("");
  const [region2, setRegion2] = useState("");
  const [riskType, setRiskType] = useState("flood");
  const [season, setSeason] = useState(0);
  const [result, setResult] = useState(null);
  const [result2, setResult2] = useState(null);
  const [summary, setSummary] = useState(null);
  const [summary2, setSummary2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const t = LABELS[lang];
  const seasonName = SEASONS[lang][season];

  async function fetchAnalysis(reg) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        region: `${reg} (${seasonName})`,
        risk_type: riskType,
        language: lang,
      }),
    });
    const data = await res.json();
    return data.analysis;
  }

  async function fetchSummary(analysis) {
    const summaryPrompt = lang === "ru"
      ? `На основе этого анализа дай краткий итог в 2-3 предложениях: ${analysis}`
      : lang === "kz"
      ? `Осы талдау негізінде 2-3 сөйлемде қысқаша қорытынды бер: ${analysis}`
      : `Based on this analysis, give a brief summary in 2-3 sentences: ${analysis}`;
    const res = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: summaryPrompt }),
    });
    const data = await res.json();
    return data.reply;
  }

  async function handleAnalyze() {
    if (!region) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setResult2(null);
    setSummary(null);
    setSummary2(null);
    try {
      const r1 = await fetchAnalysis(region);
      setResult(r1);
      const s1 = await fetchSummary(r1);
      setSummary(s1);

      if (region2) {
        const r2 = await fetchAnalysis(region2);
        setResult2(r2);
        const s2 = await fetchSummary(r2);
        setSummary2(s2);
      }

      setHistory((prev) => [
        { region, region2, riskType, season: seasonName, time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 4),
      ]);
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <span className="logo-mark">CG</span>
          <span className="logo-text">{t.title}</span>
        </div>
        <div className="lang-switch">
          {["ru", "kz", "en"].map((l) => (
            <button key={l} className={`lang-btn ${lang === l ? "active" : ""}`} onClick={() => setLang(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <main className="main">
        <div className="hero">
          <h1 className="hero-title">{t.subtitle}</h1>
        </div>

        <div className="dashboard">
          <div className="form-card">
            <div className="form-row">
              <div className="field">
                <label className="field-label">{t.region}</label>
                <select className="select" value={region} onChange={(e) => setRegion(e.target.value)}>
                  <option value="">{t.placeholder}</option>
                  {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="field-label">{t.region2}</label>
                <select className="select" value={region2} onChange={(e) => setRegion2(e.target.value)}>
                  <option value="">{t.placeholder2}</option>
                  {REGIONS.filter((r) => r !== region).map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="field">
                <label className="field-label">{t.risk}</label>
                <div className="risk-toggle">
                  <button className={`risk-btn ${riskType === "flood" ? "active flood" : ""}`} onClick={() => setRiskType("flood")}>
                    {t.flood}
                  </button>
                  <button className={`risk-btn ${riskType === "drought" ? "active drought" : ""}`} onClick={() => setRiskType("drought")}>
                    {t.drought}
                  </button>
                </div>
              </div>
              <div className="field">
                <label className="field-label">{t.season}</label>
                <div className="season-toggle">
                  {SEASONS[lang].map((s, i) => (
                    <button key={i} className={`season-btn ${season === i ? "active" : ""}`} onClick={() => setSeason(i)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button className="analyze-btn" onClick={handleAnalyze} disabled={!region || loading}>
              {loading ? t.loading : region2 ? t.compare : t.analyze}
            </button>
          </div>

          {(result || error) && !region2 && (
            <ResultCard result={result} summary={summary} error={error} region={region} t={t} />
          )}

          {region2 && (result || result2) && (
            <div className="compare-grid">
              <ResultCard result={result} summary={summary} region={region} t={t} />
              <div className="vs-divider">{t.vs}</div>
              <ResultCard result={result2} summary={summary2} region={region2} t={t} />
            </div>
          )}

          {history.length > 0 && (
            <div className="history-card">
              <h3 className="history-title">{t.history}</h3>
              <ul className="history-list">
                {history.map((h, i) => (
                  <li key={i} className="history-item">
                    <span className="history-region">{h.region}{h.region2 ? ` vs ${h.region2}` : ""}</span>
                    <span className="history-season">{h.season}</span>
                    <span className="history-risk">{h.riskType === "flood" ? t.flood : t.drought}</span>
                    <span className="history-time">{h.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
       </div>
      </main>
      
      <section style={{ borderTop: "1px solid #1e3050", marginTop: "40px", paddingTop: "20px" }}>
        <Chat />
      </section>
    </div>
  );
}
