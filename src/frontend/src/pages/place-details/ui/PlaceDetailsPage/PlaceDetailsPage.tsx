import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useMapGL } from '@features/map/context';
import { PlaceDetailsDrawer } from '@widgets/PlaceDetailsDrawer';
import { mockPlaces } from '@shared/mocks/places.mock';

export const PlaceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { userAddedPlaces } = useMapGL();

  const userAddedPlace = userAddedPlaces.find((p) => p.id === id);
  const place =
    (userAddedPlace
      ? {
          id: userAddedPlace.id,
          name: userAddedPlace.name,
          category:
            !userAddedPlace.category || userAddedPlace.category === 'other'
              ? 'park'
              : userAddedPlace.category,
          categoryLabel: userAddedPlace.categoryLabel ?? 'Место',
          distance: userAddedPlace.distance ?? 'Новое место на карте',
          address: userAddedPlace.address ?? userAddedPlace.name,
          workingHours: userAddedPlace.workingHours,
          description: userAddedPlace.description,
          photos: userAddedPlace.photos,
          isFavorite: userAddedPlace.isFavorite ?? false,
        }
      : mockPlaces.find((p) => p.id === id)) || null;

  const handleClose = () => {
    history.goBack();
  };

  const handleRouteClick = () => {
    console.log('Route to place:', id);
  };

  const handleFavoriteToggle = () => {
    console.log('Toggle favorite for place:', id);
  };

  return (
    <PlaceDetailsDrawer
      place={place}
      isOpen={true}
      onClose={handleClose}
      onRouteClick={handleRouteClick}
      onFavoriteToggle={handleFavoriteToggle}
    />
  );
};
