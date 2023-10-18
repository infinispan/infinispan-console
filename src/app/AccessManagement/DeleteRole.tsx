import React from 'react';
import { Button, ButtonVariant, Modal, Text, TextContent } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useDeleteRole } from '@app/services/rolesHook';

const DeleteRole = (props: { name: string; isModalOpen: boolean; submitModal: () => void; closeModal: () => void }) => {
  const { t } = useTranslation();
  const { onDeleteRole } = useDeleteRole(props.name, props.submitModal);
  const brandname = t('brandname.brandname');

  return (
    <Modal
      titleIconVariant={'danger'}
      id={'delete-role-modal'}
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={t('access-management.roles.modal-delete-title', { name: props.name })}
      onClose={props.closeModal}
      aria-label="modal-role-delete"
      disableFocusTrap={true}
      actions={[
        <Button
          key={'Delete'}
          aria-label={'Delete'}
          variant={ButtonVariant.danger}
          onClick={() => {
            onDeleteRole();
          }}
        >
          {t('access-management.roles.delete-action')}
        </Button>,
        <Button
          key={'Cancel'}
          aria-label={'Cancel'}
          variant={ButtonVariant.link}
          onClick={props.closeModal}
          data-cy="cancelRoleDeleteButton"
        >
          {t('access-management.roles.modal-cancel-button')}
        </Button>
      ]}
    >
      <TextContent>
        <Text>
          {t('access-management.roles.modal-delete-description-1', { name: props.name, brandname: brandname })}
        </Text>
        <Text>{t('access-management.roles.modal-delete-description-2')}</Text>
      </TextContent>
    </Modal>
  );
};

export { DeleteRole };
