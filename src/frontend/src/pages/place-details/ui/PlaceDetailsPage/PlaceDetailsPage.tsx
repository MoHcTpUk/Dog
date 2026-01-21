import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { PlaceDetailsDrawer } from '@widgets/PlaceDetailsDrawer';
import { mockPlaces } from '@shared/mocks/places.mock';

export const PlaceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  const place = mockPlaces.find((p) => p.id === id) || null;

  const handleClose = () => {
    history.goBack();
  };

  const handleRouteClick = () => {
    console.log('Route to place:', id);
  };

  const handleReportClick = () => {
    console.log('Report error for place:', id);
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
      onReportClick={handleReportClick}
      onFavoriteToggle={handleFavoriteToggle}
    />
  );
};
