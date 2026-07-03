import { useState, useEffect } from "react";
import "./Weather.css";

const REGION_COORDS = {
  "Северо-Казахстанская область": { lat: 54.87, lon: 69.14, city: "Petropavl" },
  "Акмолинская область": { lat: 51.18, lon: 71.45, city: "Astana" },
  "Костанайская область": { lat: 53.21, lon: 63.62, city: "Kostanay" },
  "Павлодарская область": { lat: 52.28, lon: 76.97, city: "Pavlodar" },
  "Восточно-Казахстанская область": { lat: 49.98, lon: 82.61, city: "Oskemen" },
  "Карагандинская область": { lat: 49.81, lon: 73.09, city: "Karaganda" },
  "Алматинская область": { lat: 43.25, lon: 76.95, city: "Almaty" },
  "Жамбылская область": { lat: 42.90, lon: 71.38, city: "Taraz" },
  "Туркестанская область": { lat: 42.30, lon: 68.27, city: "Turkestan" },
  "Кызылординская область": { lat: 44.85, lon: 65.51, city: "Kyzylorda" },
  "Актюбинская область": { lat: 50.28, lon: 57.21, city: "Aktobe" },
  "Западно-Казахстанская область": { lat: 51.23, lon: 51.37, city: "Oral" },
  "Атырауская область": { lat: 47.11, lon: 51.92, city: "Atyrau" },
  "Мангистауская область": { lat: 43.65, lon: 51.17, city: "Aktau" },
};

export default function Weather({ region, title }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const KEY = import.meta.env.VITE_WEATHER_KEY;

  useEffect(() => {
    if (!region || !REGION_COORDS[region]) return;
    const { lat, lon } = REGION_COORDS[region];
    setLoading(true);
    setError(null);
    setWeather(null);
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${KEY}&units=metric&lang=ru`)
      .then(r => r.json())
      .then(data => {
        if (data.cod !== 200) throw new Error("Not found");
        setWeather(data);
      })
      .catch(() => setError("Не удалось загрузить погоду"))
      .finally(() => setLoading(false));
  }, [region]);

  if (!region) return null;
  if (loading) return <div className="weather-card loading">Загружаем погоду...</div>;
  if (error) return null;
  if (!weather) return null;

  const temp = Math.round(weather.main.temp);
  const feels = Math.round(weather.main.feels_like);
  const desc = weather.weather[0].description;
  const humidity = weather.main.humidity;
  const wind = Math.round(weather.wind.speed);
  const icon = weather.weather[0].icon;
 
  return (
    <div className="weather-card">
      {title && <p className="weather-title">{title}</p>}
      {title && <p className="weather-title">{title}</p>}
      <div className="weather-top">
        <img
          src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
          alt={desc}
          className="weather-icon"
        />
        <div className="weather-temp-block">
          <span className="weather-temp">{temp}°C</span>
          <span className="weather-desc">{desc}</span>
        </div>
      </div>
      <div className="weather-stats">
        <div className="weather-stat">
          <span className="weather-stat-label">Ощущается</span>
          <span className="weather-stat-val">{feels}°C</span>
        </div>
        <div className="weather-stat">
          <span className="weather-stat-label">Влажность</span>
          <span className="weather-stat-val">{humidity}%</span>
        </div>
        <div className="weather-stat">
          <span className="weather-stat-label">Ветер</span>
          <span className="weather-stat-val">{wind} м/с</span>
        </div>
      </div>
    </div>
  );
}

export { REGION_COORDS };
