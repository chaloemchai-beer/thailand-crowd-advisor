import type { Destination } from "@/data/destinations";

export interface OsmPlace {
  displayName: string;
  lat: number;
  lng: number;
  osmType: string;
  osmId: number;
  class?: string;
  type?: string;
  importance?: number;
  address?: Record<string, string>;
  licence?: string;
  source: "openstreetmap";
}

const cacheKey = (destination: Destination) => `osm-place:${destination.id}:${destination.osmQuery}`;

export async function fetchOsmPlace(destination: Destination): Promise<OsmPlace | undefined> {
  const key = cacheKey(destination);
  const cached = localStorage.getItem(key);
  if (cached) {
    try {
      return JSON.parse(cached) as OsmPlace;
    } catch {
      localStorage.removeItem(key);
    }
  }

  const params = new URLSearchParams({
    q: destination.osmQuery,
    lat: String(destination.lat),
    lng: String(destination.lng),
  });

  const response = await fetch(`/api/osm-place?${params.toString()}`);
  if (!response.ok) {
    return {
      displayName: destination.osm.displayName,
      lat: destination.lat,
      lng: destination.lng,
      osmType: destination.osm.osmType,
      osmId: destination.osm.osmId,
      type: destination.osm.type,
      importance: destination.osm.importance,
      licence: "Data (c) OpenStreetMap contributors, ODbL 1.0",
      source: "openstreetmap",
    };
  }

  const place = (await response.json()) as OsmPlace;
  localStorage.setItem(key, JSON.stringify(place));
  return place;
}
