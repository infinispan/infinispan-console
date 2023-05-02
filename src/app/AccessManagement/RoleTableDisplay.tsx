import React, { useEffect, useState } from 'react';
import {
  Bullseye,
  Chip,
  ChipGroup,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Icon,
  Pagination,
  SearchInput,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarFilter,
  ToolbarGroup,
  ToolbarItem,
  ToolbarItemVariant
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { LockIcon, SearchIcon } from '@patternfly/react-icons';
import { useFetchAvailableRoles } from '@app/services/rolesHook';
import { filterRoles } from '@app/utils/searchFilter';
import { RoleFilterOption } from '@services/infinispanRefData';

const RoleTableDisplay = () => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { roles, loading, error } = useFetchAvailableRoles();
  const [selectSearchOption, setSelectSearchOption] = useState<string>(RoleFilterOption.name);
  const [searchValue, setSearchValue] = useState<string>('');
  const [rolesPagination, setRolesPagination] = useState({
    page: 1,
    perPage: 10
  });

  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);

  useEffect(() => {
    if (searchValue !== '') {
      setFilteredRoles(filterRoles(searchValue, roles, selectSearchOption));
    } else {
      setFilteredRoles(roles);
    }
  }, [searchValue, roles]);

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

  const buildSearch = (
    <ToolbarGroup variant="filter-group">
      <ToolbarFilter categoryName={selectSearchOption}>
        <SearchInput
          placeholder={`Find by ${selectSearchOption}`}
          value={searchValue}
          onChange={(_event, value) => onSearchChange(value)}
          onSearch={(_event, value) => onSearchChange(value)}
          onClear={() => setSearchValue('')}
        />
      </ToolbarFilter>
    </ToolbarGroup>
  );

  return (
    <React.Fragment>
      <Toolbar id="role-table-toolbar" className={'role-table-display'}>
        <ToolbarContent>
          {buildSearch}
          <ToolbarItem variant={ToolbarItemVariant.pagination}>{pagination}</ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Table className={'roles-table'} aria-label={'roles-table-label'} variant={'compact'}>
        <Thead noWrap>
          <Tr>
            <Th info={{
              popover: (
                <div>
                  {t("access-management.roles.role-name-tooltip")}
                </div>
              ),
              ariaLabel: 'Role name more information',
              popoverProps: {
                headerContent: columnNames.name,
                footerContent: (
                    <a target="_blank" rel='noreferrer' href={t("brandname.default-roles-docs-link")}>
                      {t("access-management.roles.roles-hint-link", { brandname: brandname })}
                    </a>
                  )
              }
            }}>
              {columnNames.name}
            </Th>
            <Th>{columnNames.permissions}</Th>
            <Th>{columnNames.description}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredRoles.length == 0 ? (
            <Tr>
              <Td colSpan={3}>
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
          ) : (
            filteredRoles.map((row) => {
              return (
                <Tr key={row.name}>
                  <Td dataLabel={columnNames.name} width={15}>
                      { row.implicit &&
                          <Icon size="sm" isInline>
                            <LockIcon className="role-icon" />
                          </Icon>
                      }
                      {row.name}
                  </Td>
                  <Td dataLabel={columnNames.permissions} width={30}>{
                    <ChipGroup>
                      {row.permissions.map(currentChip => (
                        <Chip key={currentChip} isReadOnly={true}>
                          {currentChip}
                        </Chip>
                      ))}
                    </ChipGroup>
                  }</Td>
                  <Td dataLabel={columnNames.description}>{row.description}</Td>
                </Tr>
              );
            })
          )}
        </Tbody>
      </Table>
      <Toolbar id="role-table-toolbar" className={'role-table-display'}>
        <ToolbarItem variant={ToolbarItemVariant.pagination}>{pagination}</ToolbarItem>
      </Toolbar>
    </React.Fragment>
  );
};

export { RoleTableDisplay };
