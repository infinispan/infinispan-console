import React from 'react';
import { Button, Modal, Text, TextContent } from '@patternfly/react-core';
import { useApiAlert } from '@app/utils/useApiAlert';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';

/**
 * Reindex modal
 */
const Reindex = (props: { cacheName: string; isModalOpen: boolean; closeModal: () => void }) => {
  const { addAlert } = useApiAlert();
  const { t } = useTranslation();
  const onClickReindex = () => {
    ConsoleServices.search()
      .reindex(props.cacheName)
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
      title={t('caches.index.reindex.title')}
      onClose={props.closeModal}
      aria-label="Reindex modal"
      actions={[
        <Button key="reindex" onClick={onClickReindex} data-cy="reindexButton">
          {t('caches.index.reindex.button-rebuild-index')}
        </Button>,
        <Button key="cancel" variant="link" onClick={props.closeModal} data-cy="cancelReindexButton">
          {t('common.actions.cancel')}
        </Button>
      ]}
    >
      <TextContent>
        <Text>{t('caches.index.reindex.description1')}</Text>
        <Text>{t('caches.index.reindex.description2')}</Text>
      </TextContent>
    </Modal>
  );
};

export { Reindex };
