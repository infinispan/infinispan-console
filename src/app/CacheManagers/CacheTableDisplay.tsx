import React, { useEffect, useState } from 'react';
import { cellWidth, Table, TableBody, TableHeader, TableVariant, textCenter } from '@patternfly/react-table';
import {
  Bullseye,
  Button,
  ButtonVariant,
  Chip,
  ChipGroup,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Label,
  LabelGroup,
  Pagination,
  Select,
  SelectGroup,
  SelectOption,
  SelectVariant,
  Text,
  TextContent,
  TextVariants,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarItemVariant
} from '@patternfly/react-core';
import displayUtils from '@services/displayUtils';
import { FilterIcon, SearchIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import { CacheTypeBadge } from '@app/Common/CacheTypeBadge';
import { DeleteCache } from '@app/Caches/DeleteCache';
import { IgnoreCache } from '@app/Caches/IgnoreCache';
import { SetAvailableCache } from '@app/Caches/SetAvailableCache';
import { IExtraData, IRowData } from '@patternfly/react-table/src/components/Table';
import { Health } from '@app/Common/Health';
import { useBanner } from '@app/utils/useApiAlert';
import { useCaches, useDataContainer } from '@app/services/dataContainerHooks';
import { useTranslation } from 'react-i18next';
import { useConnectedUser } from '@app/services/userManagementHook';
import { ConsoleServices } from '@services/ConsoleServices';
import { ConsoleACL } from '@services/securityService';
import { global_spacer_sm } from '@patternfly/react-tokens';
import { ComponentHealth } from '@services/infinispanRefData';

interface CacheAction {
  cacheName: string;
  action: '' | 'ignore' | 'undo' | 'delete' | 'available';
}

const CacheTableDisplay = (props: { cmName: string; setCachesCount: (count: number) => void; isVisible: boolean }) => {
  const { setBanner } = useBanner();
  const { connectedUser } = useConnectedUser();
  const { cm } = useDataContainer();
  const { caches, errorCaches, loadingCaches } = useCaches();
  const [filteredCaches, setFilteredCaches] = useState<CacheInfo[]>([]);
  const [cachesPagination, setCachesPagination] = useState({
    page: 1,
    perPage: 10
  });
  const [rows, setRows] = useState<any[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [chipsCacheFeature, setChipsCacheFeature] = useState<string[]>([]);
  const [chipsCacheType, setChipsCacheType] = useState<string[]>([]);
  const [chipsCacheStatus, setChipsCacheStatus] = useState<string[]>([]);
  const [isFilterSelectExpanded, setIsFilterSelectExpanded] = useState<boolean>(false);
  const [cacheAction, setCacheAction] = useState<CacheAction>({
    cacheName: '',
    action: ''
  });
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  // new caches or new filters
  useEffect(() => {
    if (loadingCaches) {
      return;
    }
    const failedCaches = caches.reduce((failedCaches: string, cacheInfo: CacheInfo) => {
      if (
        (cacheInfo.health as ComponentHealth) == ComponentHealth.FAILED ||
        (cacheInfo.health as ComponentHealth) == ComponentHealth.DEGRADED
      ) {
        return failedCaches == '' ? cacheInfo.name : failedCaches + ', ' + cacheInfo.name;
      } else {
        return failedCaches;
      }
    }, '');

    if (failedCaches.length > 0) {
      setBanner('[' + failedCaches + ']' + ' caches health is FAILED or DEGRADED');
    } else {
      setBanner('');
    }

    props.setCachesCount(caches.length);
    let newFilteredCaches: CacheInfo[] = caches;

    if (selectedFilters.length == 0) {
      // clear chips
      setChipsCacheStatus([]);
      setChipsCacheFeature([]);
      setChipsCacheType([]);
    } else {
      // From the select, extract each category
      let filterStatus = extract(selectedFilters, cacheStatus);
      let filterFeatures = extract(selectedFilters, cacheFeatures);
      let filterCacheType = extract(selectedFilters, cacheTypes);
      // Update chips
      setChipsCacheStatus(filterStatus);
      setChipsCacheFeature(filterFeatures);
      setChipsCacheType(filterCacheType);

      // Filter caches by status
      if (filterStatus.length > 0) {
        newFilteredCaches = newFilteredCaches.filter((cacheInfo) => isCacheStatus(cacheInfo, filterStatus));
      }

      // Filter caches by cache type
      if (filterCacheType.length > 0) {
        newFilteredCaches = newFilteredCaches.filter((cacheInfo) => isCacheType(cacheInfo, filterCacheType));
      }

      // Filter caches by features
      if (filterFeatures.length > 0) {
        newFilteredCaches = newFilteredCaches.filter((cacheInfo) => hasFeatures(cacheInfo, filterFeatures));
      }
    }

    // Set filtered caches
    setFilteredCaches(newFilteredCaches);
  }, [props.isVisible, loadingCaches, caches, selectedFilters]);

  // new filtered caches upgrades rows if needed
  useEffect(() => {
    let paginationUpgrade = false;
    // Upgrade Pagination in necessary
    if (cachesPagination.page > 1) {
      const completePagesNum = Math.floor(filteredCaches.length / cachesPagination.perPage);
      const lastPageCount = filteredCaches.length % cachesPagination.perPage;
      if (lastPageCount == 0 && cachesPagination.page > completePagesNum) {
        paginationUpgrade = true;
        setCachesPagination({
          page: completePagesNum,
          perPage: cachesPagination.perPage
        });
      }
    }

    if (!paginationUpgrade) {
      updateRows();
    }
  }, [filteredCaches]);

  // new pagination upgrades rows
  useEffect(() => {
    updateRows();
  }, [cachesPagination]);

  const columns = [
    { title: t('cache-managers.cache-name'), transforms: [cellWidth(25), textCenter] },
    {
      title: t('cache-managers.cache-mode'),
      transforms: [cellWidth(15), textCenter],
      cellTransforms: [textCenter]
    },
    {
      title: t('cache-managers.cache-health'),
      transforms: [cellWidth(10)]
    },
    {
      title: t('cache-managers.cache-features'),
      transforms: [textCenter, cellWidth(30)],
      cellTransforms: [textCenter]
    },
    {
      // Will display 'ignored' if the cache is ignored
      title: t('cache-managers.cache-status'),
      transforms: [textCenter],
      cellTransforms: [textCenter]
    }
  ];

  const actionResolver = (rowData: IRowData, extraData: IExtraData) => {
    // @ts-ignore
    let cacheName: string = rowData.cells[0].cacheName as string;

    if (!cacheName) {
      return [];
    }

    const isAdmin = ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser);
    const isCreator = ConsoleServices.security().hasConsoleACL(ConsoleACL.CREATE, connectedUser);

    // @ts-ignore
    const ignoredCache = rowData.cells[0].isIgnored;
    // @ts-ignore
    const health = rowData.cells[0].health;

    if ((!isAdmin && !isCreator) || (ignoredCache && !isAdmin)) {
      return [];
    }

    if (ignoredCache) {
      return [
        {
          'data-cy': 'showCacheAction',
          title: t('cache-managers.undo-ignore'),
          onClick: (event, rowId, rowData, extra) => openIgnoreCacheModal(cacheName, rowData.cells[0].isIgnored)
        }
      ];
    }

    let actions = [
      {
        'data-cy': 'deleteCacheAction',
        title: t('cache-managers.delete'),
        onClick: (event, rowId, rowData, extra) => {
          setCacheAction({
            cacheName: cacheName,
            action: 'delete'
          });
        }
      }
    ];

    if (isAdmin) {
      actions.push({
        'data-cy': 'ignoreCacheAction',
        title: t('cache-managers.ignore'),
        onClick: (event, rowId, rowData, extra) => openIgnoreCacheModal(cacheName, rowData.cells[0].isIgnored)
      });
    }

    if (isAdmin && health === 'DEGRADED') {
      actions.push({
        'data-cy': 'openAvailableCacheAction',
        title: t('cache-managers.available'),
        onClick: (event, rowId, rowData, extra) => openAvailableCacheModal(cacheName)
      });
    }
    return actions;
  };

  const isCacheIgnored = (cacheInfo: CacheInfo): boolean => {
    return cacheInfo.status == 'IGNORED';
  };

  const closeDeleteModal = (deleteDone: boolean) => {
    if (deleteDone) {
      setFilteredCaches(filteredCaches.filter((cacheInfo) => cacheInfo.name !== cacheAction.cacheName));
    }
    setCacheAction({ cacheName: '', action: '' });
  };

  const closeIgnoreModal = (ignoreDone: boolean) => {
    if (ignoreDone) {
    }
    setCacheAction({ cacheName: '', action: '' });
  };

  const closeAvailableModal = (ignoreDone: boolean) => {
    if (ignoreDone) {
    }
    setCacheAction({ cacheName: '', action: '' });
  };

  const openIgnoreCacheModal = (cacheName: string, ignored: boolean) => {
    setCacheAction({
      cacheName: cacheName,
      action: ignored ? 'undo' : 'ignore'
    });
  };

  const openAvailableCacheModal = (cacheName: string) => {
    setCacheAction({
      cacheName: cacheName,
      action: 'available'
    });
  };

  const updateRows = () => {
    const initSlice = (cachesPagination.page - 1) * cachesPagination.perPage;
    const currentPageCaches = filteredCaches.slice(initSlice, initSlice + cachesPagination.perPage);

    let currentRows: {
      heightAuto: boolean;
      cells: (string | any)[];
      disableActions: boolean;
    }[];

    if (currentPageCaches.length == 0 || loadingCaches || errorCaches != '') {
      currentRows = [
        {
          heightAuto: true,
          disableActions: true,
          cells: [
            {
              props: { colSpan: 5 },
              title: (
                <Bullseye>
                  <EmptyState variant={EmptyStateVariant.small}>
                    <EmptyStateIcon icon={SearchIcon} />
                    <Title headingLevel="h2" size="lg">
                      {t('cache-managers.no-caches-status')}
                    </Title>
                    <EmptyStateBody>{t('cache-managers.no-caches-body')}</EmptyStateBody>
                  </EmptyState>
                </Bullseye>
              )
            }
          ]
        }
      ];
    } else {
      currentRows = currentPageCaches.map((cacheInfo) => {
        return {
          heightAuto: true,
          disableActions: false,
          actionProps: { 'data-cy': `actions-${cacheInfo.name}` },
          cells: [
            {
              cacheName: cacheInfo.name,
              health: cacheInfo.health,
              isIgnored: isCacheIgnored(cacheInfo),
              title: displayCacheName(cacheInfo)
            },
            {
              title: <CacheTypeBadge cacheType={cacheInfo.type} small={true} cacheName={cacheInfo.name} />
            },
            {
              title: (
                <Health
                  health={cacheInfo.health}
                  displayIcon={ComponentHealth[cacheInfo.health] == ComponentHealth.FAILED}
                  cacheName={cacheInfo.name}
                />
              )
            },
            { title: displayCacheFeatures(cacheInfo) },
            { title: displayBadges(cacheInfo) }
          ]
        };
      });
    }
    setRows(currentRows);
  };

  const displayCacheFeatures = (cacheInfo: CacheInfo) => {
    return (
      <TextContent>
        <Text component={TextVariants.small} data-cy={`feature-${cacheInfo.name}`}>
          {displayUtils.createFeaturesString(cacheInfo.features)}
        </Text>
      </TextContent>
    );
  };

  const ignoreCacheBadge = (cacheInfo: CacheInfo) => {
    if (!isCacheIgnored(cacheInfo)) {
      return '';
    }
    return (
      <Label key={`ignore-${cacheInfo.name}`} data-cy={`ignoreBadge-${cacheInfo.name}`}>
        {t('cache-managers.ignored-status')}
      </Label>
    );
  };

  /**
   * Display the badge only of rebalancing is enabled at cluster level
   * and the cache has rebalancing disabled. Check cluster level since we
   * don't want to display a badge for all the caches
   *
   * @param cacheInfo
   */
  const rebalancingOffBadge = (cacheInfo: CacheInfo) => {
    if (!cm.rebalancing_enabled) {
      return '';
    }

    if (cacheInfo.rebalancing_enabled != undefined && cacheInfo.rebalancing_enabled) {
      return '';
    }

    return <Label key={`ignore-${cacheInfo.name}`}>{t('cache-managers.rebalancing.disabled-status')}</Label>;
  };

  const displayBadges = (cacheInfo: CacheInfo) => {
    const badgeIgnore = ignoreCacheBadge(cacheInfo);
    const badgeRebalancing = rebalancingOffBadge(cacheInfo);

    if (badgeIgnore == '' && badgeRebalancing == '') {
      return '';
    }

    return (
      <LabelGroup>
        {badgeIgnore}
        {badgeRebalancing}
      </LabelGroup>
    );
  };

  const displayCacheName = (cacheInfo: CacheInfo) => {
    let className = '';
    if (ComponentHealth[cacheInfo.health] == ComponentHealth.FAILED) {
      className = 'failed-link';
    }

    const disableCacheDetail =
      isCacheIgnored(cacheInfo) ||
      !ConsoleServices.security().hasCacheConsoleACL(ConsoleACL.MONITOR, cacheInfo.name, connectedUser);

    const cacheDetailAccess = (
      <Button
        data-cy={`detailButton-${cacheInfo.name}`}
        key={`detail-button-${cacheInfo.name}`}
        variant={ButtonVariant.link}
        isDisabled={disableCacheDetail}
        className={className}
      >
        {cacheInfo.name}
      </Button>
    );

    if (disableCacheDetail) {
      return cacheDetailAccess;
    }

    return (
      <Link
        data-cy={`detailLink-${cacheInfo.name}`}
        key={cacheInfo.name}
        to={{ pathname: '/cache/' + encodeURIComponent(cacheInfo.name), search: location.search }}
      >
        {cacheDetailAccess}
      </Link>
    );
  };

  const cacheTypes = ['Local', 'Replicated', 'Distributed', 'Invalidated'];
  const cacheFeatures = ['Bounded', 'Indexed', 'Persistence', 'Transactions', 'Authorization', 'Backups'];

  const cacheStatus = [t('cache-managers.ignored-status')];

  const extract = (actualSelection: string[], ref: string[]): string[] => {
    return actualSelection.filter((s) => ref.includes(s));
  };

  const isCacheStatus = (cacheInfo: CacheInfo, actualSelection: string[]): boolean => {
    if (actualSelection.includes('Hidden') && isCacheIgnored(cacheInfo)) return true;
    else return false;
  };

  const isCacheType = (cacheInfo: CacheInfo, actualSelection: string[]): boolean => {
    return actualSelection.includes(cacheInfo.type);
  };

  const hasFeatures = (cacheInfo: CacheInfo, actualSelection: string[]): boolean => {
    if (actualSelection.includes('Transactions') && cacheInfo.features.transactional) {
      return true;
    }
    if (actualSelection.includes('Bounded') && cacheInfo.features.bounded) {
      return true;
    }

    if (actualSelection.includes('Indexed') && cacheInfo.features.indexed) {
      return true;
    }

    if (actualSelection.includes('Persistence') && cacheInfo.features.persistent) {
      return true;
    }

    if (actualSelection.includes('Authorization') && cacheInfo.features.secured) {
      return true;
    }
    if (actualSelection.includes('Backups') && cacheInfo.features.hasRemoteBackup) {
      return true;
    }
    return false;
  };

  const onDeleteChip = (chip) => {
    let actualSelection = selectedFilters.filter((item) => item !== chip);
    setSelectedFilters(actualSelection);
  };

  const onSelectFilter = (event, selection) => {
    let actualSelection;

    if (selectedFilters.includes(selection)) {
      actualSelection = selectedFilters.filter((item) => item !== selection);
    } else {
      actualSelection = [...selectedFilters, selection];
    }
    setSelectedFilters(actualSelection);
  };

  const onDeleteAllFilters = () => {
    setChipsCacheFeature([]);
    setChipsCacheType([]);
    setChipsCacheStatus([]);
    setSelectedFilters([]);
  };

  const buildCreateCacheButton = () => {
    if (!ConsoleServices.security().hasConsoleACL(ConsoleACL.CREATE, connectedUser)) {
      return <ToolbarItem />;
    }
    return (
      <React.Fragment>
        <ToolbarItem variant={ToolbarItemVariant.separator}></ToolbarItem>
        <ToolbarItem style={{ marginRight: global_spacer_sm.value }}>
          <Link
            to={{
              pathname: '/container/caches/create',
              search: location.search
            }}
          >
            <Button variant={ButtonVariant.primary} aria-label="create-cache-button" data-cy="createCacheButton">
              {t('cache-managers.create-cache-button')}
            </Button>
          </Link>
        </ToolbarItem>
      </React.Fragment>
    );
  };

  const buildViewConfigurationsButton = () => {
    return (
      <Link
        to={{
          pathname: '/container/' + props.cmName + '/configurations/',
          search: location.search,
          state: {
            cmName: props.cmName
          }
        }}
      >
        <Button variant={'link'} aria-label="view-cache-configurations-button" data-cy="showTemplatesButton">
          {t('cache-managers.config-templates-button')}
        </Button>
      </Link>
    );
  };

  const buildFilter = () => {
    return (
      <ToolbarGroup variant="filter-group">
        <ToolbarItem style={{ width: 250 }} data-cy="cacheFilterSelect">
          <Select
            variant={SelectVariant.checkbox}
            aria-label={t('cache-managers.cache-filter-label')}
            onToggle={setIsFilterSelectExpanded}
            onSelect={onSelectFilter}
            selections={selectedFilters}
            isOpen={isFilterSelectExpanded}
            toggleIcon={<FilterIcon />}
            maxHeight={200}
            placeholderText={t('cache-managers.cache-filter-label')}
            isGrouped={true}
            data-cy="cacheFilterSelectExpanded"
          >
            <SelectGroup label={t('cache-managers.cache-filter-type-label')} key="group1">
              <SelectOption key={0} value={t('cache-managers.mode-local')} />
              <SelectOption key={1} value={t('cache-managers.mode-repl')} />
              <SelectOption key={2} value={t('cache-managers.mode-dist')} />
              <SelectOption key={3} value={t('cache-managers.mode-invalid')} />
            </SelectGroup>
            <SelectGroup label={t('cache-managers.cache-filter-feature-label')} key="group2">
              <SelectOption key={5} value={t('cache-managers.cache-filter-feature-bounded')} />
              <SelectOption key={6} value={t('cache-managers.cache-filter-feature-indexed')} />
              <SelectOption key={7} value={t('cache-managers.cache-filter-feature-persistent')} />
              <SelectOption key={8} value={t('cache-managers.cache-filter-feature-trans')} />
              <SelectOption key={9} value={t('cache-managers.cache-filter-feature-secure')} />
              <SelectOption key={10} value={t('cache-managers.cache-filter-feature-xsite')} />
              <SelectOption key={11} value={t('cache-managers.cache-filter-feature-ignored')} />
            </SelectGroup>
          </Select>
        </ToolbarItem>
      </ToolbarGroup>
    );
  };

  const buildPagination = () => {
    return (
      <Pagination
        data-cy="paginationArea"
        itemCount={filteredCaches.length}
        perPage={cachesPagination.perPage}
        page={cachesPagination.page}
        onSetPage={(_event, pageNumber) =>
          setCachesPagination({
            page: pageNumber,
            perPage: cachesPagination.perPage
          })
        }
        widgetId="pagination-caches"
        onPerPageSelect={(_event, perPage) =>
          setCachesPagination({
            page: 1,
            perPage: perPage
          })
        }
        isCompact
      />
    );
  };

  const displayClearAll = () => {
    if (chipsCacheFeature.length == 0 && chipsCacheType.length == 0) {
      return '';
    }

    return (
      <Button variant={ButtonVariant.link} isInline onClick={onDeleteAllFilters} data-cy="clearAllButton">
        {t('cache-managers.clear-all-button')}
      </Button>
    );
  };

  if (!props.isVisible) {
    return <span />;
  }

  return (
    <React.Fragment>
      <Toolbar id="cache-table-toolbar">
        <ToolbarContent>
          <ToolbarItem variant={ToolbarItemVariant['search-filter']}>{buildFilter()}</ToolbarItem>
          {buildCreateCacheButton()}
          <ToolbarItem>{buildViewConfigurationsButton()}</ToolbarItem>
          <ToolbarItem variant={ToolbarItemVariant.pagination}>{buildPagination()}</ToolbarItem>
        </ToolbarContent>
        <ToolbarContent>
          <ToolbarItem variant={ToolbarItemVariant['chip-group']}>
            <ChipGroup key="chips-types" categoryName="Cache Type">
              {chipsCacheType.map((chip) => (
                <Chip key={'chip-' + chip} onClick={() => onDeleteChip(chip)}>
                  {chip}
                </Chip>
              ))}
            </ChipGroup>
            <ChipGroup key="chips-features" categoryName="Features">
              {chipsCacheFeature.map((chip) => (
                <Chip key={'chip-' + chip} onClick={() => onDeleteChip(chip)}>
                  {chip}
                </Chip>
              ))}
            </ChipGroup>
            <ChipGroup key="chip-status" categoryName="Status">
              {chipsCacheStatus.map((chip) => (
                <Chip key={'chip-' + chip} onClick={() => onDeleteChip(chip)}>
                  {chip}
                </Chip>
              ))}
            </ChipGroup>
          </ToolbarItem>
          <ToolbarItem>{displayClearAll()}</ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Table
        aria-label={t('cache-managers.cache-table-label')}
        cells={columns}
        rows={rows}
        className={'caches-table'}
        actionResolver={actionResolver}
        variant={TableVariant.compact}
        data-cy="cachesTable"
      >
        <TableHeader />
        <TableBody />
      </Table>
      <DeleteCache
        cacheName={cacheAction.cacheName}
        isModalOpen={cacheAction.action == 'delete'}
        closeModal={closeDeleteModal}
      />
      <IgnoreCache
        cmName={props.cmName}
        cacheName={cacheAction.cacheName}
        isModalOpen={cacheAction.action == 'ignore' || cacheAction.action == 'undo'}
        action={cacheAction.action}
        closeModal={closeIgnoreModal}
      />
      <SetAvailableCache
        cacheName={cacheAction.cacheName}
        isModalOpen={cacheAction.action == 'available'}
        closeModal={closeAvailableModal}
      />
    </React.Fragment>
  );
};

export { CacheTableDisplay };
