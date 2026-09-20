import "server-only";

export interface MatchWeather {
  cityName: string;
  tempMaxC: number;
  tempMinC: number;
  weatherCode: number;
  label: string;
}

const WEATHER_LABELS: Record<number, string> = {
  0: "Ciel dégagé",
  1: "Plutôt dégagé",
  2: "Partiellement nuageux",
  3: "Couvert",
  45: "Brouillard",
  48: "Brouillard givrant",
  51: "Bruine légère",
  53: "Bruine",
  55: "Bruine dense",
  61: "Pluie légère",
  63: "Pluie",
  65: "Pluie forte",
  71: "Neige légère",
  73: "Neige",
  75: "Neige forte",
  80: "Averses légères",
  81: "Averses",
  82: "Averses violentes",
  95: "Orage",
  96: "Orage avec grêle",
  99: "Orage violent",
};

// Les matchs enregistrent un lieu en texte libre ("Stade Municipal"...), pas
// une ville : l'API de géocodage (basée sur GeoNames) ne connaît que des
// lieux habités, pas des noms de stades. On tente d'abord cette table pour
// les stades connus du club, puis on retente avec le texte brut (utile
// quand un utilisateur saisit directement une ville réelle).
const STADIUM_TO_CITY: Record<string, string> = {
  "stade municipal": "Tunis",
  "stade mustapha ben jannet": "Monastir",
  "stade taïeb mhiri": "Sfax",
  "stade 15 octobre": "Bizerte",
};

async function geocode(query: string): Promise<{ name: string; latitude: number; longitude: number } | null> {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=fr`,
    { next: { revalidate: 60 * 60 * 24 } },
  );
  if (!res.ok) return null;
  const json = await res.json();
  const place = json?.results?.[0];
  return place ? { name: place.name, latitude: place.latitude, longitude: place.longitude } : null;
}

/**
 * Prévisions météo gratuites (Open-Meteo, sans clé) pour le jour d'un match
 * à venir. Renvoie `null` si le lieu n'a pas pu être localisé ou si la date
 * dépasse l'horizon de prévision (~15 jours) — la carte météo est alors
 * simplement masquée plutôt que de faire échouer la page.
 */
export async function getMatchWeather(
  location: string | null,
  matchDateIso: string,
): Promise<MatchWeather | null> {
  if (!location) return null;

  const matchDate = new Date(matchDateIso);
  const daysAhead = (matchDate.getTime() - Date.now()) / 86_400_000;
  if (daysAhead < 0 || daysAhead > 15) return null;

  try {
    const cityQuery = STADIUM_TO_CITY[location.trim().toLowerCase()] ?? location;
    const place = (await geocode(cityQuery)) ?? (await geocode(location));
    if (!place) return null;

    const dateStr = matchDate.toISOString().slice(0, 10);
    const forecastRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&start_date=${dateStr}&end_date=${dateStr}`,
      { next: { revalidate: 60 * 60 } },
    );
    if (!forecastRes.ok) return null;
    const forecast = await forecastRes.json();
    const code = forecast?.daily?.weathercode?.[0];
    const tMax = forecast?.daily?.temperature_2m_max?.[0];
    const tMin = forecast?.daily?.temperature_2m_min?.[0];
    if (code === undefined || tMax === undefined || tMin === undefined) return null;

    return {
      cityName: place.name,
      tempMaxC: Math.round(tMax),
      tempMinC: Math.round(tMin),
      weatherCode: code,
      label: WEATHER_LABELS[code] ?? "Conditions variables",
    };
  } catch {
    return null;
  }
}
