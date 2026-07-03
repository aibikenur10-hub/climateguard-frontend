import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import FloatingChat from "./FloatingChat";
import Weather from "./Weather";
import KazakhstanMap from "./KazakhstanMap";

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
    badge: "AI · BETA",
    heroTitle: "Климатические риски",
    heroTitleAccent: "Казахстана",
    heroSub: "Анализ паводков и засух по регионам с помощью Oylan AI. Выберите регион и получите детальный прогноз.",
    stat1n: "14", stat1l: "регионов",
    stat2n: "2", stat2l: "типа риска",
    stat3n: "3", stat3l: "языка",
    region: "Регион",
    region2: "Второй регион (для сравнения)",
    risk: "Тип риска",
    season: "Сезон",
    flood: "Паводок",
    drought: "Засуха",
    analyze: "Анализировать",
    compare: "Сравнить",
    loading: "Анализируем...",
    history: "История запросов",
    placeholder: "Выберите регион",
    placeholder2: "Необязательно",
    error: "Ошибка. Попробуйте снова.",
    result: "Результат анализа",
    summary: "Краткий итог",
    copy: "Копировать",
    copied: "Скопировано",
    vs: "vs",
    high: "ВЫСОКИЙ", medium: "СРЕДНИЙ", low: "НИЗКИЙ",
    chatTitle: "Задать вопрос",
  },
  kz: {
    title: "ClimateGuard",
    badge: "AI · BETA",
    heroTitle: "Климаттық тәуекелдер",
    heroTitleAccent: "Қазақстан",
    heroSub: "Oylan AI көмегімен аймақтар бойынша су тасқыны мен қуаңшылықты талдау.",
    stat1n: "14", stat1l: "аймақ",
    stat2n: "2", stat2l: "тәуекел түрі",
    stat3n: "3", stat3l: "тіл",
    region: "Аймақ",
    region2: "Екінші аймақ",
    risk: "Тәуекел түрі",
    season: "Мезгіл",
    flood: "Су тасқыны",
    drought: "Қуаңшылық",
    analyze: "Талдау",
    compare: "Салыстыру",
    loading: "Талдануда...",
    history: "Тарих",
    placeholder: "Аймақты таңдаңыз",
    placeholder2: "Міндетті емес",
    error: "Қате. Қайталаңыз.",
    result: "Талдау нәтижесі",
    summary: "Қысқаша қорытынды",
    copy: "Көшіру",
    copied: "Көшірілді",
    vs: "vs",
    high: "ЖОҒАРЫ", medium: "ОРТАША", low: "ТӨМЕН",
    chatTitle: "Сұрақ қою",
  },
  en: {
    title: "ClimateGuard",
    badge: "AI · BETA",
    heroTitle: "Climate Risk Analysis",
    heroTitleAccent: "Kazakhstan",
    heroSub: "Analyze flood and drought risks across regions of Kazakhstan using Oylan AI. Select a region for a detailed forecast.",
    stat1n: "14", stat1l: "regions",
    stat2n: "2", stat2l: "risk types",
    stat3n: "3", stat3l: "languages",
    region: "Region",
    region2: "Second region (optional)",
    risk: "Risk Type",
    season: "Season",
    flood: "Flood",
    drought: "Drought",
    analyze: "Analyze",
    compare: "Compare",
    loading: "Analyzing...",
    history: "Recent queries",
    placeholder: "Select a region",
    placeholder2: "Optional",
    error: "Error. Please try again.",
    result: "Analysis result",
    summary: "Summary",
    copy: "Copy",
    copied: "Copied",
    vs: "vs",
    high: "HIGH", medium: "MEDIUM", low: "LOW",
    chatTitle: "Ask a question",
  },
};

function getRiskLevel(text) {
  const u = (text || "").toUpperCase();
  if (u.includes("HIGH") || u.includes("ВЫСОК") || u.includes("ЖОҒАРЫ")) return "high";
  if (u.includes("MEDIUM") || u.includes("СРЕДН") || u.includes("ОРТАША")) return "medium";
  if (u.includes("LOW") || u.includes("НИЗК") || u.includes("ТӨМЕН")) return "low";
  return "medium";
}

