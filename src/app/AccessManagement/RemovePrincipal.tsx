import React from 'react';
import { Button, ButtonVariant, Modal, Text, TextContent } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useDeleteRole } from '@app/services/rolesHook';
import { useGrantAccess, useRemovePrincipal } from '@app/services/principalsHook';

const RemovePrincipal = (props: {
  name: string;
  isModalOpen: boolean;
  submitModal: () => void;
  closeModal: () => void;
}) => {
  const { t } = useTranslation();
  const { onRemove } = useRemovePrincipal(props.name, props.submitModal);
  const brandname = t('brandname.brandname');

  return (
    <Modal
      titleIconVariant={'warning'}
      id={'remove-principal-modal'}
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={t('access-management.principals.modal-remove-title', { principalName: props.name })}
      onClose={props.closeModal}
      aria-label="modal-principal-delete"
      disableFocusTrap={true}
      actions={[
        <Button
          key={'Remove'}
          aria-label={'Remove'}
          variant={ButtonVariant.warning}
          onClick={() => {
            onRemove();
          }}
        >
          {t('common.actions.remove')}
        </Button>,
        <Button
          key={'Cancel'}
          aria-label={'Cancel'}
          variant={ButtonVariant.link}
          onClick={props.closeModal}
          data-cy="cancelPrincipalRemoveButton"
        >
          {t('common.actions.cancel')}
        </Button>
      ]}
    >
      <TextContent>
        <Text>{t('access-management.principals.modal-remove-description-1', { brandname: brandname })}</Text>
        <Text>{t('access-management.principals.modal-remove-description-2')}</Text>
      </TextContent>
    </Modal>
  );
};

export { RemovePrincipal };
