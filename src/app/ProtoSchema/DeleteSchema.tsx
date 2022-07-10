import React from 'react';
import {Button, ButtonVariant, Modal, Text, TextContent,} from '@patternfly/react-core';
import {useApiAlert} from '@app/utils/useApiAlert';
import {useTranslation} from 'react-i18next';
import {ConsoleServices} from "@services/ConsoleServices";

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
          id="confirm-delete-schema-button"
          name="confirm-delete-schema-button"
          aria-label="confirm-delete-schema-button"
          key="confirm"
          variant={ButtonVariant.danger}
          onClick={onClickDeleteButton}
        >
          {t('schemas.delete-button')}
        </Button>,
        <Button  id="cancel-delete-schema-button"
                 name="cancel-delete-schema-button"
                 key="cancel"
                 variant="link" onClick={props.closeModal}>
          {t('schemas.cancel-button')}
        </Button>,
      ]}
    >
      <TextContent>
        <Text>
          {t('schemas.delete.modal-description-1', {"brandname": brandname, "schemaname": props.schemaName})}
        </Text>
        <Text>
          {t('schemas.delete.modal-description-2')}
        </Text>
      </TextContent>
    </Modal>
  );
};

export { DeleteSchema };
