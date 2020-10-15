import React from 'react';
import {
  Button,
  ButtonVariant,
  Modal,
  Text,
  TextContent,
} from '@patternfly/react-core';
import cacheService from '@services/cacheService';
import { useApiAlert } from '@app/utils/useApiAlert';
import { useRecentActivity } from '@app/utils/useRecentActivity';
import { useFetchCache } from '@app/services/cachesHook';
import { useTranslation } from 'react-i18next';

/**
 * Clear all entries modal
 */
const ClearAllEntries = (props: {
  cacheName: string;
  isModalOpen: boolean;
  closeModal: () => void;
}) => {
  const { pushActivity } = useRecentActivity();
  const { addAlert } = useApiAlert();
  const { reload } = useFetchCache(props.cacheName);
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const onClickClearAllEntriesButton = () => {
    cacheService.clear(props.cacheName).then((actionResponse) => {
      addAlert(actionResponse);
      pushActivity({
        cacheName: props.cacheName,
        entryKey: '*',
        action: 'Clear all',
        date: new Date(),
      });
      reload();
    });
  };

  return (
    <Modal
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={t('caches.entries.modal-clear-title')}
      onClose={props.closeModal}
      aria-label={t('caches.entries.modal-clear-label')}
      actions={[
        <Button
          key="confirm"
          variant={ButtonVariant.danger}
          onClick={onClickClearAllEntriesButton}
        >
          {t('caches.entries.modal-clear-button-click')}
        </Button>,
        <Button key="cancel" variant="link" onClick={props.closeModal}>
          {t('caches.entries.modal-button-cancel')}
        </Button>
      ]}
    >
      <TextContent>
        <Text>
          {t('caches.entries.modal-clear-body-line-one')}{' '}
          <strong>{props.cacheName}</strong>.
          <br />
          {t('caches.entries.modal-clear-body-line-two')}
        </Text>
      </TextContent>
    </Modal>
  );
};

export { ClearAllEntries };
