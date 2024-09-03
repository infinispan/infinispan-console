import React from 'react';
import { Button, ButtonVariant, Modal, Text, TextContent } from '@patternfly/react-core';
import { useApiAlert } from '@app/utils/useApiAlert';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';

/**
 * Update schema modal
 */
const UpdateSchema = (props: { cacheName: string; isModalOpen: boolean; closeModal: () => void }) => {
  const { t } = useTranslation();
  const { addAlert } = useApiAlert();

  const onClickPurgeButton = () => {
    ConsoleServices.search()
      .updateSchema(props.cacheName)
      .then((actionResponse) => {
        props.closeModal();
        addAlert(actionResponse);
      });
  };

  return (
    <Modal
      titleIconVariant={'info'}
      width={'50%'}
      isOpen={props.isModalOpen}
      title={t('caches.index.update-schema.title')}
      onClose={props.closeModal}
      aria-label="update schema modal"
      actions={[
        <Button data-cy="updateCacheSchema" key="purge" variant={ButtonVariant.primary} onClick={onClickPurgeButton}>
          {t('common.actions.update')}
        </Button>,
        <Button data-cy="cancelButton" key="cancel" variant="link" onClick={props.closeModal}>
          {t('common.actions.cancel')}
        </Button>
      ]}
    >
      <TextContent>
        <Text>{t('caches.index.update-schema.description1')}</Text>
        <Text>{t('caches.index.update-schema.description2')}</Text>
      </TextContent>
    </Modal>
  );
};

export { UpdateSchema };
