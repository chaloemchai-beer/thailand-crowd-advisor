const buildPlace = (item) => ({
  displayName: item.display_name,
  lat: Number(item.lat),
  lng: Number(item.lon),
  osmType: item.osm_type,
  osmId: item.osm_id,
  class: item.class,
  type: item.type,
  importance: item.importance,
  address: item.address,
  licence: item.licence,
  source: "openstreetmap",
});

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=604800");

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { q, lat, lng } = req.query;
  if (!q) {
    res.status(400).json({ error: "Missing q" });
    return;
  }

  try {
    const params = new URLSearchParams({
      q: String(q),
      format: "jsonv2",
      limit: "1",
      addressdetails: "1",
      namedetails: "1",
      extratags: "1",
      countrycodes: "th",
    });

    if (lat && lng) {
      const delta = 0.08;
      const latNum = Number(lat);
      const lngNum = Number(lng);
      params.set("viewbox", `${lngNum - delta},${latNum + delta},${lngNum + delta},${latNum - delta}`);
      params.set("bounded", "1");
    }

    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      headers: {
        "Accept-Language": "th,en",
        "User-Agent": "thailand-crowd-advisor/1.0 (OpenStreetMap attribution; contact: deployed-app)",
        Referer: "https://thailand-crowd-advisor.vercel.app",
      },
    });
    const data = await response.json();

    if (!response.ok) {
      res.status(response.status).json({ error: "OpenStreetMap Nominatim request failed" });
      return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      res.status(404).json({ error: "No OpenStreetMap place found" });
      return;
    }

    res.status(200).json(buildPlace(data[0]));
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "OpenStreetMap proxy failed" });
  }
}
