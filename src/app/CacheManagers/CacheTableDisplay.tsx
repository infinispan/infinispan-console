import React, { useEffect, useState } from 'react';
import {
  cellWidth,
  Table,
  TableBody,
  TableHeader,
  TableVariant,
  textCenter,
} from '@patternfly/react-table';
import {
  Badge,
  Button,
  ButtonVariant,
  Chip,
  ChipGroup,
  Pagination,
  Select,
  SelectGroup,
  SelectOption,
  SelectVariant,
  Text,
  TextContent,
  TextVariants,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import displayUtils from '../../services/displayUtils';
import { FilterIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import dataContainerService from '../../services/dataContainerService';
import { CacheTypeBadge } from '@app/Common/CacheTypeBadge';
import { useApiAlert } from '@app/utils/useApiAlert';
import { DeleteCache } from '@app/CacheManagers/DeleteCache';
import { IgnoreCache } from '@app/CacheManagers/IgnoreCache';
import {
  IExtraData,
  IRowData,
} from '@patternfly/react-table/src/components/Table/Table';
import { ToolbarItemVariant } from '@patternfly/react-core/src/components/Toolbar/ToolbarItem';
import { TableEmptyState } from '@app/Common/TableEmptyState';
import { Health } from '@app/Common/Health';

interface IgnoreCache {
  cacheName: string;
  modalOpen: boolean;
  action: 'ignore' | 'undo';
}

const CacheTableDisplay = (props: {
  cmName: string;
  setCachesCount: (count: number) => void;
  isVisible: boolean;
}) => {
  const [caches, setCaches] = useState<CacheInfo[]>([]);
  const [filteredCaches, setFilteredCaches] = useState<CacheInfo[]>([]);
  const [cachesPagination, setCachesPagination] = useState({
    page: 1,
    perPage: 10,
  });
  const [rows, setRows] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [chipsCacheFeature, setChipsCacheFeature] = useState<string[]>([]);
  const [chipsCacheType, setChipsCacheType] = useState<string[]>([]);
  const [chipsCacheStatus, setChipsCacheStatus] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isDeleteCacheModalOpen, setDeleteCacheModalOpen] = useState(false);
  const [deleteCacheName, setDeleteCacheName] = useState<string>('');
  const [ignoreCache, setIgnoreCache] = useState<IgnoreCache>({
    cacheName: '',
    action: 'ignore',
    modalOpen: false,
  });
  const columns = [
    { title: 'Name', transforms: [cellWidth(30), textCenter] },
    {
      title: 'Type',
      transforms: [cellWidth(15), textCenter],
      cellTransforms: [textCenter],
    },
    {
      title: 'Health',
      transforms: [cellWidth(10)],
      cellTransforms: [],
    },
    {
      title: 'Features',
      transforms: [textCenter],
      cellTransforms: [textCenter],
    },
    {
      // Will display 'ignored' if the cache is ignored
      title: '',
      transforms: [cellWidth(15), textCenter],
      cellTransforms: [textCenter],
    },
  ];

  const actionResolver = (rowData: IRowData, extraData: IExtraData) => {
    if (rowData.size == 0) {
      return [];
    }

    // @ts-ignore
    if (rowData.cells[0].isIgnored) {
      return [
        {
          title: 'Undo ignore',
          onClick: (event, rowId, rowData, extra) =>
            openIgnoreCacheModal(
              rowData.cells[0].cacheName,
              rowData.cells[0].isIgnored
            ),
        },
      ];
    }

    return [
      {
        title: 'Ignore',
        onClick: (event, rowId, rowData, extra) =>
          openIgnoreCacheModal(
            rowData.cells[0].cacheName,
            rowData.cells[0].isIgnored
          ),
      },
      {
        title: 'Delete',
        onClick: (event, rowId, rowData, extra) =>
          openDeleteCacheModal(rowData.cells[0].cacheName),
      },
    ];
  };

  useEffect(() => {
    if (props.isVisible) {
      loadCaches();
    }
  }, [props.isVisible]);

  const isCacheIgnored = (cacheInfo: CacheInfo): boolean => {
    return cacheInfo.status == 'Ignored';
  };

  const closeDeleteModal = (deleteDone: boolean) => {
    if (deleteDone) {
      setFilteredCaches(
        filteredCaches.filter((cacheInfo) => cacheInfo.name !== deleteCacheName)
      );
      loadCaches();
    }
    setDeleteCacheName('');
    setDeleteCacheModalOpen(false);
  };

  const closeIgnoreModal = (ignoreDone: boolean) => {
    if (ignoreDone) {
      loadCaches();
    }
    setIgnoreCache({ cacheName: '', modalOpen: false, action: 'ignore' });
  };

  const openIgnoreCacheModal = (cacheName: string, ignored: boolean) => {
    setIgnoreCache({
      cacheName: cacheName,
      modalOpen: true,
      action: ignored ? 'undo' : 'ignore',
    });
  };

  const openDeleteCacheModal = (cacheName: string) => {
    setDeleteCacheModalOpen(true);
    setDeleteCacheName(cacheName);
  };

  const loadCaches = () => {
    dataContainerService.getCaches(props.cmName).then((eitherCaches) => {
      if (eitherCaches.isRight()) {
        setCaches(eitherCaches.value);
        setFilteredCaches(eitherCaches.value);
        props.setCachesCount(eitherCaches.value.length);
        const initSlice =
          (cachesPagination.page - 1) * cachesPagination.perPage;
        updateRows(
          eitherCaches.value.slice(
            initSlice,
            initSlice + cachesPagination.perPage
          ),
          false,
          ''
        );
      } else {
        updateRows([], false, eitherCaches.value.message);
      }
    });
  };

  const onSetPage = (_event, pageNumber) => {
    setCachesPagination({
      page: pageNumber,
      perPage: cachesPagination.perPage,
    });
    const initSlice = (pageNumber - 1) * cachesPagination.perPage;
    updateRows(
      filteredCaches.slice(initSlice, initSlice + cachesPagination.perPage),
      false,
      ''
    );
  };

  const onPerPageSelect = (_event, perPage) => {
    setCachesPagination({
      page: cachesPagination.page,
      perPage: perPage,
    });
    const initSlice = (cachesPagination.page - 1) * perPage;
    updateRows(filteredCaches.slice(initSlice, initSlice + perPage), false, '');
  };

  const updateRows = (caches: CacheInfo[], loading: boolean, error: string) => {
    let currentRows: {
      heightAuto: boolean;
      cells: (string | any)[];
      type: string;
      disableActions: boolean;
    }[];

    if (caches.length == 0) {
      currentRows = [
        {
          heightAuto: true,
          type: 'empty',
          disableActions: true,
          cells: [
            {
              props: { colSpan: 9 },
              title: (
                <TableEmptyState
                  loading={loading}
                  error={error}
                  empty={'Caches not found'}
                />
              ),
            },
          ],
        },
      ];
    } else {
      currentRows = caches.map((cacheInfo) => {
        return {
          heightAuto: true,
          type: '',
          disableActions: false,
          cells: [
            {
              cacheName: cacheInfo.name,
              isIgnored: isCacheIgnored(cacheInfo),
              title: displayCacheName(cacheInfo),
            },
            {
              title: <CacheTypeBadge cacheType={cacheInfo.type} small={true} />,
            },
            {
              title: (
                <Health
                  health={cacheInfo.health}
                  displayIcon={cacheInfo.health == 'FAILED'}
                />
              ),
            },
            { title: displayCacheFeatures(cacheInfo) },
            { title: displayIfIgnored(cacheInfo) },
          ],
        };
      });
    }
    setRows(currentRows);
  };

  const displayCacheFeatures = (cacheInfo: CacheInfo) => {
    return (
      <TextContent>
        <Text component={TextVariants.small}>
          {displayUtils.createFeaturesString(cacheInfo.features)}
        </Text>
      </TextContent>
    );
  };

  const displayIfIgnored = (cacheInfo: CacheInfo) => {
    if (!isCacheIgnored(cacheInfo)) {
      return '';
    }

    return (
      <Badge key={`ignore-${cacheInfo.name}`} isRead>
        {displayUtils.capitalize(cacheInfo.status)}
      </Badge>
    );
  };

  const displayCacheName = (cacheInfo: CacheInfo) => {
    let className = '';
    if (cacheInfo.health == 'FAILED') {
      className = 'failed-link';
    }

    const buttonName = (
      <Button
        key={`detail-button-${cacheInfo.name}`}
        variant={ButtonVariant.link}
        isDisabled={isCacheIgnored(cacheInfo)}
        className={className}
      >
        {cacheInfo.name}
      </Button>
    );

    if (isCacheIgnored(cacheInfo)) {
      return buttonName;
    }

    return (
      <Link
        key={cacheInfo.name}
        to={'/cache/' + encodeURIComponent(cacheInfo.name)}
      >
        {buttonName}
      </Link>
    );
  };

  const cacheTypes = [
    'Local',
    'Replicated',
    'Distributed',
    'Invalidated',
    'Scattered',
  ];
  const cacheFeatures = [
    'Bounded',
    'Indexed',
    'Persistent',
    'Transactional',
    'Secured',
    'Backups',
  ];

  const cacheStatus = ['Ignored'];

  const extract = (actualSelection: string[], ref: string[]): string[] => {
    return actualSelection.filter((s) => ref.includes(s));
  };

  const isCacheStatus = (
    cacheInfo: CacheInfo,
    actualSelection: string[]
  ): boolean => {
    return actualSelection.includes(cacheInfo.status);
  };

  const isCacheType = (
    cacheInfo: CacheInfo,
    actualSelection: string[]
  ): boolean => {
    return actualSelection.includes(cacheInfo.type);
  };

  const hasFeatures = (
    cacheInfo: CacheInfo,
    actualSelection: string[]
  ): boolean => {
    if (
      actualSelection.includes('Transactional') &&
      cacheInfo.features.transactional
    ) {
      return true;
    }
    if (actualSelection.includes('Bounded') && cacheInfo.features.bounded) {
      return true;
    }

    if (actualSelection.includes('Indexed') && cacheInfo.features.indexed) {
      return true;
    }

    if (
      actualSelection.includes('Persistent') &&
      cacheInfo.features.persistent
    ) {
      return true;
    }

    if (actualSelection.includes('Secured') && cacheInfo.features.secured) {
      return true;
    }
    if (
      actualSelection.includes('Backups') &&
      cacheInfo.features.hasRemoteBackup
    ) {
      return true;
    }
    return false;
  };

  const filterCaches = (actualSelection: string[]) => {
    let newFilteredCaches: CacheInfo[] = caches;

    if (actualSelection.length > 0) {
      let filterStatus = extract(actualSelection, cacheStatus);
      let filterFeatures = extract(actualSelection, cacheFeatures);
      let filterCacheType = extract(actualSelection, cacheTypes);

      if (filterStatus.length > 0) {
        newFilteredCaches = newFilteredCaches.filter((cacheInfo) =>
          isCacheStatus(cacheInfo, filterStatus)
        );
      }

      if (filterCacheType.length > 0) {
        newFilteredCaches = newFilteredCaches.filter((cacheInfo) =>
          isCacheType(cacheInfo, filterCacheType)
        );
      }

      if (filterFeatures.length > 0) {
        newFilteredCaches = newFilteredCaches.filter((cacheInfo) =>
          hasFeatures(cacheInfo, filterFeatures)
        );
      }
    }
    return newFilteredCaches;
  };

  const updateChips = (actualSelection: string[]) => {
    let filterFeatures = extract(actualSelection, cacheFeatures);
    let filterCacheType = extract(actualSelection, cacheTypes);
    let filterCacheStatus = extract(actualSelection, cacheStatus);
    setChipsCacheFeature(filterFeatures);
    setChipsCacheType(filterCacheType);
    setChipsCacheStatus(filterCacheStatus);
  };

  const deleteItem = (id) => {
    let actualSelection: string[] = selected.filter((item) => item !== id);
    let newFilteredCaches = filterCaches(actualSelection);
    updateChips(actualSelection);
    updateRows(newFilteredCaches, false, '');
    setSelected(actualSelection);
    setFilteredCaches(newFilteredCaches);
  };

  const onSelectFilter = (event, selection) => {
    let actualSelection: string[] = [];

    if (selected.includes(selection)) {
      actualSelection = selected.filter((item) => item !== selection);
    } else {
      actualSelection = [...selected, selection];
    }

    updateChips(actualSelection);
    let newFilteredCaches = filterCaches(actualSelection);

    updateRows(newFilteredCaches, false, '');
    setSelected(actualSelection);
    setFilteredCaches(newFilteredCaches);
  };

  const onToggleFilter = (isExpanded) => {
    setIsExpanded(isExpanded);
  };

  const onDeleteAllFilters = () => {
    setChipsCacheFeature([]);
    setChipsCacheType([]);
    setChipsCacheStatus([]);
    setSelected([]);
    updateRows(caches, false, '');
    setFilteredCaches(caches);
  };

  const buildCreateCacheButton = () => {
    return (
      <Link
        to={{
          pathname: '/container/' + props.cmName + '/caches/create',
          state: {
            cmName: props.cmName,
          },
        }}
      >
        <Button variant={'primary'}>Create Cache</Button>
      </Link>
    );
  };

  const buildViewConfigurationsButton = () => {
    return (
      <Link
        to={{
          pathname: '/container/' + props.cmName + '/configurations/',
          state: {
            cmName: props.cmName,
          },
        }}
      >
        <Button variant={'link'}>Configuration templates</Button>
      </Link>
    );
  };

  const buildFilter = () => {
    return (
      <ToolbarGroup variant="filter-group">
        <ToolbarItem style={{ width: 250 }}>
          <Select
            variant={SelectVariant.checkbox}
            aria-label="Filter"
            onToggle={onToggleFilter}
            onSelect={onSelectFilter}
            selections={selected}
            isOpen={isExpanded}
            toggleIcon={<FilterIcon />}
            maxHeight={200}
            placeholderText="Filter"
            isGrouped={true}
          >
            <SelectGroup label="Cache type" key="group1">
              <SelectOption key={0} value="Local" />
              <SelectOption key={1} value="Replicated" />
              <SelectOption key={2} value="Distributed" />
              <SelectOption key={3} value="Invalidated" />
              <SelectOption key={4} value="Scattered" />
            </SelectGroup>
            <SelectGroup label="Feature" key="group2">
              <SelectOption key={5} value="Bounded" />
              <SelectOption key={6} value="Indexed" />
              <SelectOption key={7} value="Persistent" />
              <SelectOption key={8} value="Transactional" />
              <SelectOption key={9} value="Secured" />
              <SelectOption key={10} value="Backups" />
              <SelectOption key={11} value="Ignored" />
            </SelectGroup>
          </Select>
        </ToolbarItem>
      </ToolbarGroup>
    );
  };

  const buildPagination = () => {
    return (
      <Pagination
        itemCount={filteredCaches.length}
        perPage={cachesPagination.perPage}
        page={cachesPagination.page}
        onSetPage={onSetPage}
        widgetId="pagination-caches"
        onPerPageSelect={onPerPageSelect}
        isCompact
      />
    );
  };

  const displayClearAll = () => {
    if (chipsCacheFeature.length == 0 && chipsCacheType.length == 0) {
      return '';
    }

    return (
      <Button
        variant={ButtonVariant.link}
        isInline
        onClick={onDeleteAllFilters}
      >
        Clear all
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
          <ToolbarItem variant={ToolbarItemVariant['search-filter']}>
            {buildFilter()}
          </ToolbarItem>
          <ToolbarItem variant={ToolbarItemVariant.separator}></ToolbarItem>
          <ToolbarItem>{buildCreateCacheButton()}</ToolbarItem>
          <ToolbarItem>{buildViewConfigurationsButton()}</ToolbarItem>
          <ToolbarItem variant={ToolbarItemVariant.pagination}>
            {buildPagination()}
          </ToolbarItem>
        </ToolbarContent>
        <ToolbarContent>
          <ToolbarItem variant={ToolbarItemVariant['chip-group']}>
            <ChipGroup key="chips-types" categoryName="Cache Type">
              {chipsCacheType.map((chip) => (
                <Chip key={'chip-' + chip} onClick={() => deleteItem(chip)}>
                  {chip}
                </Chip>
              ))}
            </ChipGroup>
            <ChipGroup key="chips-features" categoryName="Features">
              {chipsCacheFeature.map((chip) => (
                <Chip key={'chip-' + chip} onClick={() => deleteItem(chip)}>
                  {chip}
                </Chip>
              ))}
            </ChipGroup>
            <ChipGroup key="chip-status" categoryName="Status">
              {chipsCacheStatus.map((chip) => (
                <Chip key={'chip-' + chip} onClick={() => deleteItem(chip)}>
                  {chip}
                </Chip>
              ))}
            </ChipGroup>
          </ToolbarItem>
          <ToolbarItem>{displayClearAll()}</ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <Table
        aria-label="Caches"
        cells={columns}
        rows={rows}
        className={'caches-table'}
        actionResolver={actionResolver}
        variant={TableVariant.compact}
      >
        <TableHeader />
        <TableBody />
      </Table>
      <DeleteCache
        cacheName={deleteCacheName}
        isModalOpen={isDeleteCacheModalOpen}
        closeModal={closeDeleteModal}
      />
      <IgnoreCache
        cmName={props.cmName}
        cacheName={ignoreCache.cacheName}
        isModalOpen={ignoreCache.modalOpen}
        action={ignoreCache.action}
        closeModal={closeIgnoreModal}
      />
    </React.Fragment>
  );
};

export { CacheTableDisplay };
