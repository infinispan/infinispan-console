import React from 'react';
import { Button, ButtonVariant, Modal, Text, TextContent } from '@patternfly/react-core';
import { useApiAlert } from '@app/utils/useApiAlert';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';

/**
 * ClearQueryMetrics entry modal
 */
const ClearQueryMetrics = (props: { cacheName: string; isModalOpen: boolean; closeModal: () => void }) => {
  const { addAlert } = useApiAlert();
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const onClickDeleteButton = () => {
    ConsoleServices.search()
      .clearQueryStats(props.cacheName)
      .then((actionResponse) => {
        addAlert(actionResponse);
        props.closeModal();
      });
  };

  return (
    <Modal
      titleIconVariant={'warning'}
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={t('caches.query.modal-clear-query-stats')}
      onClose={props.closeModal}
      aria-label={t('caches.query.modal-clear-query-stats-label')}
      actions={[
        <Button key="confirm" variant={ButtonVariant.danger} onClick={onClickDeleteButton}>
          {t('caches.query.modal-button-query-clear-stats')}
        </Button>,
        <Button key="cancel" variant="link" onClick={props.closeModal}>
          {t('caches.query.modal-button-cancel')}
        </Button>
      ]}
    >
      <TextContent>
        <Text>{t('caches.query.modal-button-query-clear-stats-body')}</Text>
      </TextContent>
    </Modal>
  );
};

export { ClearQueryMetrics };
