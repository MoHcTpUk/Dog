import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useMapGL } from '@features/map/context';
import { WalkDetailsDrawer, WalkDetailsVariant } from '@widgets/WalkDetailsDrawer';
import { mockWalks, mockWalkRequests } from '@shared/mocks/walks.mock';
import { WalkStatus } from '@shared/types/walk';

const statusToVariant: Record<WalkStatus, WalkDetailsVariant> = {
  'walk': 'regular',
  'request-sent': 'request-sent',
  'accepted': 'joined',
  'rejected': 'regular',
  'invited': 'regular',
  'own': 'own',
  'own-with-requests': 'own-with-requests',
};

export const WalkDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { userAddedWalks } = useMapGL();

  const walk = [...userAddedWalks, ...mockWalks].find((w) => w.id === id);
  const variant = walk ? statusToVariant[walk.status] : 'regular';
  const requestedDogs = walk ? mockWalkRequests[walk.id] || [] : [];

  const handleClose = () => {
    history.goBack();
  };

  const handleDogClick = (dogId: string) => {
    history.push(`/dog/${dogId}`);
  };

  const handleRouteClick = () => {
    console.log('Route to walk:', id);
  };

  const handleJoinClick = () => {
    console.log('Join walk:', id);
    handleClose();
  };

  const handleLeaveClick = () => {
    console.log('Leave walk:', id);
    handleClose();
  };

  const handleCancelRequestClick = () => {
    console.log('Cancel request for walk:', id);
    handleClose();
  };

  const handleEditClick = () => {
    console.log('Edit walk:', id);
  };

  const handleDeleteClick = () => {
    console.log('Delete walk:', id);
    handleClose();
  };

  const handleAcceptRequest = (dogId: string) => {
    console.log('Accept request from dog:', dogId);
  };

  const handleRejectRequest = (dogId: string) => {
    console.log('Reject request from dog:', dogId);
  };

  return (
    <WalkDetailsDrawer
      walk={walk || null}
      isOpen={true}
      onClose={handleClose}
      variant={variant}
      onRouteClick={handleRouteClick}
      onDogClick={handleDogClick}
      onJoinClick={handleJoinClick}
      onLeaveClick={handleLeaveClick}
      onCancelRequestClick={handleCancelRequestClick}
      onEditClick={handleEditClick}
      onDeleteClick={handleDeleteClick}
      onAcceptRequest={handleAcceptRequest}
      onRejectRequest={handleRejectRequest}
      requestedDogs={requestedDogs}
    />
  );
};
