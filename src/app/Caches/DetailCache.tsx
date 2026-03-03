import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import {
  Button,
  ButtonVariant,
  Content,
  ContentVariants,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
  Flex,
  FlexItem,
  Label,
  LabelGroup,
  MenuToggle,
  MenuToggleElement,
  PageSection,
  Spinner,
  Tab,
  Tabs,
  TabsComponent,
  TabTitleText,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import displayUtils from '@services/displayUtils';
import { CacheMetrics } from '@app/Caches/CacheMetrics';
import { CacheEntries } from '@app/Caches/Entries/CacheEntries';
import { CacheConfiguration } from '@app/Caches/Configuration/CacheConfiguration';
import { DataContainerBreadcrumb } from '@app/Common/DataContainerBreadcrumb';
import { t_global_background_color_100 } from '@patternfly/react-tokens';
import {
  ClusterIcon,
  CogIcon,
  DatabaseIcon,
  ExclamationCircleIcon,
  InfoCircleIcon,
  PencilAltIcon,
  RedoIcon,
  TrashIcon
} from '@patternfly/react-icons';
import { QueryEntries } from '@app/Caches/Query/QueryEntries';
import { Link } from 'react-router-dom';
import { useCacheDetail } from '@app/services/cachesHook';
import { ConsoleServices } from '@services/ConsoleServices';
import { ConsoleACL } from '@services/securityService';
import { useConnectedUser } from '@app/services/userManagementHook';
import { useTranslation } from 'react-i18next';
import { RebalancingCache } from '@app/Rebalancing/RebalancingCache';
import { DARK, ThemeContext } from '@app/providers/ThemeProvider';
import { useNavigate } from 'react-router';
import { TracingEnabled } from '@app/Common/TracingEnabled';
import { InfinispanComponentStatus } from '@app/Common/InfinispanComponentStatus';
import { PageHeader } from '@patternfly/react-component-groups';
import { UpdateAliasCache } from '@app/Caches/UpdateAliasCache';
import { DeleteCache } from '@app/Caches/DeleteCache';
import { QueryHistory } from '@app/Caches/Query/QueryHistory';

const DetailCache = (props: { cacheName: string }) => {
  const cacheName = props.cacheName;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const { connectedUser } = useConnectedUser();
  const { loading, error, cache, cacheManager, loadCache } = useCacheDetail();
  const [activeTabKey1, setActiveTabKey1] = useState<number | string>('');
  const [activeTabKey2, setActiveTabKey2] = useState<number | string>(10);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [cacheAction, setCacheAction] = useState<string>('');
  const isAdmin = ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser);
  const isCacheReader = ConsoleServices.security().hasCacheConsoleACL(ConsoleACL.READ, cacheName, connectedUser);

  useEffect(() => {
    loadCache(cacheName);
  }, []);

  useEffect(() => {
    if (activeTabKey1 != '' || !cache) {
      return;
    }

    if (cache.started && cache.editable && isCacheReader) {
      setActiveTabKey1(0);
    } else if (isAdmin) {
      setActiveTabKey1(1);
    } else {
      setActiveTabKey1(2);
    }
  }, [cache]);

  const openUpdateAliasesCacheModal = (cacheName: string) => {
    setCacheAction('aliases');
  };

  const buildEntriesTabContent = () => {
    if (cache.started && !isCacheReader) {
      return '';
    }

    if (!cache.queryable) {
      return <CacheEntries />;
    }

    return (
      <Tabs
        unmountOnExit
        isSubtab={true}
        activeKey={activeTabKey2}
        aria-label="Entries tab"
        component={TabsComponent.nav}
        style={theme === DARK ? {} : { backgroundColor: t_global_background_color_100.value }}
        onSelect={(event, tabIndex) => setActiveTabKey2(tabIndex)}
      >
        <Tab
          eventKey={10}
          title={<TabTitleText>{t('caches.tabs.entries-manage')}</TabTitleText>}
          data-cy="manageEntriesTab"
        >
          <CacheEntries />
        </Tab>
        <Tab eventKey={11} data-cy="queriesTab" title={<TabTitleText>{t('caches.tabs.query-values')}</TabTitleText>}>
          <QueryEntries cacheName={cacheName} changeTab={() => setActiveTabKey1(2)} />
        </Tab>
        <Tab
          eventKey={12}
          data-cy="queryHistoryTab"
          title={<TabTitleText>{t('caches.tabs.query-history')}</TabTitleText>}
        >
          <QueryHistory cacheName={cacheName} changeTab={() => setActiveTabKey1(3)} />
        </Tab>
      </Tabs>
    );
  };

  const entriesTabEnabled = (): boolean => {
    return cache.editable! && isCacheReader;
  };

  const buildDetailContent = () => {
    if (error.length > 0) {
      return (
        <EmptyState
          variant={EmptyStateVariant.sm}
          titleText={`An error occurred while retrieving cache ${cacheName}`}
          headingLevel="h2"
          status="danger"
          icon={ExclamationCircleIcon}
        >
          <EmptyStateBody>{error}</EmptyStateBody>
          <EmptyStateFooter>
            <EmptyStateActions>
              <Link
                to={{
                  pathname: '/',
                  search: location.search
                }}
              >
                <Button variant={ButtonVariant.secondary}>{t('common.actions.back')}</Button>
              </Link>
            </EmptyStateActions>
          </EmptyStateFooter>
        </EmptyState>
      );
    }

    if (loading || !cache) {
      return <Spinner size="xl" />;
    }

    if (activeTabKey1 == 0) {
      return buildEntriesTabContent();
    }

    if (activeTabKey1 == 1) {
      return (
        cache.configuration && (
          <CacheConfiguration
            cacheName={cache.name}
            editable={cache?.editable || true}
            config={cache.configuration.config}
          />
        )
      );
    }
    return <CacheMetrics cacheName={cacheName} display={activeTabKey1 == 2} />;

    return (
      <EmptyState variant={EmptyStateVariant.sm} titleText={`Empty ${cacheName}`} status="info" headingLevel="h2">
        <EmptyStateBody>{error}</EmptyStateBody>
        <EmptyStateFooter>
          <EmptyStateActions>
            <Link
              to={{
                pathname: '/',
                search: location.search
              }}
            >
              <Button variant={ButtonVariant.secondary}>{t('caches.actions.back')}</Button>
            </Link>
          </EmptyStateActions>
        </EmptyStateFooter>
      </EmptyState>
    );
  };

  const displayBackupsManagement = () => {
    return cache && cache?.features?.hasRemoteBackup && isAdmin;
  };

  const displayIndexManage = () => {
    return cache && cache?.features?.indexed;
  };

  const displayDelete = () => {
    return isAdmin && cache;
  };

  const displayEditConfigManage = () => {
    return isAdmin && cache;
  };

  const buildBackupsManage = () => {
    if (!displayBackupsManagement()) return;

    return (
      <DropdownItem
        value={'backupsManage'}
        key="manageBackupsLink"
        data-cy="manageBackupsLink"
        icon={<ClusterIcon />}
        onClick={(ev) =>
          navigate({
            pathname: '/cache/' + encodeURIComponent(cacheName) + '/backups',
            search: location.search
          })
        }
      >
        {t('caches.actions.action-manage-backups')}
      </DropdownItem>
    );
  };

  const buildDisplayReindexing = () => {
    if (!cache?.indexing_in_progress) {
      return;
    }

    return (
      <React.Fragment>
        <ToolbarItem>
          <Flex data-cy="rebuildingIndex">
            <FlexItem spacer={{ default: 'spacerXs' }}>
              <Spinner size={'sm'} isInline />
            </FlexItem>
            <FlexItem>
              <Content component={ContentVariants.p}>{t('caches.rebuilding-index')}</Content>
            </FlexItem>
          </Flex>
        </ToolbarItem>
        <ToolbarItem variant="separator"></ToolbarItem>
      </React.Fragment>
    );
  };

  const buildEditConfigManage = () => {
    if (!displayEditConfigManage()) return;
    return (
      <DropdownItem
        value={'cacheConfigEdition'}
        key="manageConfigEditionLink"
        data-cy="manageConfigEditionLink"
        icon={<PencilAltIcon />}
        onClick={(ev) =>
          navigate({
            pathname: '/cache/' + encodeURIComponent(cacheName) + '/configuration',
            search: location.search
          })
        }
      >
        {t('caches.actions.action-manage-config')}
      </DropdownItem>
    );
  };

  const buildIndexManage = () => {
    if (!displayIndexManage()) return;
    return (
      <DropdownItem
        value={'indexManage'}
        key="manageIndexesLink"
        data-cy="manageIndexesLink"
        icon={<DatabaseIcon />}
        onClick={(ev) =>
          navigate({
            pathname: '/cache/' + encodeURIComponent(cacheName) + '/indexing',
            search: location.search
          })
        }
      >
        {t('caches.actions.action-manage-indexes')}
      </DropdownItem>
    );
  };

  const buildDelete = () => {
    if (!displayDelete()) return;

    return (
      <DropdownItem
        value={'deleteCache'}
        key="manageDeleteLink"
        data-cy="manageDeleteLink"
        icon={<TrashIcon />}
        onClick={(ev) => {
          setIsOpenDelete(true);
          setIsOpen(false);
        }}
      >
        {t('caches.actions.action-delete')}
      </DropdownItem>
    );
  };

  const buildRefresh = () => {
    return (
      <React.Fragment>
        {(displayBackupsManagement() || displayIndexManage()) && <Divider component="li" />}
        <DropdownItem
          value={'refresh'}
          key="refreshAction"
          data-cy="refreshAction"
          onClick={() => loadCache(cacheName)}
          icon={<RedoIcon />}
        >
          {t('common.actions.refresh')}
        </DropdownItem>
      </React.Fragment>
    );
  };

  const buildFeaturesChip = () => {
    if (!cache || !cache.started) {
      return;
    }

    return (
      <Flex>
        {cache && (
          <FlexItem>
            <LabelGroup
              categoryName={
                cache.aliases && cache.aliases.length > 0 ? t('caches.info.aliases') : t('caches.info.no-alias')
              }
              addLabelControl={
                isAdmin ? (
                  <Label
                    data-cy="edit-alias-button"
                    isCompact
                    variant="overflow"
                    onClick={() => openUpdateAliasesCacheModal(cacheName)}
                  >
                    {t('caches.info.add-alias')}
                  </Label>
                ) : null
              }
            >
              {cache.aliases &&
                cache.aliases.map((feature) => (
                  <Label isCompact key={feature}>
                    {feature}
                  </Label>
                ))}
            </LabelGroup>
          </FlexItem>
        )}
        <FlexItem>
          <LabelGroup categoryName={t('caches.info.features')} numLabels={8}>
            <Label color={'blue'} isCompact key={cache.type} icon={<InfoCircleIcon />}>
              {cache.type}
            </Label>
            {cache.features &&
              displayUtils.createFeaturesChipGroup(cache.features).map((feature) => (
                <Label isCompact key={feature} icon={<InfoCircleIcon />}>
                  {feature}
                </Label>
              ))}
          </LabelGroup>
        </FlexItem>
      </Flex>
    );
  };

  const buildShowMorePanel = () => {
    if (loading || error !== '' || !cache || !cache.started) {
      return;
    }

    return (
      <Toolbar id="cache-header-actions">
        <ToolbarContent>
          {cacheManager.tracing_enabled && (
            <React.Fragment>
              <ToolbarItem>
                <TracingEnabled enabled={cache.tracing!} />
              </ToolbarItem>
              <ToolbarItem variant="separator"></ToolbarItem>
            </React.Fragment>
          )}
          {buildDisplayReindexing()}
          <ToolbarItem>
            <RebalancingCache />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
    );
  };

  const displayCacheEntries = () => {
    if (!entriesTabEnabled()) {
      return;
    }

    return (
      <Tab
        data-cy="cacheEntriesTab"
        eventKey={0}
        title={
          cache.size
            ? t('caches.tabs.entries-size', {
                size: displayUtils.formatNumber(cache?.size)
              })
            : t('caches.tabs.entries')
        }
      />
    );
  };

  const displayConfiguration = () => {
    if (!isAdmin) {
      // Only ADMIN can read the full configuration for security reasons
      return;
    }

    return <Tab data-cy="cacheConfigurationTab" eventKey={1} title={t('caches.tabs.configuration')} />;
  };

  const displayCacheStats = () => {
    if (!cache.stats) {
      return;
    }

    return (
      <Tab
        data-cy="cacheMetricsTab"
        eventKey={2}
        title={cache.stats?.enabled ? t('caches.tabs.metrics-enabled') : t('caches.tabs.metrics-disabled')}
      />
    );
  };

  const displayActions = (
    <ToolbarGroup align={{ default: 'alignEnd' }}>
      <ToolbarItem>
        <Dropdown
          popperProps={{ position: 'right' }}
          isOpen={isOpen}
          onSelect={() => setIsOpen(false)}
          onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle
              ref={toggleRef}
              data-cy="detailCacheActions"
              onClick={() => setIsOpen(!isOpen)}
              isExpanded={isOpen}
              icon={<CogIcon />}
            >
              {t('common.actions.actions')}
            </MenuToggle>
          )}
          ouiaId="detailCacheDropdown"
          shouldFocusToggleOnSelect
        >
          <DropdownList>
            {buildEditConfigManage()}
            {buildIndexManage()}
            {buildBackupsManage()}
            {buildRefresh()}
            {buildDelete()}
          </DropdownList>
        </Dropdown>
      </ToolbarItem>
    </ToolbarGroup>
  );

  const buildCacheHeader = () => {
    if (loading || !cache) {
      return <PageHeader title={cacheName} subtitle={t('common.loading')} />;
    }

    if (error != '') {
      return <PageHeader title={cacheName} subtitle={t('caches.info.error', { cacheName: cacheName })} />;
    }

    if (!cache.started) {
      // cache is not ok
      return (
        <PageHeader
          title={cache.name}
          subtitle={'cache detail'}
          actionMenu={displayActions}
          label={<InfinispanComponentStatus status={cache.health} name={cacheName} isLabel={true} />}
        />
      );
    }

    return <PageHeader title={cache.name} subtitle={''} actionMenu={displayActions} label={buildFeaturesChip()} />;
  };

  return (
    <React.Fragment>
      <DataContainerBreadcrumb currentPage={t('caches.info.breadcrumb', { cacheName: cacheName })} />
      {buildCacheHeader()}
      {/*The padding 0 here gains some pixels from the info panel to the header */}
      <PageSection style={{ paddingTop: 0 }}>
        {buildShowMorePanel()}
        {cache && cache.started && (
          <Tabs
            isBox={false}
            activeKey={activeTabKey1}
            component={TabsComponent.nav}
            onSelect={(event, tabIndex) => {
              setActiveTabKey1(tabIndex);
            }}
          >
            {displayCacheEntries()}
            {displayConfiguration()}
            {displayCacheStats()}
          </Tabs>
        )}
        {buildDetailContent()}
      </PageSection>
      <DeleteCache
        cacheName={cacheName}
        isModalOpen={isOpenDelete}
        closeModal={(deleteDone: boolean) => {
          if (deleteDone) {
            navigate({
              pathname: '/',
              search: location.search
            });
          } else {
            setIsOpenDelete(false);
          }
        }}
      />
      <UpdateAliasCache
        cacheName={cacheName}
        isModalOpen={cacheAction == 'aliases'}
        closeModal={() => {
          setCacheAction('');
          loadCache(cacheName);
        }}
      />
    </React.Fragment>
  );
};

export { DetailCache };
