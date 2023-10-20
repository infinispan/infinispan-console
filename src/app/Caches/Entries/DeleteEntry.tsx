import React from 'react';
import { Button, ButtonVariant, Modal, Text, TextContent } from '@patternfly/react-core';
import { useApiAlert } from '@app/utils/useApiAlert';
import { useCacheDetail } from '@app/services/cachesHook';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import { ContentType, EncodingType } from '@services/infinispanRefData';

/**
 * Delete entry modal
 */
const DeleteEntry = (props: {
  cacheName: string;
  cacheEncoding: CacheEncoding;
  entryKey: string;
  keyContentType: ContentType;
  isModalOpen: boolean;
  closeModal: () => void;
}) => {
  const { addAlert } = useApiAlert();
  const { reload } = useCacheDetail();
  const { t } = useTranslation();

  const onClickDeleteButton = () => {
    if (
      (props.cacheEncoding.key as EncodingType) == EncodingType.Java ||
      (props.cacheEncoding.key as EncodingType) == EncodingType.JBoss
    ) {
      tryDeleteEntry(props.keyContentType, true)
        .then((r) => {
          if (r && !Number.isNaN(props.entryKey)) {
            return tryDeleteEntry(ContentType.IntegerContentType, true);
          }
          return false;
        })
        .then((r) => {
          if (r) {
            return tryDeleteEntry(ContentType.LongContentType, true);
          }
          return false;
        })
        .then((r) => {
          if (r) {
            return tryDeleteEntry(ContentType.FloatContentType, true);
          }
          return false;
        })
        .then((r) => {
          if (r) {
            return tryDeleteEntry(ContentType.DoubleContentType, false);
          }
          return false;
        });
    } else {
      tryDeleteEntry(props.keyContentType, false);
    }
  };

  const tryDeleteEntry = (keyContentType: ContentType, retry: boolean): Promise<boolean> => {
    return ConsoleServices.caches()
      .deleteEntry(props.cacheName, props.entryKey, props.cacheEncoding.key as EncodingType, keyContentType)
      .then((actionResponse) => {
        if (retry && !actionResponse.success) {
          return true;
        }
        reload();
        addAlert(actionResponse);
        return false;
      });
  };

  return (
    <Modal
      titleIconVariant={'warning'}
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={'Delete entry?'}
      onClose={props.closeModal}
      aria-label={t('caches.entries.modal-delete-label')}
      actions={[
        <Button data-cy="deleteEntryButton" key="confirm" variant={ButtonVariant.danger} onClick={onClickDeleteButton}>
          {t('caches.entries.modal-button-delete')}
        </Button>,
        <Button data-cy="cancelDeleteEntry" key="cancel" variant="link" onClick={props.closeModal}>
          {t('caches.entries.modal-button-cancel')}
        </Button>
      ]}
    >
      <TextContent>
        <Text>
          {t('caches.entries.modal-delete-body-line-one')} <strong>&quot;{props.entryKey}&quot;</strong>{' '}
          {t('caches.entries.modal-delete-body-line-two')} <strong>{props.cacheName}</strong>.
        </Text>
        <Text>{t('caches.entries.modal-delete-body-line-three')}</Text>
      </TextContent>
    </Modal>
  );
};

export { DeleteEntry };
