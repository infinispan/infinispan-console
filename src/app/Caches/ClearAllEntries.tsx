import React from 'react';
import {Button, ButtonVariant, Modal, TextContent, Text} from '@patternfly/react-core';
import cacheService from '../../services/cacheService';
import {useApiAlert} from '@app/utils/useApiAlert';

/**
 * Clear all entries modal
 */
const ClearAllEntries = (props: {
  cacheName: string;
  isModalOpen: boolean;
  closeModal: () => void;
}) => {
  const { addAlert } = useApiAlert();

  const onClickDeleteButton = () => {
    cacheService.clear(props.cacheName)
      .then(actionResponse =>{
        props.closeModal();
        addAlert(actionResponse);
      });
  };

  return (
    <Modal
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={'Clear all entries?'}
      onClose={props.closeModal}
      isFooterLeftAligned
      aria-label="Clear all entries modal"
      actions={[
        <Button
          key="confirm"
          variant={ButtonVariant.danger}
          onClick={onClickDeleteButton}
        >
          Clear
        </Button>,
        <Button key="cancel" variant="link" onClick={props.closeModal}>
          Cancel
        </Button>
      ]}
    >
        <TextContent>
          <Text>
            This action will permanently clear all entries in <strong>{props.cacheName}</strong>.
            <br />
            This cannot be undone.
          </Text>
        </TextContent>
      </Modal>
  );
};

export { ClearAllEntries };
