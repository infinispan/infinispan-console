import React from 'react';
import {
  Button,
  ButtonVariant,
  Modal,
  Text,
  TextContent,
} from '@patternfly/react-core';
import { useApiAlert } from '@app/utils/useApiAlert';
import { useTranslation } from 'react-i18next';
import {ConsoleServices} from "@services/ConsoleServices";
import {EyeIcon, EyeSlashIcon} from "@patternfly/react-icons";

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
    ConsoleServices.protobuf().delete(props.schemaName).then((actionResponse) => {
      addAlert(actionResponse);
      props.closeModal();
    });
  };

  return (
    <Modal
      titleIconVariant={'danger'}
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={'Permanently delete schema?'}
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
          {' '} will be permanently deleted
          <strong>'{props.schemaName}'</strong> from the data container, and <br />
          caches using this schema will be affected.
          <br />
          You can always recreate the schema.
        </Text>
      </TextContent>
    </Modal>
  );
};

export { DeleteSchema };
