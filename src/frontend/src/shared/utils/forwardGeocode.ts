import { reverseGeocode } from "./reverseGeocode";

export interface GeocodeSuggestion {
  label: string;
  coordinates: [number, number];
}

interface RankedGeocodeSuggestion extends GeocodeSuggestion {
  score: number;
  key: string;
}

interface PhotonFeatureProperties {
  name?: string;
  housenumber?: string;
  street?: string;
  postcode?: string;
  city?: string;
  district?: string;
  state?: string;
}

interface PhotonFeature {
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: PhotonFeatureProperties;
}

const buildSuggestionKey = (
  label: string,
  coordinates: [number, number],
) =>
  `${label.trim().toLowerCase()}|${coordinates[0].toFixed(5)}|${coordinates[1].toFixed(5)}`;

const createSuggestion = (
  label: string,
  coordinates: [number, number] | null,
  score: number,
): RankedGeocodeSuggestion | null => {
  const trimmedLabel = label.trim();

  if (
    !trimmedLabel ||
    !coordinates ||
    !Number.isFinite(coordinates[0]) ||
    !Number.isFinite(coordinates[1])
  ) {
    return null;
  }

  return {
    label: trimmedLabel,
    coordinates,
    score,
    key: buildSuggestionKey(trimmedLabel, coordinates),
  };
};

const formatPhotonSuggestion = (
  feature?: PhotonFeature,
): RankedGeocodeSuggestion | null => {
  const properties = feature?.properties;
  const coordinates = feature?.geometry?.coordinates;

  if (!properties || !Array.isArray(coordinates) || coordinates.length < 2) {
    return null;
  }

  const streetLine = [properties.street, properties.housenumber]
    .filter(Boolean)
    .join(", ");
  const locality = properties.city || properties.district || properties.state;
  const distinctName =
    properties.name && properties.name !== streetLine ? properties.name : null;
  const label = [distinctName, streetLine || null, properties.postcode || null, locality || null]
    .filter(Boolean)
    .join(", ");

  let score = 0;
  if (properties.housenumber) score += 4;
  if (properties.street) score += 2;
  if (distinctName) score += 1;
  if (properties.postcode) score += 1;
  if (locality) score += 1;

  return createSuggestion(label, [coordinates[0], coordinates[1]], score);
};

const mergeSuggestions = (
  suggestionGroups: RankedGeocodeSuggestion[][],
  limit: number,
): GeocodeSuggestion[] => {
  const unique = new Map<string, RankedGeocodeSuggestion>();

  suggestionGroups.flat().forEach((suggestion) => {
    const existing = unique.get(suggestion.key);

    if (!existing || suggestion.score > existing.score) {
      unique.set(suggestion.key, suggestion);
    }
  });

  return Array.from(unique.values())
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.label.length - b.label.length;
    })
    .slice(0, limit)
    .map(({ label, coordinates }) => ({ label, coordinates }));
};

const fetchPhotonSuggestions = async (
  query: string,
  limit: number,
  signal?: AbortSignal,
): Promise<RankedGeocodeSuggestion[]> => {
  const params = new URLSearchParams({
    q: query,
    lang: "default",
    limit: String(Math.max(limit, 1)),
  });
  const response = await fetch(
    `https://photon.komoot.io/api/?${params.toString()}`,
    { signal },
  );

  if (!response.ok) return [];

  const data = await response.json();
  const features: PhotonFeature[] = Array.isArray(data?.features) ? data.features : [];

  return features
    .map((feature) => formatPhotonSuggestion(feature))
    .filter(
      (suggestion): suggestion is RankedGeocodeSuggestion => suggestion !== null,
    );
};

const getReverseGeocodeFallbackLabel = (coordinates: [number, number]) =>
  `${coordinates[1].toFixed(5)}, ${coordinates[0].toFixed(5)}`;

export async function normalizeAddressSuggestion(
  suggestion: GeocodeSuggestion,
  signal?: AbortSignal,
): Promise<GeocodeSuggestion> {
  try {
    const resolvedLabel = await reverseGeocode(
      suggestion.coordinates[0],
      suggestion.coordinates[1],
      signal,
    );

    if (resolvedLabel !== getReverseGeocodeFallbackLabel(suggestion.coordinates)) {
      return {
        ...suggestion,
        label: resolvedLabel,
      };
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      throw e;
    }
  }

  return suggestion;
}

export async function searchAddressSuggestions(
  query: string,
  signal?: AbortSignal,
  limit = 5,
): Promise<GeocodeSuggestion[]> {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  return fetchPhotonSuggestions(trimmedQuery, limit, signal).then((suggestions) =>
    mergeSuggestions([suggestions], limit),
  );
}

export async function resolveAddressSuggestion(
  query: string,
  signal?: AbortSignal,
): Promise<GeocodeSuggestion | null> {
  const suggestions = await searchAddressSuggestions(query, signal, 1);
  const firstSuggestion = suggestions[0];

  if (!firstSuggestion) {
    return null;
  }

  return normalizeAddressSuggestion(firstSuggestion, signal);
}
