import React, { useEffect, useState } from 'react';
import {
  Button,
  ButtonVariant,
  Chip,
  ChipGroup,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  MenuToggle,
  MenuToggleElement,
  Modal,
  ModalVariant,
  Select,
  SelectList,
  SelectOption,
  SelectOptionProps,
  TextInput,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import formUtils, { IField } from '@services/formUtils';
import { AddCircleOIcon, ExclamationCircleIcon, TimesIcon } from '@patternfly/react-icons';
import { useCreateRole, useFetchAvailableRoles } from '@app/services/rolesHook';

const CreateRole = (props: { isModalOpen: boolean; submitModal: () => void; closeModal: () => void }) => {
  const { t } = useTranslation();
  const { roles } = useFetchAvailableRoles();
  const brandname = t('brandname.brandname');
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
  const [focusedItemIndex, setFocusedItemIndex] = React.useState<number | null>(null);
  const [isOpenPermissions, setIsOpenPermissions] = useState(false);
  const [inputValue, setInputValue] = React.useState<string>('');
  const [selectOptions, setSelectOptions] = React.useState<SelectOptionProps[]>(initialSelectOptions);
  const [activeItem, setActiveItem] = React.useState<string | null>(null);
  const textInputRef = React.useRef<HTMLInputElement>();
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

  const handlePermissionsToggle = () => {
    setIsOpenPermissions(!isOpenPermissions);
  };

  useEffect(() => {
    let newSelectOptions: SelectOptionProps[] = initialSelectOptions;

    // Filter menu items based on the text input value when one exists
    if (inputValue) {
      newSelectOptions = initialSelectOptions.filter((menuItem) =>
        String(menuItem.children).toLowerCase().includes(inputValue.toLowerCase())
      );

      // When no options are found after filtering, display 'No results found'
      if (!newSelectOptions.length) {
        newSelectOptions = [
          { isDisabled: false, children: `No results found for "${inputValue}"`, value: 'no results' }
        ];
      }

      // Open the menu when the input value changes and the new value is not empty
      if (!isOpenPermissions) {
        setIsOpenPermissions(true);
      }
    }

    setSelectOptions(newSelectOptions);
    setFocusedItemIndex(null);
    setActiveItem(null);
  }, [inputValue]);

  const onTextInputChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    setInputValue(value);
  };

  const onSelectPermission = (value: string) => {
    if (value && value !== 'no results') {
      setSelectedPermissions(
        selectedPermissions.includes(value)
          ? selectedPermissions.filter((selection) => selection !== value)
          : [...selectedPermissions, value]
      );
    }

    textInputRef.current?.focus();
  };

  const onToggleClick = () => {
    setIsOpenPermissions(!isOpenPermissions);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      variant="typeahead"
      onClick={onToggleClick}
      innerRef={toggleRef}
      isExpanded={isOpenPermissions}
      isFullWidth
      data-cy="dropdown-button-permissions"
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={inputValue}
          onClick={onToggleClick}
          onChange={onTextInputChange}
          id="multi-typeahead-permissions-input"
          autoComplete="off"
          innerRef={textInputRef}
          placeholder={t('access-management.roles.modal-permissions-list-placeholder')}
          {...(activeItem && { 'aria-activedescendant': activeItem })}
          role="combobox"
          isExpanded={isOpenPermissions}
          aria-controls="select-multi-typeahead-permissions"
        >
          <ChipGroup aria-label="Current permissions">
            {selectedPermissions.map((selection, index) => (
              <Chip
                key={index}
                onClick={(ev) => {
                  ev.stopPropagation();
                  onSelectPermission(selection);
                }}
              >
                {selection}
              </Chip>
            ))}
          </ChipGroup>
        </TextInputGroupMain>
        <TextInputGroupUtilities>
          {selectedPermissions.length > 0 && (
            <Button
              variant="plain"
              onClick={() => {
                setInputValue('');
                setSelectedPermissions([]);
                textInputRef?.current?.focus();
              }}
              aria-label="Clear input value"
            >
              <TimesIcon aria-hidden />
            </Button>
          )}
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );

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
          <Select
            isScrollable
            isOpen={isOpenPermissions}
            selected={selectedPermissions}
            onSelect={(ev, selection) => onSelectPermission(selection as string)}
            onOpenChange={() => setIsOpenPermissions(false)}
            onClick={handlePermissionsToggle}
            aria-labelledby="role-permissions"
            aria-label="role-permissions-select"
            toggle={toggle}
          >
            <SelectList isAriaMultiselectable id="select-multi-typeahead-listbox">
              {initialSelectOptions.map((option, index) => (
                <SelectOption
                  key={option.value || option.children}
                  isFocused={focusedItemIndex === index}
                  className={option.className}
                  id={`select-multi-typeahead-${option.value.replace(' ', '-')}`}
                  {...option}
                  hasCheckbox
                  isSelected={selectedPermissions.includes(option.value)}
                  description={option.description}
                  ref={null}
                />
              ))}
            </SelectList>
          </Select>
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
