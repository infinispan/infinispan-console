import React from 'react';
import { Button, ButtonVariant, Modal, Text, TextContent } from '@patternfly/react-core';
import { useDeleteCounter } from '@app/services/countersHook';
import { useTranslation } from 'react-i18next';

/**
 * Delete counter modal
 */
const DeleteCounter = (props: {
  name: string;
  isModalOpen: boolean;
  submitModal: () => void;
  closeModal: () => void;
  isDisabled: boolean;
}) => {
  const { t } = useTranslation();

  const { onDelete } = useDeleteCounter(props.name);

  return (
    <Modal
      titleIconVariant={'warning'}
      id={'delete-counter-modal'}
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={t('cache-managers.counters.modal-delete-modal')}
      onClose={props.closeModal}
      aria-label={t('cache-managers.counters.modal-delete-modal')}
      disableFocusTrap={true}
      actions={[
        <Button
          key={t('cache-managers.counters.modal-confirm-button')}
          aria-label={'Confirm'}
          variant={ButtonVariant.danger}
          onClick={() => {
            onDelete();
            props.submitModal();
          }}
          isDisabled={props.isDisabled}
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
          The counter and its state will be permanently deleted from the cluster <strong>'{props.name}'</strong>
        </Text>
      </TextContent>
    </Modal>
  );
};

export { DeleteCounter };
