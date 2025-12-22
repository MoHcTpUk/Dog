import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { DogProfileModal } from '@widgets/DogProfileModal';
import { mockDogs } from '@shared/mocks/walks.mock';

export const DogProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  const dog = mockDogs.find((d) => d.id === id);

  if (!dog) {
    return null;
  }

  const handleClose = () => {
    history.goBack();
  };

  const handleInviteClick = () => {
    // TODO: Implement invite logic
    handleClose();
  };

  return (
    <DogProfileModal
      dog={dog}
      onClose={handleClose}
      onInviteClick={handleInviteClick}
    />
  );
};
