import type { Destination } from "@/data/destinations";

export type WeatherKind = "clear" | "rain" | "hot";

export interface WeatherForecast {
  weather: WeatherKind;
  tempC?: number;
  chanceOfRain?: number;
  precipMm?: number;
  condition?: string;
  source: "weatherapi.com" | "fallback";
  error?: string;
}

const fallbackWeather = (date: string, time: string, error?: string): WeatherForecast => {
  const month = Number(date.slice(5, 7));
  const hour = Number(time.slice(0, 2));

  if (month >= 5 && month <= 10) {
    return { weather: "rain", condition: "Seasonal rain estimate", source: "fallback", error };
  }

  if (hour >= 11 && hour <= 15) {
    return { weather: "hot", condition: "Midday heat estimate", source: "fallback", error };
  }

  return { weather: "clear", condition: "Default clear estimate", source: "fallback", error };
};

export const weatherLabel: Record<WeatherKind, string> = {
  clear: "แจ่มใส",
  rain: "ฝนตก",
  hot: "ร้อนจัด",
};

export async function fetchDestinationWeather(
  destination: Destination,
  date: string,
  time: string,
): Promise<WeatherForecast> {
  try {
    const params = new URLSearchParams({
      lat: String(destination.lat),
      lng: String(destination.lng),
      date,
      time,
    });
    const response = await fetch(`/api/weather?${params.toString()}`);
    const data = (await response.json().catch(() => ({}))) as Partial<WeatherForecast> & { error?: string };

    if (!response.ok || !data.weather) {
      return fallbackWeather(date, time, data.error || `HTTP ${response.status}`);
    }

    return {
      weather: data.weather,
      tempC: data.tempC,
      chanceOfRain: data.chanceOfRain,
      precipMm: data.precipMm,
      condition: data.condition,
      source: "weatherapi.com",
    };
  } catch (error) {
    return fallbackWeather(date, time, error instanceof Error ? error.message : "request failed");
  }
}
