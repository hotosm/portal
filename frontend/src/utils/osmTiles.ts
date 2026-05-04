const DEFAULT_ZOOM = 14;

type GeoJSONCoord = [number, number];

function collectCoords(coords: unknown): GeoJSONCoord[] {
  if (!Array.isArray(coords)) return [];
  if (typeof coords[0] === "number") return [coords as GeoJSONCoord];
  return (coords as unknown[]).flatMap(collectCoords);
}

export function geomCentroid(geom: {
  type: string;
  coordinates: unknown;
}): [number, number] | null {
  const coords = collectCoords(geom.coordinates);
  if (!coords.length) return null;
  const lons = coords.map(([lon]) => lon);
  const lats = coords.map(([, lat]) => lat);
  return [
    (Math.min(...lats) + Math.max(...lats)) / 2,
    (Math.min(...lons) + Math.max(...lons)) / 2,
  ];
}

export function lon2tile(lon: number, zoom: number): number {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}

export function lat2tile(lat: number, zoom: number): number {
  return Math.floor(
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180),
      ) /
        Math.PI) /
      2) *
      Math.pow(2, zoom),
  );
}

export function osmTileUrl(
  lat: number,
  lon: number,
  zoom: number = DEFAULT_ZOOM,
): string {
  const x = lon2tile(lon, zoom);
  const y = lat2tile(lat, zoom);
  return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
}
