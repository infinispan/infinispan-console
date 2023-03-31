import React from 'react';
import { Button, ButtonVariant, Modal, Text, TextContent } from '@patternfly/react-core';

/**
 * State transfer modal
 */
const StateTransfer = (props: {
  cacheName: string;
  siteName: string;
  isModalOpen: boolean;
  action: 'start' | 'cancel' | '';
  closeModal: (boolean) => void;
}) => {
  const buildContent = () => {
    if (props.action == 'cancel') {
      return (
        <Text>
          This action will cancel the ongoing state transfer operation from cache <strong>{props.cacheName}</strong> to
          the site <strong>{props.siteName}</strong>.
          <br />
          Are you sure you want to cancel the state transfer?
        </Text>
      );
    }

    return (
      <Text>
        The state transfer operation implies transferring the data from cache <strong>{props.cacheName}</strong> to its
        backup cache in the site <strong>{props.siteName}</strong>. This operation can take long.
        <br />
        Are you sure you want to start a state transfer?
      </Text>
    );
  };

  return (
    <Modal
      titleIconVariant={props.action == 'start' ? 'info' : 'warning'}
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={props.action == 'start' ? 'State transfer?' : 'Cancel state transfer?'}
      onClose={() => props.closeModal(false)}
      aria-label="State transfer modal"
      actions={[
        <Button data-cy={props.action == 'start' ? 'startTransferButton' : 'cancelStateTransferButton'}
          key="state-transfer-button"
          onClick={() => props.closeModal(true)}
          variant={props.action == 'start' ? ButtonVariant.primary : ButtonVariant.danger}
        >
          {props.action == 'start' ? 'Start transfer' : 'Cancel transfer'}
        </Button>,
        <Button data-cy="closeModalButton" key="cancel" variant="link" onClick={() => props.closeModal(false)}>
          Cancel
        </Button>
      ]}
    >
      <TextContent>{buildContent()}</TextContent>
    </Modal>
  );
};

export { StateTransfer };
