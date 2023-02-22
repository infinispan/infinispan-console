import React from 'react';
import { Button, ButtonVariant, Modal, Text, TextContent } from '@patternfly/react-core';
import { useResetCounter } from '@app/services/countersHook';
import { useTranslation } from 'react-i18next';

/**
 * Reset counter modal
 */
const ResetCounter = (props: {
  name: string;
  isModalOpen: boolean;
  initialValue;
  submitModal: () => void;
  closeModal: () => void;
}) => {
  const { onResetCounter } = useResetCounter(props.name);
  const { t } = useTranslation();

  return (
    <Modal
      titleIconVariant={'warning'}
      id={'reset-counter-modal'}
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={t('cache-managers.counters.modal-reset-title')}
      onClose={props.closeModal}
      aria-label={t('cache-managers.counters.modal-reset-title')}
      disableFocusTrap={true}
      actions={[
        <Button
          data-cy="resetCounterButton"
          key={'Reset'}
          aria-label={'Reset'}
          variant={ButtonVariant.danger}
          onClick={() => {
            props.submitModal();
            onResetCounter();
          }}
        >
          {t('cache-managers.counters.reset-action')}
        </Button>,
        <Button key={'Cancel'} aria-label={'Cancel'} variant={ButtonVariant.link} onClick={props.closeModal} data-cy="cancelCounterResetButton">
          {t('cache-managers.counters.modal-cancel-button')}
        </Button>
      ]}
    >
      <TextContent>
        <Text>
          The current value of <strong>{props.name}</strong> will be restored to its initial  value of{' '}
          <strong>{props.initialValue}</strong>
        </Text>
      </TextContent>
    </Modal>
  );
};

export { ResetCounter };
