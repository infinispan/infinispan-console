import React from 'react';
import { Button, ButtonVariant, Modal, Text, TextContent } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useClearStats } from '@app/services/statsHook';
import { useCacheDetail } from '@app/services/cachesHook';

/**
 * ClearMetrics entry modal
 */
const ClearMetrics = (props: {
  name: string;
  type: 'query' | 'cache-metrics' | 'global-stats';
  isModalOpen: boolean;
  closeModal: () => void;
}) => {
  const { t } = useTranslation();
  const { loadCache } = useCacheDetail();
  const { onClearStats } = useClearStats(props.name, props.type, () => {
    loadCache(props.name);
    props.closeModal();
  });
  const label = props.type == 'global-stats' ? props.type : 'caches.' + props.type;

  return (
    <Modal
      titleIconVariant={'warning'}
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={t(label + '.modal-clear-stats')}
      onClose={props.closeModal}
      aria-label={t(label + '.modal-clear-stats-label')}
      actions={[
        <Button data-cy="confirmButton" key="confirm" variant={ButtonVariant.danger} onClick={onClearStats}>
          {t(label + '.modal-button-clear-stats')}
        </Button>,
        <Button data-cy="cancelButton" key="cancel" variant="link" onClick={props.closeModal}>
          {t('common.actions.cancel')}
        </Button>
      ]}
    >
      <TextContent>
        <Text>{t(label + '.modal-button-clear-stats-body')}</Text>
      </TextContent>
    </Modal>
  );
};

export { ClearMetrics };
