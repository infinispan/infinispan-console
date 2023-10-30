import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  EmptyStateVariant, Label, LabelGroup,
  Pagination,
  SearchInput,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarItemVariant
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { DatabaseIcon, SearchIcon } from '@patternfly/react-icons';
import { useFetchAvailablePrincipals } from '@app/services/principalsHook';
import { global_spacer_sm, global_spacer_xl } from '@patternfly/react-tokens';
import { TableErrorState } from '@app/Common/TableErrorState';
import { TableLoadingState } from '@app/Common/TableLoadingState';

const PrincipalTableDisplay = () => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { principals, setLoading, loading, error } = useFetchAvailablePrincipals();
  const [searchValue, setSearchValue] = useState<string>('');
  const [principalsPagination, setPrincipalsPagination] = useState({
    page: 1,
    perPage: 10
  });

  const [filteredPrincipals, setFilteredPrincipals] = useState<Principal[]>([]);
  const [principalsRows, setPrincipalsRows] = useState<Principal[]>([]);

  useEffect(() => {
    if (searchValue.trim() !== '') {
      setFilteredPrincipals(principals.filter((role) => role.name.toLowerCase().includes(searchValue.toLowerCase())));
    } else {
      setFilteredPrincipals(principals);
    }
    setPrincipalsPagination({
      ...principalsPagination,
      page: 1
    });
  }, [principals, searchValue]);

  useEffect(() => {
    const initSlice = (principalsPagination.page - 1) * principalsPagination.perPage;
    setPrincipalsRows(filteredPrincipals.slice(initSlice, initSlice + principalsPagination.perPage));
  }, [filteredPrincipals, principalsPagination]);

  const columnNames = {
    name: t('access-management.principals.principal-name'),
    roles: t('access-management.principals.roles'),
  };

  const onSetPage = (_event, pageNumber) => {
    setPrincipalsPagination({
      ...principalsPagination,
      page: pageNumber
    });
  };

  const onPerPageSelect = (_event, perPage) => {
    setPrincipalsPagination({
      page: 1,
      perPage: perPage
    });
  };

  const onSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const pagination = (
    <Pagination
      itemCount={filteredPrincipals.length}
      perPage={principalsPagination.perPage}
      page={principalsPagination.page}
      onSetPage={onSetPage}
      widgetId="pagination-principals"
      onPerPageSelect={onPerPageSelect}
      isCompact
    />
  );

  const displayRowsPrincipals = () => {
    return (
      <React.Fragment>
        {principalsRows.map((row) => (
          <Tr key={row.name}>
            <Td dataLabel={columnNames.name} width={15}>
                {row.name}
            </Td>
            <Td dataLabel={columnNames.roles} width={30}>
              {
                <LabelGroup>
                  {row.roles.map((currentRole) => (
                    <Label key={currentRole}
                           render={({ className, content, componentRef }) => (
                             <Link
                               data-cy={`detailLink-${currentRole}`}
                               key={currentRole}
                               to={{ pathname: '/access-management/role/' + encodeURIComponent(currentRole), search: location.search }}
                             >
                               {content}
                             </Link>
                           )}
                    >
                      {currentRole}
                    </Label>
                  ))}
                </LabelGroup>
              }
            </Td>
          </Tr>
        ))}
      </React.Fragment>
    );
  };

  const displayEmptySearch = () => {
    return (
      <Tr>
        <Td colSpan={2}>
          <Bullseye>
            <EmptyState variant={EmptyStateVariant.sm}>
              <EmptyStateIcon icon={SearchIcon} />
              <Title headingLevel="h2" size="lg">
                {t('access-management.principals.no-principals-found')}
              </Title>
              <EmptyStateBody>
                {principals.length == 0
                  ? t('access-management.principals.no-principals-body', { brandname: brandname })
                  : t('access-management.principals.no-filtered-principals-body')}
              </EmptyStateBody>
            </EmptyState>
          </Bullseye>
        </Td>
      </Tr>
    );
  };

  const createPrincipalButtonHelper = (isEmptyPage?: boolean) => {
    const emptyPageButtonProp = { style: { marginTop: global_spacer_xl.value } };
    const normalPageButtonProps = { style: { marginLeft: global_spacer_sm.value } };
    return (
      <Button
        variant={ButtonVariant.primary}
        aria-label="grant-access-principal-button-helper"
        data-cy="grantAccessPrincipalButton"
        {...(isEmptyPage ? emptyPageButtonProp : normalPageButtonProps)}
      >
        {t('access-management.principals.grant-access')}
      </Button>
    );
  };

  const displayContent = () => {
    if (principals.length === 0) {
      return (
        <EmptyState variant={EmptyStateVariant.lg}>
          <EmptyStateHeader
            titleText={t('access-management.principals.no-principals-status')}
            icon={<EmptyStateIcon icon={DatabaseIcon} />}
            headingLevel="h4"
          />
          <EmptyStateBody>{t('access-management.principals.no-principals-body', { brandname: brandname })}</EmptyStateBody>
          {/*<EmptyStateFooter>{createPrincipalButtonHelper(true)}</EmptyStateFooter>*/}
        </EmptyState>
      );
    }

    if (loading) {
      return <TableLoadingState message={t('access-management.principals.loading-principals')} />;
    }

    if (error) {
      return <TableErrorState error={t('access-management.principals.loading-principals-error')} />;
    }

    return (
      <React.Fragment>
        <Toolbar id="principal-table-toolbar" className={'principal-table-display'}>
          <ToolbarContent>
            <ToolbarGroup variant="filter-group">
              <ToolbarItem variant={'search-filter'}>
                <SearchInput
                  placeholder={t('access-management.principals.search-placeholder')}
                  value={searchValue}
                  onChange={(_event, value) => onSearchChange(value)}
                  onSearch={(_event, value) => onSearchChange(value)}
                  onClear={() => setSearchValue('')}
                />
              </ToolbarItem>
              {/*<ToolbarItem>{createPrincipalButtonHelper(false)}</ToolbarItem>*/}
            </ToolbarGroup>
            <ToolbarItem variant={ToolbarItemVariant.pagination}>{pagination}</ToolbarItem>
          </ToolbarContent>
        </Toolbar>
        <Table className={'principals-table'} aria-label={'principals-table-label'} variant={'compact'}>
          <Thead noWrap>
            <Tr>
              <Th
                info={{
                  popover: <div>{t('access-management.principals.principal-name-tooltip')}</div>,
                  ariaLabel: 'Principal name more information',
                  popoverProps: {
                    headerContent: columnNames.name,
                    footerContent: (
                      <a target="_blank" rel="noreferrer" href={t('brandname.principals-docs-link')}>
                        {t('access-management.principals.principals-hint-link', { brandname: brandname })}
                      </a>
                    )
                  }
                }}
              >
                {columnNames.name}
              </Th>
              <Th>{columnNames.roles}</Th>
            </Tr>
          </Thead>
          <Tbody>{principalsRows.length == 0 ? displayEmptySearch() : displayRowsPrincipals()}</Tbody>
        </Table>
        <Toolbar id="principal-table-toolbar" className={'principal-table-display'}>
          <ToolbarItem variant={ToolbarItemVariant.pagination}>{pagination}</ToolbarItem>
        </Toolbar>
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      {displayContent()}
    </React.Fragment>
  );
};

export { PrincipalTableDisplay };
