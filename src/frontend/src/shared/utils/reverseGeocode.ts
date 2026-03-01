import {
  fetchPhotonFeatures,
  formatPhotonAddress,
  getCoordinateLabel,
} from "./photonGeocoding";

export async function reverseGeocode(
  lng: number,
  lat: number,
  signal?: AbortSignal,
): Promise<string> {
  const params = new URLSearchParams({
    lon: String(lng),
    lat: String(lat),
    lang: "default",
    limit: "1",
  });

  try {
    const features = await fetchPhotonFeatures("/reverse", params, signal);

    for (const feature of features) {
      const text = formatPhotonAddress(feature?.properties);
      if (text) return text;
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
  }

  return getCoordinateLabel([lng, lat]);
}
