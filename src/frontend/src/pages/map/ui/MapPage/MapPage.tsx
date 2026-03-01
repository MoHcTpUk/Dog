import React, { useRef, useMemo, useCallback, useEffect } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { MainLayout } from "@app/layouts/MainLayout";
import { useMapGL } from "@features/map/context";
import {
  centerMapOnInitialUserLocation,
  centerMapOnUserLocation,
  focusPlaceMarker,
  focusWalkMarker,
  MAP_CREATE_WALK_QUERY_PARAM,
  MAP_MOCK_PLACES,
} from "@features/map/lib";
import { mockWalks } from "@shared/mocks/walks.mock";
import {
  createMapOverlayBackgroundLocation,
  getMapPageState,
  hasSearchParam,
  removeSearchParam,
} from "../../lib/mapPage.utils";

let hasAutocenteredToUserLocation = false;

export const MapPage: React.FC = () => {
  const location = useLocation();
  const history = useHistory();

  const {
    setDisplayedWalks,
    setDisplayedPlaces,
    setWalkClickHandler,
    setPlaceClickHandler,
    mapInstance,
    activeTab,
    walkCreationActive,
    placeCreationActive,
    startWalkCreation,
    placesCategoryFilter,
    userAddedWalks,
    userAddedPlaces,
  } = useMapGL();

  const locationRef = useRef(location);
  locationRef.current = location;

  const creationActive = walkCreationActive || placeCreationActive;

  const { allPlaces, allWalks, displayedPlaces, displayedWalks } = useMemo(
    () =>
      getMapPageState({
        activeTab,
        creationActive,
        basePlaces: MAP_MOCK_PLACES,
        userAddedPlaces,
        baseWalks: mockWalks,
        userAddedWalks,
        placesCategoryFilter,
      }),
    [
      activeTab,
      creationActive,
      placesCategoryFilter,
      userAddedPlaces,
      userAddedWalks,
    ],
  );

  const handleWalkClick = useCallback(
    (walkId: string) => {
      const walk = allWalks.find((item) => item.id === walkId);
      if (walk) {
        focusWalkMarker(mapInstance, walk);
      }

      const cleanLocation = createMapOverlayBackgroundLocation(locationRef.current);
      history.push(`/walk/${walkId}`, { background: cleanLocation });
    },
    [allWalks, history, mapInstance],
  );

  const handlePlaceClick = useCallback(
    (placeId: string) => {
      const place = allPlaces.find((p) => p.id === placeId);
      if (place) {
        focusPlaceMarker(mapInstance, place);
      }

      const cleanLocation = createMapOverlayBackgroundLocation(locationRef.current);
      history.push(`/place/${placeId}`, { background: cleanLocation });
    },
    [history, allPlaces, mapInstance],
  );

  useEffect(() => {
    setDisplayedWalks(displayedWalks);
    setDisplayedPlaces(displayedPlaces);
  }, [displayedWalks, displayedPlaces, setDisplayedWalks, setDisplayedPlaces]);

  useEffect(() => {
    setWalkClickHandler(handleWalkClick);
  }, [handleWalkClick, setWalkClickHandler]);

  useEffect(() => {
    setPlaceClickHandler(handlePlaceClick);
  }, [handlePlaceClick, setPlaceClickHandler]);

  useEffect(() => {
    if (!mapInstance || hasAutocenteredToUserLocation) return;
    hasAutocenteredToUserLocation = true;

    void centerMapOnInitialUserLocation(mapInstance);
  }, [mapInstance]);

  useEffect(() => {
    if (!hasSearchParam(location.search, MAP_CREATE_WALK_QUERY_PARAM) || walkCreationActive) {
      return;
    }

    history.replace({
      search: removeSearchParam(location.search, MAP_CREATE_WALK_QUERY_PARAM),
    });

    void centerMapOnUserLocation(mapInstance).finally(() => {
      startWalkCreation();
    });
  }, [history, location.search, mapInstance, startWalkCreation, walkCreationActive]);

  return (
    <MainLayout withFooter>
      <div className="absolute inset-0" />
    </MainLayout>
  );
};
