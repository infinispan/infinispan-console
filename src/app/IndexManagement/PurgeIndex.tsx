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
import { useTranslation } from 'react-i18next';

/**
 * Purge index modal
 */
const PurgeIndex = (props: {
  cacheName: string;
  isModalOpen: boolean;
  closeModal: () => void;
}) => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { addAlert } = useApiAlert();

  const onClickPurgeButton = () => {
    cacheService.purgeIndexes(props.cacheName).then((actionResponse) => {
      props.closeModal();
      addAlert(actionResponse);
    });
  };

  return (
    <Modal
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={'Purge index?'}
      onClose={props.closeModal}
      aria-label="Purge index modal"
      actions={[
        <Button
          key="purge"
          variant={ButtonVariant.danger}
          onClick={onClickPurgeButton}
        >
          Purge
        </Button>,
        <Button key="cancel" variant="link" onClick={props.closeModal}>
          Cancel
        </Button>,
      ]}
    >
      <TextContent>
        <Text>
          This action will permanently clear all indexes from the cache{' '}
          <strong>{props.cacheName}</strong>.
          <br />
          This cannot be undone.
        </Text>
      </TextContent>
    </Modal>
  );
};

export { PurgeIndex };
