import React from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { WalkDetailsDrawer } from '@widgets/WalkDetailsDrawer';
import { mockWalks } from '@shared/mocks/walks.mock';

export const WalkDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const location = useLocation();

  const walk = mockWalks.find((w) => w.id === id);

  const handleClose = () => {
    history.goBack();
  };

  const handleDogClick = (dogId: string) => {
    history.push(`/dog/${dogId}`);
  };

  const handleJoinClick = () => {
    handleClose();
  };

  return (
    <WalkDetailsDrawer
      walk={walk || null}
      isOpen={true}
      onClose={handleClose}
      onDogClick={handleDogClick}
      onJoinClick={handleJoinClick}
    />
  );
};
