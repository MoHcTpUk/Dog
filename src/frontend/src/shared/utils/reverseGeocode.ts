interface NominatimAddress {
  road?: string;
  house_number?: string;
  house_name?: string;
  amenity?: string;
  building?: string;
  city?: string;
  town?: string;
  village?: string;
  suburb?: string;
  neighbourhood?: string;
  residential?: string;
  quarter?: string;
}

interface AddressCandidate {
  score: number;
  text: string;
}

const formatNominatimAddress = (
  address?: NominatimAddress,
  displayName?: string,
): AddressCandidate | null => {
  if (address) {
    const {
      road,
      house_number,
      house_name,
      amenity,
      building,
      city,
      town,
      village,
      suburb,
      neighbourhood,
      residential,
      quarter,
    } = address;
    const parts: string[] = [];
    let score = 0;

    const primaryPlace = amenity || house_name || building;

    if (primaryPlace) {
      parts.push(primaryPlace);
      score += 1;
    }

    if (road) {
      const roadLine = house_number ? `${road}, ${house_number}` : road;
      if (parts[0] !== roadLine) parts.push(roadLine);
      score += 2;
    } else if (house_number) {
      parts.push(house_number);
    }
    if (house_number) score += 4;

    const area = neighbourhood || residential || quarter || suburb;
    if (area && parts.length < 2) {
      parts.push(area);
      score += 1;
    }

    const locality = city || town || village;
    if (locality && parts.length < 3) {
      parts.push(locality);
      score += 1;
    }

    if (parts.length > 0) {
      return {
        score,
        text: parts.join(", "),
      };
    }
  }

  if (displayName) {
    return {
      score: 1,
      text: displayName.split(", ").slice(0, 3).join(", "),
    };
  }

  return null;
};

interface PhotonFeatureProperties {
  name?: string;
  housenumber?: string;
  street?: string;
  postcode?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
}

interface PhotonFeature {
  properties?: PhotonFeatureProperties;
}

const formatPhotonResult = (
  properties?: PhotonFeatureProperties,
): AddressCandidate | null => {
  if (!properties) return null;

  const streetLine = [properties.street, properties.housenumber]
    .filter(Boolean)
    .join(", ");
  const locality = properties.city || properties.district || properties.state;
  const distinctName =
    properties.name && properties.name !== streetLine ? properties.name : null;

  const parts = [
    distinctName,
    streetLine || null,
    properties.postcode || null,
    locality || null,
  ].filter(Boolean);

  if (parts.length === 0) return null;

  let score = 0;
  if (properties.housenumber) score += 4;
  if (properties.street) score += 2;
  if (distinctName) score += 1;
  if (properties.postcode) score += 1;
  if (locality) score += 1;

  return {
    score,
    text: parts.join(", "),
  };
};

const getBestCandidate = (
  candidates: Array<AddressCandidate | null>,
): AddressCandidate | null => {
  const filtered = candidates.filter(
    (candidate): candidate is AddressCandidate => candidate !== null,
  );

  if (filtered.length === 0) return null;

  filtered.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.text.length - b.text.length;
  });

  return filtered[0];
};

const fetchPhotonCandidate = async (
  lng: number,
  lat: number,
  signal?: AbortSignal,
): Promise<AddressCandidate | null> => {
  const params = new URLSearchParams({
    lon: String(lng),
    lat: String(lat),
    lang: "ru",
    limit: "5",
  });
  const res = await fetch(`https://photon.komoot.io/reverse?${params.toString()}`, {
    signal,
  });

  if (!res.ok) return null;

  const data = await res.json();
  const features: PhotonFeature[] = Array.isArray(data?.features)
    ? data.features
    : [];

  return getBestCandidate(
    features.map((feature) => formatPhotonResult(feature?.properties)),
  );
};

const fetchNominatimCandidate = async (
  lng: number,
  lat: number,
  signal?: AbortSignal,
): Promise<AddressCandidate | null> => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=ru`,
    { signal, headers: { "User-Agent": "DogAppa/1.0" } },
  );

  if (!res.ok) return null;

  const data = await res.json();
  return formatNominatimAddress(data?.address, data?.display_name);
};

export async function reverseGeocode(
  lng: number,
  lat: number,
  signal?: AbortSignal,
): Promise<string> {
  try {
    const [photonResult, nominatimResult] = await Promise.allSettled([
      fetchPhotonCandidate(lng, lat, signal),
      fetchNominatimCandidate(lng, lat, signal),
    ]);

    const aborted = [photonResult, nominatimResult].find(
      (result) =>
        result.status === "rejected" &&
        result.reason instanceof DOMException &&
        result.reason.name === "AbortError",
    );

    if (aborted) {
      throw (aborted as PromiseRejectedResult).reason;
    }

    const bestCandidate = getBestCandidate([
      photonResult.status === "fulfilled" ? photonResult.value : null,
      nominatimResult.status === "fulfilled" ? nominatimResult.value : null,
    ]);

    if (bestCandidate) {
      return bestCandidate.text;
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
  }

  try {
    const fallbackCandidate = await fetchNominatimCandidate(
      lng,
      lat,
      signal,
    );
    if (fallbackCandidate) return fallbackCandidate.text;
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
  }

  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}
