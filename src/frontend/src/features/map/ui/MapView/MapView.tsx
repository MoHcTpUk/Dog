import { memo } from "react";
import { useTranslation } from "react-i18next";
import { Spinner } from "@shared/ui";
import { Text } from "@shared/ui/Text";
import {
  useMapLoader,
  useMapZoom,
  usePlaceMarkers,
  useWalkMarkers,
} from "../../hooks";
import { useMapGL } from "../../context";
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from "../../lib";

interface MapViewProps {
  isPaused?: boolean;
  center?: [number, number];
  zoom?: number;
}

const MapViewComponent: React.FC<MapViewProps> = ({
  isPaused = false,
  center = MAP_DEFAULT_CENTER,
  zoom = MAP_DEFAULT_ZOOM,
}) => {
  const { t } = useTranslation();
  const { displayedWalks, displayedPlaces, onWalkClick, onPlaceClick } =
    useMapGL();

  const { mapglAPI, mapInstance, isLoading } = useMapLoader({ center, zoom });

  const { clusterZoomLevel, handleClusterClick } = useMapZoom({
    mapInstance,
    initialZoom: zoom,
  });

  usePlaceMarkers({
    mapInstance,
    mapglAPI,
    places: displayedPlaces,
    clusterZoomLevel,
    onClusterClick: handleClusterClick,
    onPlaceClick: onPlaceClick || undefined,
    isPaused,
  });

  useWalkMarkers({
    mapInstance,
    mapglAPI,
    walks: displayedWalks,
    clusterZoomLevel,
    onClusterClick: handleClusterClick,
    onWalkClick: onWalkClick || undefined,
    isPaused,
  });

  return (
    <div className="relative w-full h-full">
      <div
        id="map-container"
        className="absolute inset-0"
        style={{ width: "100%", height: "100%" }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="flex flex-col items-center gap-3">
            <Spinner size="medium" color="primary" />
            <Text variant="regular-14" color="muted">
              {t("Loading map...")}
            </Text>
          </div>
        </div>
      )}
    </div>
  );
};

export const MapView = memo(MapViewComponent);
