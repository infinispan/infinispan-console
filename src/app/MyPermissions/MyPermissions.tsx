import React, { useState } from 'react';
import {
  Button,
  ButtonVariant,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Content,
  ContentVariants,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Label,
  LabelGroup,
  PageSection,
  Pagination,
  SearchInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { FilterIcon, UsersIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useConnectedUser } from '@app/hooks/userManagementHook';
import { ConsoleServices } from '@services/ConsoleServices';
import { ConsoleACL } from '@services/securityService';
import {
  MultiContentCard,
  PageHeader,
} from '@patternfly/react-component-groups';

type LabelColor = 'blue' | 'green' | 'grey' | 'orange' | 'purple';

const getAccessLevel = (
  acl: string[],
): { label: string; color: LabelColor } => {
  if (acl.includes('ALL') || acl.includes('ADMIN')) {
    return { label: 'FULL ACCESS', color: 'purple' };
  }
  if (
    acl.includes('WRITE') ||
    acl.includes('BULK_WRITE') ||
    acl.includes('ALL_WRITE') ||
    acl.includes('CREATE')
  ) {
    return { label: 'READ-WRITE', color: 'green' };
  }
  if (
    acl.includes('READ') ||
    acl.includes('BULK_READ') ||
    acl.includes('ALL_READ') ||
    acl.includes('LISTEN')
  ) {
    return { label: 'READ-ONLY', color: 'blue' };
  }
  return { label: 'NO PERMISSION', color: 'grey' };
};

const MyPermissions = () => {
  const { t } = useTranslation();
  const { connectedUser } = useConnectedUser();
  const [searchValue, setSearchValue] = useState('');
  const [pagination, setPagination] = useState({ page: 1, perPage: 10 });

  const acl = connectedUser.acl;
  const subjects = acl?.subjects || [];
  const globalPerms = acl?.global || [];
  const caches = acl?.caches || new Map<string, CacheAcl>();

  const isAdmin = ConsoleServices.security().hasConsoleACL(
    ConsoleACL.ADMIN,
    connectedUser,
  );

  // Check if all caches have identical permissions
  const cacheEntries = Array.from(caches.entries());
  const allCachesSamePerms =
    cacheEntries.length > 0 &&
    cacheEntries.every(
      ([, cache]) =>
        JSON.stringify([...cache.acl].sort()) ===
        JSON.stringify([...cacheEntries[0][1].acl].sort()),
    );

  // Filter caches by search
  const filteredCaches = cacheEntries.filter(([name]) =>
    name.toLowerCase().includes(searchValue.toLowerCase()),
  );

  const buildIdentityCard = () => {
    return (
      <Card isPlain isFullHeight>
        <CardTitle>
          {t('my-permissions.identity')}
          {!isAdmin && (
            <Label
              data-cy="limitedAccessLabel"
              color="teal"
              isCompact
              style={{ marginLeft: '0.5rem' }}
            >
              {t('my-permissions.limited-access')}
            </Label>
          )}
        </CardTitle>
        <CardBody>
          <DescriptionList isHorizontal isCompact>
            <DescriptionListGroup>
              <DescriptionListTerm>
                {t('my-permissions.username')}
              </DescriptionListTerm>
              <DescriptionListDescription data-cy="username">
                {connectedUser.name}
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm>
                {t('my-permissions.group-principals')}
              </DescriptionListTerm>
              <DescriptionListDescription data-cy="groupPrincipals">
                <LabelGroup>
                  {subjects
                    .filter((s) => s.type === 'GroupPrincipal')
                    .map((subject) => (
                      <Label
                        key={subject.name}
                        icon={<UsersIcon />}
                        color="blue"
                        isCompact
                      >
                        {subject.name}
                      </Label>
                    ))}
                </LabelGroup>
              </DescriptionListDescription>
            </DescriptionListGroup>
          </DescriptionList>
        </CardBody>
      </Card>
    );
  };

  const buildGlobalPermissionsCard = () => {
    return (
      <Card isPlain isFullHeight>
        <CardTitle>
          {t('my-permissions.global-permissions')}
          <Content
            component={ContentVariants.small}
            style={{ marginLeft: '0.5rem' }}
          >
            {t('my-permissions.permissions-count', {
              count: globalPerms.length,
            })}
          </Content>
        </CardTitle>
        <CardBody>
          <LabelGroup data-cy="globalPermissions" numLabels={15} isCompact>
            {globalPerms.map((perm) => (
              <Label key={perm} color="grey" isCompact>
                {perm}
              </Label>
            ))}
          </LabelGroup>
        </CardBody>
      </Card>
    );
  };

  const buildCachePermissionsCard = () => {
    const paginatedCaches = filteredCaches.slice(
      (pagination.page - 1) * pagination.perPage,
      pagination.page * pagination.perPage,
    );

    const toolbarPagination = (dropDirection: 'up' | 'down') => (
      <Pagination
        itemCount={filteredCaches.length}
        perPage={pagination.perPage}
        page={pagination.page}
        onSetPage={(_event, page) => setPagination({ ...pagination, page })}
        onPerPageSelect={(_event, perPage) =>
          setPagination({ page: 1, perPage })
        }
        isCompact
        dropDirection={dropDirection}
      />
    );

    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('my-permissions.cache-permissions')}</CardTitle>
        </CardHeader>
        <CardBody>
          {allCachesSamePerms && isAdmin && (
            <Content component={ContentVariants.p}>
              {t('my-permissions.full-access-all-caches')}
            </Content>
          )}
          <Toolbar id="cache-permissions-toolbar">
            <ToolbarContent>
              <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
                <ToolbarItem style={{ minWidth: '400px' }}>
                  <SearchInput
                    placeholder={t('my-permissions.filter-caches')}
                    value={searchValue}
                    onChange={(_event, value) => {
                      setSearchValue(value);
                      setPagination({ ...pagination, page: 1 });
                    }}
                    onClear={() => {
                      setSearchValue('');
                      setPagination({ ...pagination, page: 1 });
                    }}
                  />
                </ToolbarItem>
              </ToolbarToggleGroup>
              <ToolbarItem variant="pagination">
                {toolbarPagination('down')}
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
          <Table
            data-cy="cachePermissionsTable"
            aria-label={t('my-permissions.cache-permissions')}
            variant="compact"
          >
            <Thead>
              <Tr>
                <Th>{t('my-permissions.cache-name')}</Th>
                <Th>{t('my-permissions.access-level')}</Th>
                <Th>{t('my-permissions.permissions-label')}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {paginatedCaches.map(([name, cache]) => {
                const accessLevel = getAccessLevel(cache.acl);
                const isInternal = name.startsWith('___');
                return (
                  <Tr key={name}>
                    <Td dataLabel={t('my-permissions.cache-name')}>
                      {isInternal || accessLevel.label === 'NO PERMISSION' ? (
                        <>
                          {name}
                          {isInternal && (
                            <Label
                              status="info"
                              variant="outline"
                              isCompact
                              style={{ marginLeft: '0.5rem' }}
                            >
                              {t('my-permissions.internal')}
                            </Label>
                          )}
                        </>
                      ) : (
                        <Link to={'/cache/' + encodeURIComponent(name)}>
                          <Button
                            variant={ButtonVariant.link}
                            style={{ paddingLeft: 0 }}
                          >
                            {name}
                          </Button>
                        </Link>
                      )}
                    </Td>
                    <Td dataLabel={t('my-permissions.access-level')}>
                      <Label color={accessLevel.color} variant="outline">
                        {accessLevel.label}
                      </Label>
                    </Td>
                    <Td dataLabel={t('my-permissions.permissions-label')}>
                      <LabelGroup numLabels={6} isCompact>
                        {cache.acl.map((perm) => (
                          <Label key={perm} color="grey" isCompact>
                            {perm}
                          </Label>
                        ))}
                      </LabelGroup>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
          <Toolbar>
            <ToolbarContent>
              <ToolbarItem variant="pagination">
                {toolbarPagination('up')}
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
        </CardBody>
      </Card>
    );
  };

  return (
    <React.Fragment>
      <PageHeader
        title={t('my-permissions.title')}
        subtitle={t('my-permissions.subtitle')}
      />
      <PageSection>
        <MultiContentCard
          withDividers
          cards={[buildIdentityCard(), buildGlobalPermissionsCard()]}
        />
      </PageSection>
      <PageSection>{buildCachePermissionsCard()}</PageSection>
    </React.Fragment>
  );
};

export { MyPermissions };
