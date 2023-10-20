import React, { useEffect, useState } from 'react';
import {
  Bullseye,
  Button,
  ButtonVariant,
  Chip,
  ChipGroup,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
  Icon,
  Pagination,
  SearchInput,
  Spinner,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarItemVariant
} from '@patternfly/react-core';
import { ActionsColumn, IAction, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { DatabaseIcon, LockIcon, SearchIcon } from '@patternfly/react-icons';
import { useFetchAvailableRoles } from '@app/services/rolesHook';
import { CreateRole } from '@app/AccessManagement/CreateRole';
import { global_spacer_sm, global_spacer_xl } from '@patternfly/react-tokens';
import { DeleteRole } from '@app/AccessManagement/DeleteRole';

const RoleTableDisplay = () => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { roles, setLoading, loading, error } = useFetchAvailableRoles();
  const [searchValue, setSearchValue] = useState<string>('');
  const [rolesPagination, setRolesPagination] = useState({
    page: 1,
    perPage: 10
  });

  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [rolesRows, setRolesRows] = useState<Role[]>([]);
  const [isCreateRole, setIsCreateRole] = useState(false);
  const [isDeleteRole, setIsDeleteRole] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState('');

  useEffect(() => {
    if (searchValue.trim() !== '') {
      setFilteredRoles(roles.filter((role) => role.name.toLowerCase().includes(searchValue.toLowerCase())));
    } else {
      setFilteredRoles(roles);
    }
    setRolesPagination({
      ...rolesPagination,
      page: 1
    });
  }, [roles, searchValue]);

  useEffect(() => {
    const initSlice = (rolesPagination.page - 1) * rolesPagination.perPage;
    setRolesRows(filteredRoles.slice(initSlice, initSlice + rolesPagination.perPage));
  }, [filteredRoles, rolesPagination]);

  const columnNames = {
    name: t('access-management.roles.role-name'),
    permissions: t('access-management.roles.permissions'),
    description: t('access-management.roles.role-description')
  };

  const onSetPage = (_event, pageNumber) => {
    setRolesPagination({
      ...rolesPagination,
      page: pageNumber
    });
  };

  const onPerPageSelect = (_event, perPage) => {
    setRolesPagination({
      page: 1,
      perPage: perPage
    });
  };

  const onSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const pagination = (
    <Pagination
      itemCount={roles.length}
      perPage={rolesPagination.perPage}
      page={rolesPagination.page}
      onSetPage={onSetPage}
      widgetId="pagination-roles"
      onPerPageSelect={onPerPageSelect}
      isCompact
    />
  );

  const rowActions = (row): IAction[] => [
    {
      'aria-label': 'deleteRole',
      title: t('access-management.roles.delete-action'),
      onClick: () => {
        setRoleToDelete(row.name);
      }
    }
  ];

  const displayRowsRoles = () => {
    return (
      <React.Fragment>
        {rolesRows.map((row) => (
          <Tr key={row.name}>
            <Td dataLabel={columnNames.name} width={15}>
              {row.implicit && (
                <Icon size="sm" isInline>
                  <LockIcon className="role-icon" />
                </Icon>
              )}
              {row.name}
            </Td>
            <Td dataLabel={columnNames.permissions} width={30}>
              {
                <ChipGroup>
                  {row.permissions.map((currentChip) => (
                    <Chip key={currentChip} isReadOnly={true}>
                      {currentChip}
                    </Chip>
                  ))}
                </ChipGroup>
              }
            </Td>
            <Td dataLabel={columnNames.description}>{row.description}</Td>
            <Td isActionCell aria-label={row.name + '-menu'}>
              {!row.implicit && <ActionsColumn items={rowActions(row)} />}
            </Td>
          </Tr>
        ))}
      </React.Fragment>
    );
  };

  const displayEmptySearch = () => {
    return (
      <Tr>
        <Td colSpan={4}>
          <Bullseye>
            <EmptyState variant={EmptyStateVariant.sm}>
              <EmptyStateIcon icon={SearchIcon} />
              <Title headingLevel="h2" size="lg">
                {t('access-management.roles.no-roles-found')}
              </Title>
              <EmptyStateBody>
                {roles.length == 0
                  ? t('access-management.roles.no-roles-body')
                  : t('access-management.roles.no-filtered-roles-body')}
              </EmptyStateBody>
            </EmptyState>
          </Bullseye>
        </Td>
      </Tr>
    );
  };
  const createRoleButtonHelper = (isEmptyPage?: boolean) => {
    const emptyPageButtonProp = { style: { marginTop: global_spacer_xl.value } };
    const normalPageButtonProps = { style: { marginLeft: global_spacer_sm.value } };
    return (
      <Button
        variant={ButtonVariant.primary}
        aria-label="create-role-button-helper"
        data-cy="createRoleButton"
        onClick={() => setIsCreateRole(true)}
        {...(isEmptyPage ? emptyPageButtonProp : normalPageButtonProps)}
      >
        {t('access-management.roles.modal-create-title')}
      </Button>
    );
  };

  if (loading) {
    return (
      <Bullseye>
        <EmptyState variant={EmptyStateVariant.sm}>
          <EmptyStateHeader
            titleText={<>{t('access-management.roles.loading-roles')}</>}
            icon={<EmptyStateIcon icon={Spinner} />}
            headingLevel="h4"
          />
        </EmptyState>
      </Bullseye>
    );
  }

  if (error) {
    return (
      <Bullseye>
        <EmptyState variant={EmptyStateVariant.sm}>
          <EmptyStateHeader
            titleText={<>{t('access-management.roles.loading-roles-error')}</>}
            icon={<EmptyStateIcon icon={Spinner} />}
            headingLevel="h4"
          />
        </EmptyState>
      </Bullseye>
    );
  }

  const displayContent = () => {
    if (roles.length === 0) {
      return (
        <EmptyState variant={EmptyStateVariant.lg}>
          <EmptyStateHeader
            titleText={t('access-management.roles.no-roles-status')}
            icon={<EmptyStateIcon icon={DatabaseIcon} />}
            headingLevel="h4"
          />
          <EmptyStateBody>{t('access-management.roles.no-roles-body', { brandname: brandname })}</EmptyStateBody>
          <EmptyStateFooter>{createRoleButtonHelper(true)}</EmptyStateFooter>
        </EmptyState>
      );
    }
    return (
      <React.Fragment>
        <Toolbar id="role-table-toolbar" className={'role-table-display'}>
          <ToolbarContent>
            <ToolbarGroup variant="filter-group">
              <ToolbarItem variant={'search-filter'}>
                <SearchInput
                  placeholder={t('access-management.roles.search-placeholder')}
                  value={searchValue}
                  onChange={(_event, value) => onSearchChange(value)}
                  onSearch={(_event, value) => onSearchChange(value)}
                  onClear={() => setSearchValue('')}
                />
              </ToolbarItem>
              <ToolbarItem>{createRoleButtonHelper(false)}</ToolbarItem>
            </ToolbarGroup>
            <ToolbarItem variant={ToolbarItemVariant.pagination}>{pagination}</ToolbarItem>
          </ToolbarContent>
        </Toolbar>
        <Table className={'roles-table'} aria-label={'roles-table-label'} variant={'compact'}>
          <Thead noWrap>
            <Tr>
              <Th
                info={{
                  popover: <div>{t('access-management.roles.role-name-tooltip')}</div>,
                  ariaLabel: 'Role name more information',
                  popoverProps: {
                    headerContent: columnNames.name,
                    footerContent: (
                      <a target="_blank" rel="noreferrer" href={t('brandname.default-roles-docs-link')}>
                        {t('access-management.roles.roles-hint-link', { brandname: brandname })}
                      </a>
                    )
                  }
                }}
              >
                {columnNames.name}
              </Th>
              <Th>{columnNames.permissions}</Th>
              <Th>{columnNames.description}</Th>
            </Tr>
          </Thead>
          <Tbody>{rolesRows.length == 0 ? displayEmptySearch() : displayRowsRoles()}</Tbody>
        </Table>
        <Toolbar id="role-table-toolbar" className={'role-table-display'}>
          <ToolbarItem variant={ToolbarItemVariant.pagination}>{pagination}</ToolbarItem>
        </Toolbar>
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      <DeleteRole
        name={roleToDelete}
        isModalOpen={roleToDelete !== ''}
        submitModal={() => {
          setRoleToDelete('');
          setLoading(true);
        }}
        closeModal={() => {
          setRoleToDelete('');
        }}
      />
      <CreateRole
        isModalOpen={isCreateRole}
        submitModal={() => {
          setIsCreateRole(false);
          setLoading(true);
        }}
        closeModal={() => setIsCreateRole(false)}
      />

      {displayContent()}
    </React.Fragment>
  );
};

export { RoleTableDisplay };
