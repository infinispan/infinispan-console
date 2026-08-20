import React from 'react';
import { Button, ButtonVariant, Content, Modal, ModalBody, ModalFooter, ModalHeader } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

const RollingUpgradeConfirmationModal = (props: {
  isModalOpen: boolean;
  confirmAction: () => void;
  closeModal: () => void;
  type: 'sync-all' | 'disconnect-all';
  count: number;
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      variant={'small'}
      isOpen={props.isModalOpen}
      onClose={props.closeModal}
      aria-label={t('rolling-upgrades.modal.' + props.type + '-title')}
    >
      <ModalHeader
        titleIconVariant={props.type === 'disconnect-all' ? 'warning' : 'info'}
        title={t('rolling-upgrades.modal.' + props.type + '-title')}
      />
      <ModalBody>
        <Content>
          {t('rolling-upgrades.modal.' + props.type + '-description', {
            count: props.count
          })}
        </Content>
      </ModalBody>
      <ModalFooter>
        <Button
          variant={props.type === 'disconnect-all' ? ButtonVariant.danger : ButtonVariant.primary}
          onClick={props.confirmAction}
        >
          {t('rolling-upgrades.modal.confirm')}
        </Button>
        <Button key="cancel" variant="link" onClick={props.closeModal}>
          {t('rolling-upgrades.modal.cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { RollingUpgradeConfirmationModal };
