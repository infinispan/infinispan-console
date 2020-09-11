import React from 'react';
import {Button, ButtonVariant, Modal, Text, TextContent} from '@patternfly/react-core';
import cacheService from '@services/cacheService';
import {useApiAlert} from '@app/utils/useApiAlert';
import {useRecentActivity} from '@app/utils/useRecentActivity';

/**
 * Clear all entries modal
 */
const ClearAllEntries = (props: {
  cacheName: string;
  isModalOpen: boolean;
  closeModal: () => void;
}) => {
  const { pushActivity } = useRecentActivity();
  const { addAlert } = useApiAlert();

  const onClickClearAllEntriesButton = () => {
    cacheService.clear(props.cacheName).then(actionResponse => {
      addAlert(actionResponse);
      pushActivity({
        cacheName: props.cacheName,
        entryKey: '*',
        action: 'Clear all',
        date: new Date()
      });
      props.closeModal();
    });
  };

  return (
    <Modal
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={'Clear all entries?'}
      onClose={props.closeModal}
      aria-label="Clear all entries modal"
      actions={[
        <Button
          key="confirm"
          variant={ButtonVariant.danger}
          onClick={onClickClearAllEntriesButton}
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
          This action will permanently clear all entries in{' '}
          <strong>{props.cacheName}</strong>.
          <br />
          This cannot be undone.
        </Text>
      </TextContent>
    </Modal>
  );
};

export { ClearAllEntries };
