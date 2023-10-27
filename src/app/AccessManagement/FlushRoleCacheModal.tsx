import React from 'react';
import { Button, ButtonVariant, Modal, Text, TextContent } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useFlushCache } from '@app/services/rolesHook';

const FlushRoleCacheModal = (props: { isModalOpen: boolean; submitModal: () => void; closeModal: () => void }) => {
  const { t } = useTranslation();
  const { onFlushCache } = useFlushCache(props.submitModal);

  return (
    <Modal
      titleIconVariant={'warning'}
      id={'flush-cache-modal'}
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={t('access-management.modal-flush-cache-title')}
      onClose={props.closeModal}
      aria-label="modal-flush-cache"
      disableFocusTrap={true}
      actions={[
        <Button
          key={'Flush'}
          aria-label={'Flush'}
          variant={ButtonVariant.warning}
          onClick={() => {
            onFlushCache();
          }}
        >
          {t('access-management.flush-cache-action')}
        </Button>,
        <Button
          key={'Cancel'}
          aria-label={'Cancel'}
          variant={ButtonVariant.link}
          onClick={props.closeModal}
        >
          {t('common.actions.cancel')}
        </Button>
      ]}
    >
      <TextContent>
        <Text>
          {t('access-management.modal-flush-cache-description')}
        </Text>
      </TextContent>
    </Modal>
  );
};

export { FlushRoleCacheModal };
