import "./KazakhstanMap.css";

const REGIONS_MAP = [
  { id: "WKO", name: "Западно-Казахстанская область", cx: 120, cy: 200 },
  { id: "ATY", name: "Атырауская область", cx: 110, cy: 260 },
  { id: "MAN", name: "Мангистауская область", cx: 120, cy: 320 },
  { id: "AKT", name: "Актюбинская область", cx: 195, cy: 195 },
  { id: "KOS", name: "Костанайская область", cx: 270, cy: 130 },
  { id: "SKO", name: "Северо-Казахстанская область", cx: 355, cy: 105 },
  { id: "AKM", name: "Акмолинская область", cx: 380, cy: 170 },
  { id: "PAV", name: "Павлодарская область", cx: 450, cy: 155 },
  { id: "KAR", name: "Карагандинская область", cx: 390, cy: 250 },
  { id: "VKO", name: "Восточно-Казахстанская область", cx: 510, cy: 210 },
  { id: "KYZ", name: "Кызылординская область", cx: 290, cy: 320 },
  { id: "TUR", name: "Туркестанская область", cx: 320, cy: 400 },
  { id: "ZHM", name: "Жамбылская область", cx: 390, cy: 380 },
  { id: "ALM", name: "Алматинская область", cx: 470, cy: 360 },
];

export default function KazakhstanMap({ selected, onSelect, t }) {
  return (
    <div className="map-container">
      <p className="section-label" style={{ marginBottom: "12px" }}>
        {t?.region || "Регион"} — кликни на карте
      </p>
      <div className="map-wrapper">
        <svg viewBox="0 0 620 480" className="kz-map" xmlns="http://www.w3.org/2000/svg">
          <rect width="620" height="480" fill="none" />
          {REGIONS_MAP.map((r) => {
            const isSelected = selected === r.name;
            return (
              <g
                key={r.id}
                className={`map-region ${isSelected ? "selected" : ""}`}
                onClick={() => onSelect(r.name)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={r.cx}
                  cy={r.cy}
                  r={isSelected ? 28 : 22}
                  className={`region-circle ${isSelected ? "selected" : ""}`}
                />
                <text
                  x={r.cx}
                  y={r.cy - 34}
                  textAnchor="middle"
                  className={`region-label ${isSelected ? "selected" : ""}`}
                >
                  {r.name.replace(" область", "").length > 14
                    ? r.name.replace(" область", "").substring(0, 12) + "..."
                    : r.name.replace(" область", "")}
                </text>
                <text
                  x={r.cx}
                  y={r.cy + 4}
                  textAnchor="middle"
                  className="region-id"
                >
                  {r.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {selected && (
        <div className="map-selected">
          <span className="map-selected-label">Выбрано:</span>
          <span className="map-selected-name">{selected}</span>
          <button className="map-clear" onClick={() => onSelect("")}>✕</button>
        </div>
      )}
    </div>
  );
}
