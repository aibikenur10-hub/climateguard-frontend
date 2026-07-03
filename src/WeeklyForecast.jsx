import { useState, useEffect } from "react";
import "./WeeklyForecast.css";

const API_URL = import.meta.env.VITE_API_URL;
const WEATHER_KEY = import.meta.env.VITE_WEATHER_KEY;

const REGION_COORDS = {
  "Северо-Казахстанская область": { lat: 54.87, lon: 69.14 },
  "Акмолинская область": { lat: 51.18, lon: 71.45 },
  "Костанайская область": { lat: 53.21, lon: 63.62 },
  "Павлодарская область": { lat: 52.28, lon: 76.97 },
  "Восточно-Казахстанская область": { lat: 49.98, lon: 82.61 },
  "Карагандинская область": { lat: 49.81, lon: 73.09 },
  "Алматинская область": { lat: 43.25, lon: 76.95 },
  "Жамбылская область": { lat: 42.90, lon: 71.38 },
  "Туркестанская область": { lat: 42.30, lon: 68.27 },
  "Кызылординская область": { lat: 44.85, lon: 65.51 },
  "Актюбинская область": { lat: 50.28, lon: 57.21 },
  "Западно-Казахстанская область": { lat: 51.23, lon: 51.37 },
  "Атырауская область": { lat: 47.11, lon: 51.92 },
  "Мангистауская область": { lat: 43.65, lon: 51.17 },
};

function getRiskColor(level) {
  if (level === "high") return { color: "var(--high)", bg: "var(--high-glow)", label: "ВЫСОКИЙ" };
  if (level === "medium") return { color: "var(--medium)", bg: "var(--medium-glow)", label: "СРЕДНИЙ" };
  return { color: "var(--low)", bg: "var(--low-glow)", label: "НИЗКИЙ" };
}

function parseRisk(text) {
  const u = (text || "").toUpperCase();
  if (u.includes("HIGH") || u.includes("ВЫСОК") || u.includes("ЖОҒАРЫ")) return "high";
  if (u.includes("MEDIUM") || u.includes("СРЕДН") || u.includes("ОРТАША")) return "medium";
  return "low";
}

export default function WeeklyForecast({ region, lang = "ru" }) {
  const [forecast, setForecast] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const labels = {
    ru: {
      title: "Прогноз риска на неделю",
      loading: "Анализируем прогноз погоды...",
      flood: "Паводок",
      drought: "Засуха",
      based: "На основе прогноза погоды на 5 дней",
    },
    kz: {
      title: "Апталық тәуекел болжамы",
      loading: "Ауа райы болжамы талдануда...",
      flood: "Су тасқыны",
      drought: "Қуаңшылық",
      based: "5 күндік ауа райы болжамы негізінде",
    },
    en: {
      title: "Weekly Risk Forecast",
      loading: "Analyzing weather forecast...",
      flood: "Flood",
      drought: "Drought",
      based: "Based on 5-day weather forecast",
    },
  }[lang] || {};

  useEffect(() => {
    if (!region || !REGION_COORDS[region]) return;
    const { lat, lon } = REGION_COORDS[region];
    setLoading(true);
    setForecast(null);
    setPrediction(null);

    async function load() {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_KEY}&units=metric&cnt=8&lang=ru`
        );
        const data = await res.json();
        const items = data.list || [];

        const avgTemp = Math.round(items.reduce((s, i) => s + i.main.temp, 0) / items.length);
        const avgHumidity = Math.round(items.reduce((s, i) => s + i.main.humidity, 0) / items.length);
        const totalRain = items.reduce((s, i) => s + (i.rain?.["3h"] || 0), 0).toFixed(1);
        const avgWind = Math.round(items.reduce((s, i) => s + i.wind.speed, 0) / items.length);
        const conditions = [...new Set(items.map(i => i.weather[0].description))].join(", ");

        setForecast({ avgTemp, avgHumidity, totalRain, avgWind, conditions });

        const prompt = lang === "ru"
          ? `На основе прогноза погоды для ${region} на ближайшие 5 дней: температура ${avgTemp}°C, влажность ${avgHumidity}%, осадки ${totalRain}мм, ветер ${avgWind}м/с, условия: ${conditions}. Оцени риск паводка и засухи на этой неделе. Ответь коротко: уровень риска паводка (High/Medium/Low), уровень риска засухи (High/Medium/Low), и одно предложение объяснения для каждого.`
          : lang === "kz"
          ? `${region} үшін келесі 5 күндік ауа райы болжамы негізінде: температура ${avgTemp}°C, ылғалдылық ${avgHumidity}%, жауын-шашын ${totalRain}мм, жел ${avgWind}м/с. Осы аптадағы су тасқыны және қуаңшылық тәуекелін бағалаңыз.`
          : `Based on the 5-day weather forecast for ${region}: temperature ${avgTemp}°C, humidity ${avgHumidity}%, precipitation ${totalRain}mm, wind ${avgWind}m/s, conditions: ${conditions}. Assess the flood and drought risk for this week. Answer briefly: flood risk level (High/Medium/Low), drought risk level (High/Medium/Low), and one sentence explanation for each.`;

        const predRes = await fetch(`${API_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: prompt, session_id: "weekly_forecast", mode: "climate" }),
        });
        const predData = await predRes.json();
        setPrediction(predData.reply);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [region, lang]);

  if (!region) return null;

  const floodRisk = prediction ? parseRisk(prediction.split("\n")[0]) : null;
  const droughtRisk = prediction ? parseRisk(prediction.split("\n").find(l => l.toLowerCase().includes("засух") || l.toLowerCase().includes("drought") || l.toLowerCase().includes("қуаң")) || "") : null;

  return (
    <div className="weekly-card">
      <p className="section-label">{labels.title}</p>
      <p className="weekly-region">{region}</p>

      {loading && (
        <div className="weekly-loading">
          <div className="loading-dots"><span></span><span></span><span></span></div>
          {labels.loading}
        </div>
      )}

      {forecast && !loading && (
        <div className="weekly-weather-row">
          <div className="weekly-stat"><span className="weekly-stat-val">{forecast.avgTemp}°C</span><span className="weekly-stat-label">Температура</span></div>
          <div className="weekly-stat"><span className="weekly-stat-val">{forecast.avgHumidity}%</span><span className="weekly-stat-label">Влажность</span></div>
          <div className="weekly-stat"><span className="weekly-stat-val">{forecast.totalRain}мм</span><span className="weekly-stat-label">Осадки</span></div>
          <div className="weekly-stat"><span className="weekly-stat-val">{forecast.avgWind}м/с</span><span className="weekly-stat-label">Ветер</span></div>
        </div>
      )}

      {prediction && (
        <>
          <div className="weekly-risks">
            {floodRisk && (
              <div className="weekly-risk-badge" style={{ background: getRiskColor(floodRisk).bg, color: getRiskColor(floodRisk).color }}>
                {labels.flood}: {getRiskColor(floodRisk).label}
              </div>
            )}
            {droughtRisk && (
              <div className="weekly-risk-badge" style={{ background: getRiskColor(droughtRisk).bg, color: getRiskColor(droughtRisk).color }}>
                {labels.drought}: {getRiskColor(droughtRisk).label}
              </div>
            )}
          </div>
          <div className="weekly-prediction">{prediction}</div>
          <p className="weekly-based">{labels.based}</p>
        </>
      )}
    </div>
  );
}
