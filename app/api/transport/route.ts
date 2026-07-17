import { NextResponse } from "next/server";
import { getTransportOptions, getParkingLots, getWeather } from "@/lib/mockData";

export async function GET() {
  let weatherData = getWeather();

  if (process.env.WEATHER_API_KEY) {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=Dallas&appid=${process.env.WEATHER_API_KEY}&units=metric`,
        { next: { revalidate: 60 } }
      );
      if (res.ok) {
        const data = await res.json();
        const temp = Math.round(data.main?.temp ?? 27);
        const cond = data.weather?.[0]?.main ?? "Clear";
        const wind = Math.round((data.wind?.speed ?? 3.8) * 3.6); // m/s to km/h conversion
        weatherData = {
          tempC: temp,
          condition: cond,
          windKph: wind,
          heatRisk: temp > 35 ? "high" : temp > 30 ? "moderate" : "low",
          lastUpdated: new Date().toISOString(),
        };
      }
    } catch (e) {
      console.error("Failed to fetch live weather telemetry:", e);
    }
  }

  return NextResponse.json({
    options: getTransportOptions(),
    parking: getParkingLots(),
    weather: weatherData,
  });
}
