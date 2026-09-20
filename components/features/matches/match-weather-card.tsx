import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Sun,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { getMatchWeather } from "@/lib/weather";

function weatherIcon(code: number) {
  if (code === 0 || code === 1) return Sun;
  if (code === 2 || code === 3) return Cloud;
  if (code === 45 || code === 48) return CloudFog;
  if (code >= 51 && code <= 57) return CloudDrizzle;
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return CloudRain;
  if (code >= 71 && code <= 77) return CloudSnow;
  if (code >= 95) return CloudLightning;
  return Cloud;
}

export async function MatchWeatherCard({
  location,
  matchDate,
}: {
  location: string | null;
  matchDate: string;
}) {
  const weather = await getMatchWeather(location, matchDate);
  if (!weather) return null;

  const Icon = weatherIcon(weather.weatherCode);

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <Icon className="h-9 w-9 shrink-0 text-primary" />
        <div className="min-w-0">
          <p className="text-sm font-medium">
            {weather.label} à {weather.cityName}
          </p>
          <p className="text-sm text-muted-foreground">
            {weather.tempMinC}° / {weather.tempMaxC}°C prévus le jour du match
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
