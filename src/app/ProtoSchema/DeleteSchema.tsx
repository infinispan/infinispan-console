import React from 'react';
import {
  Button,
  ButtonVariant,
  Modal,
  Text,
  TextContent,
} from '@patternfly/react-core';
import { useApiAlert } from '@app/utils/useApiAlert';
import protobufService from '../../services/protobufService';
import { useTranslation } from 'react-i18next';

/**
 * Delete schema modal
 */
const DeleteSchema = (props: {
  schemaName: string;
  isModalOpen: boolean;
  closeModal: () => void;
}) => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { addAlert } = useApiAlert();

  const onClickDeleteButton = () => {
    protobufService.delete(props.schemaName).then((actionResponse) => {
      addAlert(actionResponse);
      props.closeModal();
    });
  };

  return (
    <Modal
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={'Delete schema?'}
      onClose={props.closeModal}
      aria-label="Delete schema modal"
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
          This action will permanently delete the schema{' '}
          <strong>'{props.schemaName}'</strong> from the data container <br />
          <strong>Caches using this schema will be strongly affected</strong>.
          <br />
          You can always recreate the schema.
        </Text>
      </TextContent>
    </Modal>
  );
};

export { DeleteSchema };
