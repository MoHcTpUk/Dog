export interface PhotonFeatureProperties {
  name?: string;
  housenumber?: string;
  street?: string;
  postcode?: string;
  city?: string;
  district?: string;
  state?: string;
}

export interface PhotonFeature {
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: PhotonFeatureProperties;
}

interface FormatPhotonAddressOptions {
  includePostcode?: boolean;
}

const PHOTON_API_URL = "https://photon.komoot.io";

export const formatPhotonAddress = (
  properties?: PhotonFeatureProperties,
  { includePostcode = false }: FormatPhotonAddressOptions = {},
): string | null => {
  if (!properties) {
    return null;
  }

  const streetLine = [properties.street, properties.housenumber]
    .filter(Boolean)
    .join(", ");
  const locality = properties.city || properties.district || properties.state;
  const distinctName =
    properties.name && properties.name !== streetLine ? properties.name : null;

  const parts = [
    distinctName,
    streetLine || null,
    includePostcode ? properties.postcode || null : null,
    locality || null,
  ].filter(Boolean) as string[];

  return parts.length > 0 ? parts.join(", ") : null;
};

export const getCoordinateLabel = (coordinates: [number, number]) =>
  `${coordinates[1].toFixed(5)}, ${coordinates[0].toFixed(5)}`;

export const extractPhotonCoordinates = (
  feature?: PhotonFeature,
): [number, number] | null => {
  const coordinates = feature?.geometry?.coordinates;

  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return null;
  }

  if (!Number.isFinite(coordinates[0]) || !Number.isFinite(coordinates[1])) {
    return null;
  }

  return [coordinates[0], coordinates[1]];
};

export const fetchPhotonFeatures = async (
  path: "/api/" | "/reverse",
  params: URLSearchParams,
  signal?: AbortSignal,
): Promise<PhotonFeature[]> => {
  const response = await fetch(`${PHOTON_API_URL}${path}?${params.toString()}`, {
    signal,
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();

  return Array.isArray(data?.features) ? data.features : [];
};
