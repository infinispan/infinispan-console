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
import { useRecentActivity } from '@app/utils/useRecentActivity';
import { useReloadCache } from '@app/services/cachesHook';
import { ContentType } from "@services/utils";

/**
 * Delete entry modal
 */
const DeleteEntry = (props: {
  cacheName: string;
  entryKey: string;
  keyContentType: ContentType;
  isModalOpen: boolean;
  closeModal: () => void;
}) => {
  const { addAlert } = useApiAlert();
  const { pushActivity } = useRecentActivity();
  const { reload } = useReloadCache();

  const onClickDeleteButton = () => {
    cacheService
      .deleteEntry(props.cacheName, props.entryKey, props.keyContentType)
      .then(actionResponse => {
        props.closeModal();
        reload();
        addAlert(actionResponse);
        pushActivity({
          cacheName: props.cacheName,
          entryKey: props.entryKey,
          action: 'Delete',
          date: new Date(),
        });
      });
  };

  return (
    <Modal
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={'Delete entry?'}
      onClose={props.closeModal}
      aria-label="Delete entry modal"
      actions={[
        <Button
          key="confirm"
          variant={ButtonVariant.danger}
          onClick={onClickDeleteButton}
        >
          Delete
        </Button>,
        <Button key="cancel" variant="link" onClick={props.closeModal}>
          Cancel
        </Button>,
      ]}
    >
      <TextContent>
        <Text>
          This action will permanently delete the key{' '}
          <strong>'{props.entryKey}'</strong> from the cache{' '}
          <strong>{props.cacheName}</strong>.
          <br />
          You can always recreate the entry after.
        </Text>
      </TextContent>
    </Modal>
  );
};

export { DeleteEntry };
