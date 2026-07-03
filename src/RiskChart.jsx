import { useState, useEffect } from "react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip, Legend
} from "recharts";
import "./RiskChart.css";

const API_URL = import.meta.env.VITE_API_URL;

const SEASONS_RU = ["Весна", "Лето", "Осень", "Зима"];
const SEASONS_EN = ["Spring", "Summer", "Autumn", "Winter"];
const SEASONS_KZ = ["Көктем", "Жаз", "Күз", "Қыс"];

function getLang(lang) {
  if (lang === "kz") return SEASONS_KZ;
  if (lang === "en") return SEASONS_EN;
  return SEASONS_RU;
}

function parseRiskLevel(text) {
  const u = (text || "").toUpperCase();
  if (u.includes("HIGH") || u.includes("ВЫСОК") || u.includes("ЖОҒАРЫ")) return 90;
  if (u.includes("MEDIUM") || u.includes("СРЕДН") || u.includes("ОРТАША")) return 55;
  if (u.includes("LOW") || u.includes("НИЗК") || u.includes("ТӨМЕН")) return 20;
  return 50;
}

export default function RiskChart({ region, lang = "ru" }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const seasons = getLang(lang);
  const labels = {
    ru: { title: "График рисков по сезонам", flood: "Паводок", drought: "Засуха", loading: "Строим график..." },
    kz: { title: "Маусымдар бойынша тәуекел графигі", flood: "Су тасқыны", drought: "Қуаңшылық", loading: "График жасалуда..." },
    en: { title: "Seasonal Risk Chart", flood: "Flood", drought: "Drought", loading: "Building chart..." },
  }[lang] || {};

  useEffect(() => {
    if (!region) return;
    setLoading(true);
    setData(null);

    async function fetchRisk(season, type) {
      const res = await fetch(`${API_URL}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region: `${region} (${season})`, risk_type: type, language: lang }),
      });
      const d = await res.json();
      return parseRiskLevel(d.analysis);
    }

    async function buildChart() {
      try {
        const seasonEn = ["Spring", "Summer", "Autumn", "Winter"];
        const results = await Promise.all(
          seasonEn.map(async (s, i) => {
            const flood = await fetchRisk(s, "flood");
            const drought = await fetchRisk(s, "drought");
            return { season: seasons[i], flood, drought };
          })
        );
        setData(results);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    buildChart();
  }, [region, lang]);

  if (!region) return null;

  return (
    <div className="risk-chart-card">
      <p className="section-label">{labels.title}</p>
      <p className="risk-chart-region">{region}</p>

      {loading && (
        <div className="risk-chart-loading">
          <div className="loading-dots">
            <span></span><span></span><span></span>
          </div>
          {labels.loading}
        </div>
      )}

      {data && (
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={data}>
            <PolarGrid stroke="var(--border2)" />
            <PolarAngleAxis
              dataKey="season"
              tick={{ fill: "var(--text2)", fontSize: 13, fontFamily: "Inter" }}
            />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border2)",
                borderRadius: 8,
                color: "var(--text)",
                fontSize: 13,
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 13, color: "var(--text2)", paddingTop: 16 }}
            />
            <Radar
              name={labels.flood}
              dataKey="flood"
              stroke="#2d7ff9"
              fill="#2d7ff9"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Radar
              name={labels.drought}
              dataKey="drought"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
