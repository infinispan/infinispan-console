import React, {useEffect, useState} from 'react';
import {cellWidth, Table, TableBody, TableHeader, TableVariant, textCenter} from '@patternfly/react-table';
import {
  Bullseye,
  Button,
  ButtonVariant,
  Chip,
  ChipGroup,
  ChipGroupToolbarItem,
  DataToolbarGroup,
  DataToolbarItemVariant,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Pagination,
  Select,
  SelectGroup,
  SelectOption,
  SelectVariant,
  Text,
  TextContent,
  TextVariants,
  Title
} from '@patternfly/react-core';
import displayUtils from '../../services/displayUtils';
import {ExclamationCircleIcon, FilterIcon, SearchIcon} from '@patternfly/react-icons';
import {Link} from 'react-router-dom';
import {DataToolbar, DataToolbarContent, DataToolbarItem, Spinner} from '@patternfly/react-core/dist/js/experimental';
import {global_danger_color_100} from '@patternfly/react-tokens';
import dataContainerService from '../../services/dataContainerService';
import {CacheTypeBadge} from '@app/Common/CacheTypeBadge';
import {useApiAlert} from '@app/utils/useApiAlert';
import {DeleteCache} from "@app/CacheManagers/DeleteCache";

const CacheTableDisplay = (props: {
  cmName: string;
  setCachesCount: (count: number) => void;
  isVisible: boolean;
}) => {
  const { addAlert } = useApiAlert();
  const [caches, setCaches] = useState<CacheInfo[]>([]);
  const [filteredCaches, setFilteredCaches] = useState<CacheInfo[]>([]);
  const [cachesPagination, setCachesPagination] = useState({
    page: 1,
    perPage: 10
  });
  const [rows, setRows] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [chipsCacheFeature, setChipsCacheFeature] = useState<string[]>([]);
  const [chipsCacheType, setChipsCacheType] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isDeleteCacheModalOpen, setDeleteCacheModalOpen] = useState(false);
  const [deleteCacheName, setDeleteCacheName] = useState<string>('');
  const columns = [
    { title: 'Name', transforms: [cellWidth(20), textCenter] },
    {
      title: 'Type',
      transforms: [cellWidth(20), textCenter],
      cellTransforms: [textCenter]
    },
    {
      title: 'Health',
      transforms: [cellWidth(20), textCenter],
      cellTransforms: [textCenter]
    },
    {
      title: 'Features',
      transforms: [textCenter],
      cellTransforms: [textCenter]
    }
  ];

  const cachesActions = [
    {
      title: 'Delete',
      onClick: (event, rowId, rowData, extra) =>
        openDeleteCacheModal(rowData.cells[0].cacheName)
    }
  ];

  useEffect(() => {
    if(props.isVisible) {
      loadCaches();
    }
  }, [props.isVisible]);

  const closeDeleteModal = (deleteDone: boolean) => {
    if(deleteDone) {
      setFilteredCaches(
        filteredCaches.filter(
          cacheInfo => cacheInfo.name !== deleteCacheName
        )
      );
      loadCaches();
    }
    setDeleteCacheName('');
    setDeleteCacheModalOpen(false);
  };

  const openDeleteCacheModal = (cacheName: string) => {
    setDeleteCacheModalOpen(true);
    setDeleteCacheName(cacheName);
  };

  const loadCaches = () => {
    dataContainerService.getCaches(props.cmName).then(eitherCaches => {
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
          undefined
        );
      } else {
        updateRows([], false, eitherCaches.value.message);
      }
    });
  };

  const onSetPage = (_event, pageNumber) => {
    setCachesPagination({
      page: pageNumber,
      perPage: cachesPagination.perPage
    });
    const initSlice = (pageNumber - 1) * cachesPagination.perPage;
    updateRows(
      filteredCaches.slice(initSlice, initSlice + cachesPagination.perPage),
      false,
      undefined
    );
  };

  const onPerPageSelect = (_event, perPage) => {
    setCachesPagination({
      page: cachesPagination.page,
      perPage: perPage
    });
    const initSlice = (cachesPagination.page - 1) * perPage;
    updateRows(
      filteredCaches.slice(initSlice, initSlice + perPage),
      false,
      undefined
    );
  };

  const emptyOrLoading = (loading?: boolean, error?: string | undefined) => {
    if (loading) {
      return (
        <Bullseye>
          <Spinner size="xl" />
        </Bullseye>
      );
    }

    if (error) {
      return (
        <Bullseye>
          <EmptyState variant={EmptyStateVariant.small}>
            <EmptyStateIcon
              icon={ExclamationCircleIcon}
              color={global_danger_color_100.value}
            />
            <Title headingLevel="h2" size="lg">
              Unable to connect
            </Title>
            <EmptyStateBody>
              There was an error retrieving data. Check your connection and try
              again.
            </EmptyStateBody>
          </EmptyState>
        </Bullseye>
      );
    }

    return (
      <Bullseye>
        <EmptyState variant={EmptyStateVariant.small}>
          <EmptyStateIcon icon={SearchIcon} />
          <Title headingLevel="h2" size="lg">
            No caches found
          </Title>
        </EmptyState>
      </Bullseye>
    );
  };

  const updateRows = (
    caches: CacheInfo[],
    loading?: boolean,
    error?: undefined | string
  ) => {
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
              props: { colSpan: 8 },
              title: emptyOrLoading(loading, error)
            }
          ]
        }
      ];
      setActions([]);
    } else {
      currentRows = caches.map(cacheInfo => {
        return {
          heightAuto: true,
          type: '',
          disableActions: false,
          cells: [
            {
              cacheName: cacheInfo.name,
              title: displayCacheName(cacheInfo.name)
            },
            {
              title: <CacheTypeBadge cacheType={cacheInfo.type} small={true} />
            },
            { title: displayHealth(cacheInfo.health) },
            { title: displayCacheFeatures(cacheInfo) }
          ]
        };
      });
      setActions(cachesActions);
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

  const displayCacheName = (name: string) => {
    return (
      <Link key={name} to={'/cache/' + name}>
        <Button key={'link-' + name} variant={'link'}>
          {name}
        </Button>
      </Link>
    );
  };

  const displayHealth = (health: string) => {
    return (
      <TextContent>
        <Text
          component={TextVariants.p}
          style={{ color: displayUtils.healthColor(health, false) }}
        >
          {displayUtils.healthLabel(health)}
        </Text>
      </TextContent>
    );
  };

  const cacheTypes = [
    'Local',
    'Replicated',
    'Distributed',
    'Invalidated',
    'Scattered'
  ];
  const cacheFeatures = [
    'Bounded',
    'Indexed',
    'Persistent',
    'Transactional',
    'Secured',
    'Backups'
  ];

  const extract = (actualSelection: string[], ref: string[]): string[] => {
    return actualSelection.filter(s => ref.includes(s));
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
      let filterFeatures = extract(actualSelection, cacheFeatures);
      let filterCacheType = extract(actualSelection, cacheTypes);

      if (filterCacheType.length > 0) {
        newFilteredCaches = newFilteredCaches.filter(cacheInfo =>
          isCacheType(cacheInfo, filterCacheType)
        );
      }

      if (filterFeatures.length > 0) {
        newFilteredCaches = newFilteredCaches.filter(cacheInfo =>
          hasFeatures(cacheInfo, filterFeatures)
        );
      }
    }
    return newFilteredCaches;
  };

  const updateChips = (actualSelection: string[]) => {
    let filterFeatures = extract(actualSelection, cacheFeatures);
    let filterCacheType = extract(actualSelection, cacheTypes);
    setChipsCacheFeature(filterFeatures);
    setChipsCacheType(filterCacheType);
  };

  const deleteItem = id => {
    let actualSelection: string[] = selected.filter(item => item !== id);
    let newFilteredCaches = filterCaches(actualSelection);
    updateChips(actualSelection);
    updateRows(newFilteredCaches);
    setSelected(actualSelection);
    setFilteredCaches(newFilteredCaches);
  };

  const onSelectFilter = (event, selection) => {
    let actualSelection: string[] = [];

    if (selected.includes(selection)) {
      actualSelection = selected.filter(item => item !== selection);
    } else {
      actualSelection = [...selected, selection];
    }

    updateChips(actualSelection);
    let newFilteredCaches = filterCaches(actualSelection);

    updateRows(newFilteredCaches);
    setSelected(actualSelection);
    setFilteredCaches(newFilteredCaches);
  };

  const onToggleFilter = isExpanded => {
    setIsExpanded(isExpanded);
  };

  const onDeleteAllFilters = () => {
    setChipsCacheFeature([]);
    setChipsCacheType([]);
    setSelected([]);
    updateRows(caches);
    setFilteredCaches(caches);
  };

  const buildCreateCacheButton = () => {
    return (
      <Link
        to={{
          pathname: '/container/' + props.cmName + '/caches/create',
          state: {
            cmName: props.cmName
          }
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
            cmName: props.cmName
          }
        }}
      >
        <Button variant={'link'}>Configuration templates</Button>
      </Link>
    );
  };

  const options = [
    <SelectGroup label="Cache type" key="group1">
      <SelectOption key={0} value="Local" />
      <SelectOption key={1} value="Replicated" />
      <SelectOption key={2} value="Distributed" />
      <SelectOption key={3} value="Invalidated" />
      <SelectOption key={4} value="Scattered" />
    </SelectGroup>,
    <SelectGroup label="Feature" key="group2">
      <SelectOption key={5} value="Bounded" />
      <SelectOption key={6} value="Indexed" />
      <SelectOption key={7} value="Persistent" />
      <SelectOption key={8} value="Transactional" />
      <SelectOption key={9} value="Secured" />
      <SelectOption key={10} value="Backups" />
    </SelectGroup>
  ];

  const buildFilter = () => {
    return (
      <DataToolbarGroup variant="filter-group">
        <Select
          variant={SelectVariant.checkbox}
          aria-label="Filter"
          onToggle={onToggleFilter}
          onSelect={onSelectFilter}
          selections={selected}
          isExpanded={isExpanded}
          toggleIcon={<FilterIcon />}
          maxHeight={200}
          width={250}
          placeholderText="Filter"
          isGrouped={true}
        >
          {options}
        </Select>
      </DataToolbarGroup>
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
      <DataToolbar id="cache-table-toolbar">
        <DataToolbarContent>
          <DataToolbarItem variant={DataToolbarItemVariant['search-filter']}>
            {buildFilter()}
          </DataToolbarItem>
          <DataToolbarItem
            variant={DataToolbarItemVariant.separator}
          ></DataToolbarItem>
          <DataToolbarItem>{buildCreateCacheButton()}</DataToolbarItem>
          <DataToolbarItem>{buildViewConfigurationsButton()}</DataToolbarItem>
          <DataToolbarItem
            variant={DataToolbarItemVariant.pagination}
            breakpointMods={[{ modifier: 'align-right', breakpoint: 'md' }]}
          >
            {buildPagination()}
          </DataToolbarItem>
        </DataToolbarContent>
        <DataToolbarContent>
          <DataToolbarItem>
            <ChipGroup withToolbar>
              <ChipGroupToolbarItem key="chips-types" categoryName="Cache Type">
                {chipsCacheType.map(chip => (
                  <Chip key={'chip-' + chip} onClick={() => deleteItem(chip)}>
                    {chip}
                  </Chip>
                ))}
              </ChipGroupToolbarItem>
              <ChipGroupToolbarItem
                key="chips-features"
                categoryName="Features"
              >
                {chipsCacheFeature.map(chip => (
                  <Chip key={'chip-' + chip} onClick={() => deleteItem(chip)}>
                    {chip}
                  </Chip>
                ))}
              </ChipGroupToolbarItem>
            </ChipGroup>
          </DataToolbarItem>
          <DataToolbarItem>{displayClearAll()}</DataToolbarItem>
        </DataToolbarContent>
      </DataToolbar>
      <Table
        aria-label="Caches"
        cells={columns}
        rows={rows}
        className={'caches-table'}
        actions={actions}
        variant={TableVariant.compact}
      >
        <TableHeader />
        <TableBody />
      </Table>
      <DeleteCache cacheName={deleteCacheName} isModalOpen={isDeleteCacheModalOpen} closeModal={closeDeleteModal}/>
    </React.Fragment>
  );
};

export { CacheTableDisplay };
