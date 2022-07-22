import React from 'react';
import { Button, ButtonVariant, Modal, Text, TextContent } from '@patternfly/react-core';
import { useApiAlert } from '@app/utils/useApiAlert';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';

/**
 * Purge index modal
 */
const PurgeIndex = (props: { cacheName: string; isModalOpen: boolean; closeModal: () => void }) => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { addAlert } = useApiAlert();

  const onClickPurgeButton = () => {
    ConsoleServices.search()
      .purgeIndexes(props.cacheName)
      .then((actionResponse) => {
        props.closeModal();
        addAlert(actionResponse);
      });
  };

  return (
    <Modal
      titleIconVariant={'warning'}
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={'Permanently clear index?'}
      onClose={props.closeModal}
      aria-label="Clear index modal"
      actions={[
        <Button data-cy="clearIndex" key="purge" variant={ButtonVariant.danger} onClick={onClickPurgeButton}>
          Clear
        </Button>,
        <Button data-cy="cancelButton" key="cancel" variant="link" onClick={props.closeModal}>
          Cancel
        </Button>
      ]}
    >
      <TextContent>
        <Text>
          All indexes in <strong>{props.cacheName}</strong> will be deleted.
        </Text>
      </TextContent>
    </Modal>
  );
};

export { PurgeIndex };
