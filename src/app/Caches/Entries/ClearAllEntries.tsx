import React from 'react';
import { Button, ButtonVariant, Modal, Text, TextContent } from '@patternfly/react-core';
import { useApiAlert } from '@app/utils/useApiAlert';
import { useCacheDetail } from '@app/services/cachesHook';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';

/**
 * Clear all entries modal
 */
const ClearAllEntries = (props: { cacheName: string; isModalOpen: boolean; closeModal: () => void }) => {
  const { addAlert } = useApiAlert();
  const { reload } = useCacheDetail();
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const onClickClearAllEntriesButton = () => {
    ConsoleServices.caches()
      .clear(props.cacheName)
      .then((actionResponse) => {
        addAlert(actionResponse);
        reload();
      });
  };

  return (
    <Modal
      titleIconVariant={'warning'}
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={t('caches.entries.modal-clear-title')}
      onClose={props.closeModal}
      aria-label={t('caches.entries.modal-clear-label')}
      actions={[
        <Button data-cy='deleteButton' key="confirm" variant={ButtonVariant.danger} onClick={onClickClearAllEntriesButton}>
          {t('caches.entries.modal-clear-button-click')}
        </Button>,
        <Button data-cy='cancelButton' key="cancel" variant="link" onClick={props.closeModal}>
          {t('caches.entries.modal-button-cancel')}
        </Button>
      ]}
    >
      <TextContent>
        <Text>
          {t('caches.entries.modal-clear-body-line-one')} <strong>{props.cacheName}</strong>.
          <br />
          {t('caches.entries.modal-clear-body-line-two')}
        </Text>
      </TextContent>
    </Modal>
  );
};

export { ClearAllEntries };
