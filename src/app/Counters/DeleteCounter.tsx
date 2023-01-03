import React from 'react';
import { Button, ButtonVariant, Modal, Text, TextContent } from '@patternfly/react-core';
import { useDeleteCounter } from '@app/services/countersHook';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import { ConsoleACL } from '@services/securityService';
import { useConnectedUser } from '@app/services/userManagementHook';

/**
 * Delete counter modal
 */
const DeleteCounter = (props: { name: string; isModalOpen: boolean; closeModal: () => void }) => {
  const { t } = useTranslation();

  const { onDelete } = useDeleteCounter(props.name);
  const { connectedUser } = useConnectedUser();
  const canDelete = ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser);

  return (
    <Modal
      titleIconVariant={'warning'}
      id={'delete-counter-modal'}
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={t('cache-managers.counters.modal-delete-modal')}
      onClose={props.closeModal}
      aria-label="Delete counter modal"
      disableFocusTrap={true}
      actions={[
        <Button
          key={t('cache-managers.counters.modal-confirm-button')}
          aria-label={'Confirm'}
          variant={ButtonVariant.danger}
          onClick={() => {
            onDelete();
            props.closeModal();
          }}
          isDisabled={!canDelete}
        >
          {t('cache-managers.counters.delete-action')}
        </Button>,
        <Button key={'Cancel'} aria-label={'Cancel'} variant={ButtonVariant.link} onClick={props.closeModal}>
          {t('cache-managers.counters.modal-cancel-button')}
        </Button>
      ]}
    >
      <TextContent>
        <Text>
          The counter will be permanently deleted from the cluster <strong>'{props.name}'</strong>
          <br />
          You can always recreate the counter.
        </Text>
      </TextContent>
    </Modal>
  );
};

export { DeleteCounter };
