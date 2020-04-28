import React, { useEffect, useState } from 'react';
import {
  cellWidth,
  Table,
  TableBody,
  TableHeader,
  textCenter
} from '@patternfly/react-table';
import {
  Badge,
  Bullseye,
  Button,
  ButtonVariant,
  Chip,
  ChipGroup,
  ChipGroupToolbarItem,
  DataToolbarGroup,
  DataToolbarItemVariant,
  EmptyState,
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
import { FilterIcon, SearchIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';
import {
  DataToolbar,
  DataToolbarContent,
  DataToolbarItem
} from '@patternfly/react-core/dist/js/experimental';
import {
  global_FontSize_md,
  global_FontSize_sm,
  global_FontWeight_light,
  global_FontWeight_normal,
  global_palette_blue_50,
  global_spacer_sm,
  global_spacer_xs
} from '@patternfly/react-tokens';

const CacheTableDisplay: React.FunctionComponent<any> = (props: {
  caches: CacheInfo[];
  cmName: string;
}) => {
  const [filteredCaches, setFilteredCaches] = useState<CacheInfo[]>([
    ...props.caches
  ]);

  const [cachesPagination, setCachesPagination] = useState({
    page: 1,
    perPage: 10
  });
  const [rows, setRows] = useState<(string | any)[]>([]);

  const [selected, setSelected] = useState<string[]>([]);
  const [chipsCacheFeature, setChipsCacheFeature] = useState<string[]>([]);
  const [chipsCacheType, setChipsCacheType] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

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

  useEffect(() => {
    const initSlice = (cachesPagination.page - 1) * cachesPagination.perPage;
    updateRows(
      filteredCaches.slice(initSlice, initSlice + cachesPagination.perPage)
    );
  }, []);

  const onSetPage = (_event, pageNumber) => {
    setCachesPagination({
      page: pageNumber,
      perPage: cachesPagination.perPage
    });
    const initSlice = (pageNumber - 1) * cachesPagination.perPage;
    updateRows(
      filteredCaches.slice(initSlice, initSlice + cachesPagination.perPage)
    );
  };

  const onPerPageSelect = (_event, perPage) => {
    setCachesPagination({
      page: cachesPagination.page,
      perPage: perPage
    });
    const initSlice = (cachesPagination.page - 1) * perPage;
    updateRows(filteredCaches.slice(initSlice, initSlice + perPage));
  };

  const updateRows = (caches: CacheInfo[]) => {
    let rows: { heightAuto: boolean; cells: (string | any)[] }[];

    if (caches.length == 0) {
      rows = [
        {
          heightAuto: true,
          cells: [
            {
              props: { colSpan: 8 },
              title: (
                <Bullseye>
                  <EmptyState variant={EmptyStateVariant.small}>
                    <EmptyStateIcon icon={SearchIcon} />
                    <Title headingLevel="h2" size="lg">
                      No caches found
                    </Title>
                  </EmptyState>
                </Bullseye>
              )
            }
          ]
        }
      ];
    } else {
      rows = caches.map(cacheInfo => {
        return {
          heightAuto: true,
          cells: [
            { title: displayCacheName(cacheInfo.name) },
            { title: displayCacheType(cacheInfo.type) },
            { title: displayHealth(cacheInfo.health) },
            { title: displayCacheFeatures(cacheInfo) }
          ]
          //TODO {title: <CacheActionLinks name={cache.name}/>}]
        };
      });
    }
    setRows(rows);
  };

  const appendFeature = (features: string, feature: string): string => {
    return features + (features.length > 0 ? ' / ' : '') + feature;
  };

  const displayCacheFeatures = (cacheInfo: CacheInfo) => {
    let features = '';

    if (cacheInfo.bounded) {
      features = appendFeature(features, 'Bounded');
    }
    if (cacheInfo.indexed) {
      features = appendFeature(features, 'Indexed');
    }
    if (cacheInfo.persistent) {
      features = appendFeature(features, 'Persistent');
    }
    if (cacheInfo.transactional) {
      features = appendFeature(features, 'Transactional');
    }
    if (cacheInfo.secured) {
      features = appendFeature(features, 'Secured');
    }
    if (cacheInfo.hasRemoteBackup) {
      features = appendFeature(features, 'Backups');
    }
    return (
      <TextContent>
        <Text component={TextVariants.small}>{features}</Text>
      </TextContent>
    );
  };

  const displayCacheName = (name: string) => {
    return (
      <Link
        to={{
          pathname: '/cache/' + name,
          state: {
            cacheName: name
          }
        }}
      >
        <Button variant={'link'}>{name}</Button>
      </Link>
    );
  };

  const displayCacheType = (type: string) => {
    return (
      <Badge
        style={{
          backgroundColor: displayUtils.cacheTypeColor(type),
          color: displayUtils.cacheTypeColorLabel(type),
          fontSize: global_FontSize_sm.value,
          fontWeight: 'lighter',
          padding: global_spacer_xs.value,
          paddingRight: global_spacer_sm.value,
          paddingLeft: global_spacer_sm.value
        }}
      >
        {type}
      </Badge>
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

  function extract(actualSelection: string[], ref: string[]): string[] {
    return actualSelection.filter(s => ref.includes(s));
  }

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
    if (actualSelection.includes('Transactional') && cacheInfo.transactional) {
      return true;
    }
    if (actualSelection.includes('Bounded') && cacheInfo.bounded) {
      return true;
    }

    if (actualSelection.includes('Indexed') && cacheInfo.indexed) {
      return true;
    }

    if (actualSelection.includes('Persistent') && cacheInfo.persistent) {
      return true;
    }

    if (actualSelection.includes('Secured') && cacheInfo.secured) {
      return true;
    }
    if (actualSelection.includes('Backups') && cacheInfo.hasRemoteBackup) {
      return true;
    }
    return false;
  };

  const filterCaches = (actualSelection: string[]) => {
    let newFilteredCaches: CacheInfo[] = props.caches;

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
    updateRows(props.caches);
    setFilteredCaches(props.caches);
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

  return (
    <React.Fragment>
      <DataToolbar
        id="cache-table-toolbar"
        collapseListedFiltersBreakpoint="xl"
      >
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
      >
        <TableHeader />
        <TableBody />
      </Table>
    </React.Fragment>
  );
};

export { CacheTableDisplay };