function RiskBadge({ text, t }) {
  const level = getRiskLevel(text);
  return <div className={`risk-badge ${level}`}>{t[level]}</div>;
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
        <div className="result-meta">
          <span className="result-label">{t.result}</span>
          <span className="result-region">{region}</span>
        </div>
        {result && (
          <button className="copy-btn" onClick={handleCopy}>
            {copied ? t.copied : t.copy}
          </button>
        )}
      </div>
      {error ? <p className="error-text">{error}</p> : <div className="result-text">{result}</div>}
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
  const navigate = useNavigate();
  const [lang, setLang] = useState("ru");
  const [theme, setTheme] = useState("dark");
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
  const [activeMapTab, setActiveMapTab] = useState(1);
  const [forecastRegion, setForecastRegion] = useState("");
  const [showForecast, setShowForecast] = useState(false);

  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); }, [theme]);

  const t = LABELS[lang];
  const seasonName = SEASONS[lang][season];

  async function fetchAnalysis(reg) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ region: `${reg} (${seasonName})`, risk_type: riskType, language: lang }),
    });
    return (await res.json()).analysis;
  }

  async function fetchSummary(analysis) {
    const p = lang === "ru" ? `Дай краткий итог в 2-3 предложениях: ${analysis}`
      : lang === "kz" ? `2-3 сөйлемде қорытынды бер: ${analysis}`
      : `Give a brief summary in 2-3 sentences: ${analysis}`;
    const res = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: p }),
    });
    return (await res.json()).reply;
  }

  async function handleAnalyze() {
    if (!region) return;
    setLoading(true); setError(null); setResult(null); setResult2(null); setSummary(null); setSummary2(null);
    try {
      const r1 = await fetchAnalysis(region); setResult(r1);
      const s1 = await fetchSummary(r1); setSummary(s1);
      if (region2) {
        const r2 = await fetchAnalysis(region2); setResult2(r2);
        const s2 = await fetchSummary(r2); setSummary2(s2);
      }
      setHistory(p => [{ region, region2, riskType, season: seasonName, time: new Date().toLocaleTimeString() }, ...p.slice(0, 4)]);
    } catch { setError(t.error); }
    finally { setLoading(false); }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <span className="logo-mark">CG</span>
          <span className="logo-text">{t.title}</span>
          <span className="logo-badge">{t.badge}</span>
        </div>
<div className="header-right">
          <button className="theme-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <div className="lang-switch">
            {["ru", "kz", "en"].map(l => (
              <button key={l} className={`lang-btn ${lang === l ? "active" : ""}`} onClick={() => setLang(l)}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-eyebrow">
          <span className="hero-dot"></span>
          Oylan AI — Kazakhtan Climate Intelligence
        </div>
        <h1 className="hero-title">
          {t.heroTitle} <span>{t.heroTitleAccent}</span>
        </h1>
        <p className="hero-subtitle">{t.heroSub}</p>
        <div className="hero-stats">
          <div><div className="hero-stat-num">{t.stat1n}</div><div className="hero-stat-label">{t.stat1l}</div></div>
          <div><div className="hero-stat-num">{t.stat2n}</div><div className="hero-stat-label">{t.stat2l}</div></div>
          <div><div className="hero-stat-num">{t.stat3n}</div><div className="hero-stat-label">{t.stat3l}</div></div>
        </div>
      </section>

      <main className="main">
        <div className="dashboard">
          <div className="map-tabs-container">
            <div className="map-tabs">
              <button
                className={`map-tab ${activeMapTab === 1 ? "active" : ""}`}
                onClick={() => setActiveMapTab(1)}
              >
                {t.region} {region && <span className="map-tab-badge">{region.replace(" область", "")}</span>}
              </button>
              <button
                className={`map-tab ${activeMapTab === 2 ? "active" : ""}`}
                onClick={() => setActiveMapTab(2)}
              >
                {t.region2} {region2 && <span className="map-tab-badge">{region2.replace(" область", "")}</span>}
              </button>
            </div>
            {activeMapTab === 1 ? (
              <KazakhstanMap selected={region} onSelect={setRegion} t={t} />
            ) : (
              <KazakhstanMap selected={region2} onSelect={setRegion2} t={t} />
            )}
          </div>

          {region && <Weather region={region} title={region} />}
         {region2 && <Weather region={region2} title={region2} />}

          <div className="form-card">
            <div className="form-row">
              <div className="field">
                <label className="field-label">{t.region}</label>
                <select className="select" value={region} onChange={e => setRegion(e.target.value)}>
                  <option value="">{t.placeholder}</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="field-label">{t.region2}</label>
                <select className="select" value={region2} onChange={e => setRegion2(e.target.value)}>
                  <option value="">{t.placeholder2}</option>
                  {REGIONS.filter(r => r !== region).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label className="field-label">{t.risk}</label>
                <div className="risk-toggle">
                  <button className={`risk-btn ${riskType === "flood" ? "active flood" : ""}`} onClick={() => setRiskType("flood")}>{t.flood}</button>
                  <button className={`risk-btn ${riskType === "drought" ? "active drought" : ""}`} onClick={() => setRiskType("drought")}>{t.drought}</button>
                </div>
              </div>
              <div className="field">
                <label className="field-label">{t.season}</label>
                <div className="season-toggle">
                  {SEASONS[lang].map((s, i) => (
                    <button key={i} className={`season-btn ${season === i ? "active" : ""}`} onClick={() => setSeason(i)}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="form-footer">
              <button className="analyze-btn" onClick={handleAnalyze} disabled={!region || loading}>
                {loading && <span className="btn-spinner"></span>}
                {loading ? t.loading : region2 ? t.compare : t.analyze}
              </button>
            </div>
          </div>

          {(result || error) && !region2 && (
            <ResultCard result={result} summary={summary} error={error} region={region} t={t} />
          )}
          {}
          {region2 && (result || result2) && (
            <div className="compare-grid">
              <ResultCard result={result} summary={summary} region={region} t={t} />
              <div className="vs-divider">{t.vs}</div>
              <ResultCard result={result2} summary={summary2} region={region2} t={t} />
            </div>
          )}

          {history.length > 0 && (
            <div className="history-card">
              <p className="section-label">{t.history}</p>
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
      <FloatingChat />
    </div>
  );
}