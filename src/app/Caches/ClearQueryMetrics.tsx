import React from 'react';
import {Button, ButtonVariant, Modal, Text, TextContent} from '@patternfly/react-core';
import cacheService from '../../services/cacheService';
import {useApiAlert} from '@app/utils/useApiAlert';

/**
 * ClearQueryMetrics entry modal
 */
const ClearQueryMetrics = (props: {
  cacheName: string;
  isModalOpen: boolean;
  closeModal: () => void;
}) => {
  const { addAlert } = useApiAlert();

  const onClickDeleteButton = () => {
    cacheService
      .clearQueryStats(props.cacheName)
      .then(actionResponse => {
        addAlert(actionResponse);
        props.closeModal();
      });
  };

  return (
    <Modal
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={'Clear query stats?'}
      onClose={props.closeModal}
      aria-label="Clear query stats modal"
      actions={[
        <Button
          key="confirm"
          variant={ButtonVariant.danger}
          onClick={onClickDeleteButton}
        >
          Clear stats
        </Button>,
        <Button key="cancel" variant="link" onClick={props.closeModal}>
          Cancel
        </Button>
      ]}
    >
      <TextContent>
        <Text>
          This action will permanently clear all the cache query statistics.
          <br />
         This cannot be undone.
        </Text>
      </TextContent>
    </Modal>
  );
};

export { ClearQueryMetrics };
