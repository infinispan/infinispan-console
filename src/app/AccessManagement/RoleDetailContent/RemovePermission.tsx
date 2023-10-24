import React from 'react';
import { Button, ButtonVariant, Modal, Text, TextContent } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useRemovePermission } from '@app/services/rolesHook';

const RemovePermission = (props: {
  name: string;
  remove: string;
  permissions: string[];
  isModalOpen: boolean;
  submitModal: () => void;
  closeModal: () => void;
}) => {
  const { t } = useTranslation();
  const { onRemovePermission } = useRemovePermission(props.name, props.remove, props.permissions, props.submitModal);

  return (
    <Modal
      titleIconVariant={'warning'}
      id={'delete-permission-modal'}
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={t('access-management.role.modal-remove-permission-title', { name: props.remove })}
      onClose={props.closeModal}
      aria-label="modal-role-delete"
      disableFocusTrap={true}
      actions={[
        <Button
          key={'Remove'}
          aria-label={'Remove'}
          variant={ButtonVariant.warning}
          onClick={() => {
            onRemovePermission();
          }}
        >
          {t('common.actions.remove')}
        </Button>,
        <Button
          key={'Cancel'}
          aria-label={'Cancel'}
          variant={ButtonVariant.link}
          onClick={props.closeModal}
          data-cy="cancelRemovePermissionButton"
        >
          {t('common.actions.cancel')}
        </Button>
      ]}
    >
      <TextContent>
        <Text>{t('access-management.role.modal-remove-permission-description-1', { roleName: props.name })}</Text>
        <Text>{t('access-management.role.modal-remove-permission-description-2')}</Text>
      </TextContent>
    </Modal>
  );
};

export { RemovePermission };
