import React from 'react';
import {
  Button,
  ButtonVariant,
  Modal,
  Text,
  TextContent,
} from '@patternfly/react-core';
import { useDeleteCounter } from '@app/services/countersHook';

/**
 * Delete counter modal
 */
const DeleteCounter = (props: {
  name: string;
  isModalOpen: boolean;
  closeModal: () => void;
}) => {
  const { onDelete } = useDeleteCounter(props.name);

  return (
    <Modal
      id={'delete-counter-modal'}
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={'Permanently delete counter?'}
      onClose={props.closeModal}
      aria-label="Delete counter modal"
      actions={[
        <Button
          key={'Confirm'}
          aria-label={'Confirm'}
          variant={ButtonVariant.danger}
          onClick={() => {
            onDelete();
            props.closeModal();
          }}
        >
          Delete
        </Button>,
        <Button
          key={'Cancel'}
          aria-label={'Cancel'}
          variant={ButtonVariant.link}
          onClick={props.closeModal}
        >
          Cancel
        </Button>,
      ]}
    >
      <TextContent>
        <Text>
          The counter will be permanently deleted from the cluster{' '}
          <strong>'{props.name}'</strong>
          <br />
          You can always recreate the counter.
        </Text>
      </TextContent>
    </Modal>
  );
};

export { DeleteCounter };
