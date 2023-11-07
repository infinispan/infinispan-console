import React, { useState } from 'react';
import {
  Button,
  ButtonVariant,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Modal,
  ModalVariant,
  SelectOptionProps,
  TextInput
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import formUtils, { IField } from '@services/formUtils';
import { AddCircleOIcon, ExclamationCircleIcon } from '@patternfly/react-icons';
import { useCreateRole, useFetchAvailableRoles } from '@app/services/rolesHook';
import { SelectMultiWithChips } from '@app/Common/SelectMultiWithChips';

const CreateRole = (props: { isModalOpen: boolean; submitModal: () => void; closeModal: () => void }) => {
  const { t } = useTranslation();
  const { roles } = useFetchAvailableRoles();
  const initialSelectOptions: SelectOptionProps[] = [
    { value: 'ALL', children: 'ALL', description: t('access-management.roles.permission-all') },
    { value: 'ADMIN', children: 'ADMIN', description: t('access-management.roles.permission-admin') },
    { value: 'ALL_READ', children: 'ALL_READ', description: t('access-management.roles.permission-all-read') },
    { value: 'READ', children: 'READ', description: t('access-management.roles.permission-read') },
    { value: 'BULK_READ', children: 'BULK_READ', description: t('access-management.roles.permission-bulk-read') },
    { value: 'ALL_WRITE', children: 'ALL_WRITE', description: t('access-management.roles.permission-all-write') },
    { value: 'WRITE', children: 'WRITE', description: t('access-management.roles.permission-write') },
    { value: 'BULK_WRITE', children: 'BULK_WRITE', description: t('access-management.roles.permission-bulk-write') },
    { value: 'MONITOR', children: 'MONITOR', description: t('access-management.roles.permission-monitor') },
    { value: 'CREATE', children: 'CREATE', description: t('access-management.roles.permission-create') },
    { value: 'EXEC', children: 'EXEC', description: t('access-management.roles.permission-exec') },
    { value: 'LISTEN', children: 'LISTEN', description: t('access-management.roles.permission-listen') },
    { value: 'LIFECYCLE', children: 'LIFECYCLE', description: t('access-management.roles.permission-lifecycle') },
    { value: 'NONE', children: 'NONE', description: t('access-management.roles.permission-none') }
  ];
  const roleNameInitialState: IField = {
    value: '',
    isValid: false,
    validated: 'default'
  };

  const roleDescriptionInitialState: IField = {
    value: '',
    isValid: false,
    validated: 'default'
  };

  const rolePermissionsInitialState: IField = {
    value: '',
    isValid: false,
    validated: 'default'
  };

  const [roleName, setRoleName] = useState<IField>(roleNameInitialState);
  const [roleDescription, setRoleDescription] = useState<IField>(roleDescriptionInitialState);
  const [rolePermissionsField, setRolePermissionsField] = useState<IField>(rolePermissionsInitialState);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const { onCreateRole } = useCreateRole(roleName.value, roleDescription.value, selectedPermissions, props.submitModal);

  const handleSubmit = () => {
    let isValid = true;
    // validates role name
    const trimmedRoleName = roleName.value.trim();
    if (trimmedRoleName.length == 0) {
      isValid = false;
      setRoleName({
        ...roleName,
        isValid: isValid,
        invalidText: t('access-management.roles.modal-role-name-is-required'),
        validated: 'error'
      });
    } else if (roles.filter((r) => r.name == trimmedRoleName).length > 0) {
      isValid = false;
      setRoleName({
        ...roleName,
        isValid: isValid,
        invalidText: t('access-management.roles.modal-role-exists', { name: trimmedRoleName }),
        validated: 'error'
      });
    }
    // validates permissions
    if (selectedPermissions.length == 0) {
      isValid = false;
      setRolePermissionsField({
        ...rolePermissionsField,
        isValid: isValid,
        invalidText: t('access-management.roles.modal-permissions-is-required'),
        validated: 'error'
      });
    }

    if (isValid) {
      onCreateRole();
      onCloseModal();
    }
  };

  const onCloseModal = () => {
    props.closeModal();
    setRoleName(roleNameInitialState);
    setRoleDescription(roleDescriptionInitialState);
    setSelectedPermissions([]);
  };

  const onSelectPermission = (value: string) => {
    if (value && value !== 'no results') {
      setSelectedPermissions(
        selectedPermissions.includes(value)
          ? selectedPermissions.filter((selection) => selection !== value)
          : [...selectedPermissions, value]
      );
    }
  };

  return (
    <Modal
      position={'top'}
      tabIndex={0}
      titleIconVariant={AddCircleOIcon}
      variant={ModalVariant.small}
      id={'create-role-modal'}
      className="pf-m-redhat-font"
      isOpen={props.isModalOpen}
      title={t('access-management.roles.modal-create-title')}
      onClose={onCloseModal}
      aria-label={'roles-modal-create-title'}
      disableFocusTrap={true}
      actions={[
        <Button key={'Create'} aria-label={'Create'} variant={ButtonVariant.primary} onClick={handleSubmit}>
          {t('access-management.roles.modal-save-action')}
        </Button>,
        <Button key={'Cancel'} aria-label={'Cancel'} variant={ButtonVariant.link} onClick={onCloseModal}>
          {t('access-management.roles.modal-cancel-button')}
        </Button>
      ]}
    >
      <Form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <FormGroup isRequired isInline label={t('access-management.roles.modal-role-name')}>
          <TextInput
            validated={roleName.validated}
            value={roleName.value}
            type="text"
            onChange={(_event, value) =>
              formUtils.validateRequiredField(value, t('access-management.roles.modal-role-name'), setRoleName)
            }
            aria-label="role-name-input"
          />
          {roleName.validated === 'error' && (
            <FormHelperText>
              <HelperText>
                <HelperTextItem variant={'error'} icon={<ExclamationCircleIcon />}>
                  {roleName.invalidText}
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          )}
        </FormGroup>
        <FormGroup isInline label={t('access-management.roles.modal-role-description')}>
          <TextInput
            validated={roleDescription.validated}
            value={roleDescription.value}
            type="text"
            onChange={(_event, value) =>
              formUtils.validateRequiredField(
                value,
                t('access-management.roles.modal-role-description'),
                setRoleDescription
              )
            }
            aria-label="role-description-input"
          />
          {roleDescription.validated === 'error' && (
            <FormHelperText>
              <HelperText>
                <HelperTextItem variant={'error'} icon={<ExclamationCircleIcon />}>
                  {roleDescription.invalidText}
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          )}
        </FormGroup>
        <FormGroup fieldId="permissions" isRequired isInline label={t('access-management.roles.modal-permissions')}>
          <SelectMultiWithChips
            id="permissions"
            placeholder={t('access-management.roles.modal-permissions-list-placeholder')}
            options={initialSelectOptions}
            selection={selectedPermissions}
            onSelect={onSelectPermission}
            onClear={() => setSelectedPermissions([])}
          />
          {rolePermissionsField.validated === 'error' && (
            <FormHelperText>
              <HelperText>
                <HelperTextItem variant={'error'} icon={<ExclamationCircleIcon />}>
                  {rolePermissionsField.invalidText}
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          )}
        </FormGroup>
      </Form>
    </Modal>
  );
};

export { CreateRole };
