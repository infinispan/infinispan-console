import React from 'react';
import { Button, ButtonVariant, Modal, Text, TextContent, TextInput } from '@patternfly/react-core';
import { useAddDeltaCounter } from '@app/services/countersHook';
import { useTranslation } from 'react-i18next';

const AddDeltaCounter = (props: {
  name: string;
  deltaValue: number;
  setDeltaValue;
  submitModal: () => void;
  isModalOpen: boolean;
  closeModal: () => void;
}) => {
  const { t } = useTranslation();
  const { onAddDelta } = useAddDeltaCounter(props.name, props.deltaValue);

  return (
    <Modal
      id={'add-delta-counter-modal'}
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={t('cache-managers.counters.modal-delta-title')}
      onClose={props.closeModal}
      aria-label={t('cache-managers.counters.modal-delta-title')}
      disableFocusTrap={true}
      actions={[
        <Button
          key={'Confirm'}
          aria-label={'Confirm'}
          variant={ButtonVariant.danger}
          onClick={() => {
            onAddDelta();
            props.submitModal();
          }}
        >
          {t('cache-managers.counters.modal-confirm-button')}
        </Button>,
        <Button key={'Cancel'} aria-label={'Cancel'} variant={ButtonVariant.link} onClick={props.closeModal}>
          {t('cache-managers.counters.modal-cancel-button')}
        </Button>
      ]}
    >
      <TextContent>
        <Text>{t('cache-managers.counters.delta-text-input')}</Text>
        <TextInput
          value={props.deltaValue}
          type="number"
          onChange={(value) => props.setDeltaValue(value)}
          aria-label={t('cache-managers.counters.delta-text-input')}
        />
      </TextContent>
    </Modal>
  );
};

export { AddDeltaCounter };
