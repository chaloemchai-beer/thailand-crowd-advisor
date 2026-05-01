const classifyWeather = (hour) => {
  const condition = String(hour?.condition?.text ?? "").toLowerCase();
  const isRain =
    Number(hour?.chance_of_rain ?? 0) >= 45 ||
    Number(hour?.precip_mm ?? 0) >= 0.2 ||
    /rain|shower|thunder|storm|drizzle/.test(condition);

  if (isRain) return "rain";
  if (Number(hour?.temp_c ?? 0) >= 34) return "hot";
  return "clear";
};

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.WEATHER_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "WEATHER_API_KEY is not configured" });
    return;
  }

  const { lat, lng, date, time = "12:00" } = req.query;
  if (!lat || !lng || !date) {
    res.status(400).json({ error: "Missing lat, lng, or date" });
    return;
  }

  try {
    const weatherResponse = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lng}&dt=${date}&aqi=no&alerts=no`,
    );
    const data = await weatherResponse.json();

    if (!weatherResponse.ok) {
      res.status(weatherResponse.status).json({ error: data?.error?.message ?? "Weather request failed" });
      return;
    }

    const targetHour = Number(String(time).split(":")[0] ?? 12);
    const hours = data?.forecast?.forecastday?.[0]?.hour ?? [];
    const hour =
      hours.find((item) => Number(String(item.time ?? "").slice(11, 13)) === targetHour) ??
      hours[0];

    if (!hour) {
      res.status(404).json({ error: "No hourly weather data found" });
      return;
    }

    res.status(200).json({
      weather: classifyWeather(hour),
      tempC: hour.temp_c,
      chanceOfRain: hour.chance_of_rain,
      precipMm: hour.precip_mm,
      condition: hour.condition?.text,
      source: "weatherapi.com",
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Weather proxy failed" });
  }
}
