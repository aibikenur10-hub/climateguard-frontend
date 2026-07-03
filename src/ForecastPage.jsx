import { useState } from "react";
import { useNavigate } from "react-router-dom";
import WeeklyForecast from "./WeeklyForecast";
import "./ForecastPage.css";

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

export default function ForecastPage() {
  const navigate = useNavigate();
  const [region, setRegion] = useState("");
  const [showForecast, setShowForecast] = useState(false);

  return (
    <div className="forecast-page">
      <div className="forecast-page-header">
        <button className="back-btn" onClick={() => navigate("/")}>
          ← Вернуться
        </button>
        <div className="forecast-page-title">
          <span className="logo-mark">CG</span>
          <span>Прогноз риска на неделю</span>
        </div>
      </div>

      <div className="forecast-page-body">
        <p className="forecast-desc">
          Выберите регион — AI проанализирует прогноз погоды на 5 дней и оценит риск паводка и засухи на ближайшую неделю.
        </p>

        <div className="forecast-form">
          <select
            className="select"
            value={region}
            onChange={e => { setRegion(e.target.value); setShowForecast(false); }}
          >
            <option value="">Выберите регион</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <button
            className="analyze-btn"
            onClick={() => setShowForecast(true)}
            disabled={!region}
          >
            Получить прогноз
          </button>
        </div>

        {showForecast && region && (
          <WeeklyForecast region={region} lang="ru" />
        )}
      </div>
    </div>
  );
}
