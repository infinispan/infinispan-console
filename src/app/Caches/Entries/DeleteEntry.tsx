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
import { useCacheEntries, useReloadCache } from '@app/services/cachesHook';
import { ContentType } from '@services/utils';
import { useTranslation } from 'react-i18next';

/**
 * Delete entry modal
 */
const DeleteEntry = (props: {
  cacheName: string;
  entryKey: string;
  keyContentType: ContentType;
  isModalOpen: boolean;
  closeModal: () => void;
}) => {
  const { addAlert } = useApiAlert();
  const { pushActivity } = useRecentActivity();
  const { reload } = useReloadCache();
  const { reloadEntries } = useCacheEntries();
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const onClickDeleteButton = () => {
    cacheService
      .deleteEntry(props.cacheName, props.entryKey, props.keyContentType)
      .then((actionResponse) => {
        reload();
        reloadEntries();
        addAlert(actionResponse);
        pushActivity({
          cacheName: props.cacheName,
          entryKey: props.entryKey,
          keyContentType: props.keyContentType,
          action: 'Delete',
          date: new Date(),
        });
      });
  };

  return (
    <Modal
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={'Delete entry?'}
      onClose={props.closeModal}
      aria-label={t('caches.entries.modal-delete-label')}
      actions={[
        <Button
          key="confirm"
          variant={ButtonVariant.danger}
          onClick={onClickDeleteButton}
        >
          {t('caches.entries.modal-button-delete')}
        </Button>,
        <Button key="cancel" variant="link" onClick={props.closeModal}>
          {t('caches.entries.modal-button-cancel')}
        </Button>,
      ]}
    >
      <TextContent>
        <Text>
          {t('caches.entries.modal-delete-body-line-one')}{' '}
          <strong>'{props.entryKey}'</strong>{' '}
          {t('caches.entries.modal-delete-body-line-two')}{' '}
          <strong>{props.cacheName}</strong>.
          <br />
          {t('caches.entries.modal-delete-body-line-three')}
        </Text>
      </TextContent>
    </Modal>
  );
};

export { DeleteEntry };
