import React from 'react';
import { Button, Modal, Text, TextContent } from '@patternfly/react-core';
import cacheService from '@services/cacheService';
import { useApiAlert } from '@app/utils/useApiAlert';
import { useTranslation } from 'react-i18next';

/**
 * Reindex modal
 */
const Reindex = (props: {
  cacheName: string;
  isModalOpen: boolean;
  closeModal: () => void;
}) => {
  const { addAlert } = useApiAlert();
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const onClickPurgeButton = () => {
    cacheService.reindex(props.cacheName).then((actionResponse) => {
      props.closeModal();
      addAlert(actionResponse);
    });
  };

  return (
    <Modal
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={'Reindex cache?'}
      onClose={props.closeModal}
      aria-label="Reindex modal"
      actions={[
        <Button key="reindex" onClick={onClickPurgeButton}>
          Reindex
        </Button>,
        <Button key="cancel" variant="link" onClick={props.closeModal}>
          Cancel
        </Button>,
      ]}
    >
      <TextContent>
        <Text>
          Reindexing a cache might take time.
          <br />
          Are you sure you want to start reindexing?
        </Text>
      </TextContent>
    </Modal>
  );
};

export { Reindex };
