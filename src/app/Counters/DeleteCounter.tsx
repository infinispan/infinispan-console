import React from 'react';
import {Button, ButtonVariant, Modal, Text, TextContent} from '@patternfly/react-core';
import {useApiAlert} from '@app/utils/useApiAlert';
import countersService from "../../services/countersService";

/**
 * Delete counter modal
 */
const DeleteCounter = (props: {
  name: string;
  isModalOpen: boolean;
  closeModal: () => void;
}) => {
  const { addAlert } = useApiAlert();

  const onClickDeleteButton = () => {
    countersService
      .delete(props.name)
      .then(actionResponse => {
        props.closeModal();
        addAlert(actionResponse);
      });
  };

  return (
    <Modal
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={'Delete counter?'}
      onClose={props.closeModal}
      aria-label="Delete counter modal"
      actions={[
        <Button
          key="confirm"
          variant={ButtonVariant.danger}
          onClick={onClickDeleteButton}
        >
          Delete
        </Button>,
        <Button key="cancel" variant="link" onClick={props.closeModal}>
          Cancel
        </Button>
      ]}
    >
      <TextContent>
        <Text>
          This action will permanently delete the counter from the cluster{' '}
          <strong>'{props.name}'</strong>
          <br />
          This cannot be undone, but you can recreate the counter after.
        </Text>
      </TextContent>
    </Modal>
  );
};

export { DeleteCounter };
