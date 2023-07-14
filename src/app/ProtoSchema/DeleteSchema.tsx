import React from 'react';
import { Button, ButtonVariant, Modal, Text, TextContent } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useDeleteProtobufSchema } from '@app/services/protobufHooks';

const DeleteSchema = (props: { schemaName: string; isModalOpen: boolean; closeModal: () => void }) => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { onDeleteSchema } = useDeleteProtobufSchema(props.schemaName);

  const onClickDeleteButton = () => {
    onDeleteSchema();
    props.closeModal();
  };

  return (
    <Modal
      titleIconVariant={'danger'}
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={t('schemas.delete.heading')}
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
        <Button
          id="cancel-delete-schema-button"
          name="cancel-delete-schema-button"
          aria-label="cancel-delete-schema-button"
          key="cancel"
          variant="link"
          onClick={props.closeModal}
        >
          {t('schemas.cancel-button')}
        </Button>
      ]}
    >
      <TextContent>
        <Text>
          <strong>{props.schemaName}</strong> {t('schemas.delete.modal-description-1', { brandname: brandname })}
        </Text>
        <Text>{t('schemas.delete.modal-description-2')}</Text>
      </TextContent>
    </Modal>
  );
};

export { DeleteSchema };
