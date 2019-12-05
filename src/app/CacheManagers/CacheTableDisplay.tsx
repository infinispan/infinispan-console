import React, {useEffect, useState} from 'react';
import {cellWidth, Table, TableBody, TableHeader,} from '@patternfly/react-table';
import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Grid,
  GridItem,
  Label,
  Level,
  LevelItem,
  Pagination,
  Select,
  SelectOption,
  SelectVariant,
  Stack,
  StackItem,
  Title,
  Tooltip
} from "@patternfly/react-core";
import {chart_color_black_200, chart_color_blue_500} from "@patternfly/react-tokens";
import displayUtils from "../../services/displayUtils";
import {
  CatalogIcon,
  DegradedIcon,
  InfoIcon,
  KeyIcon,
  PlusCircleIcon,
  SaveIcon,
  SearchIcon,
  ServiceIcon,
  Spinner2Icon,
  StorageDomainIcon
} from "@patternfly/react-icons";
import {Link} from "react-router-dom";

const CacheTableDisplay: React.FunctionComponent<any> = (props: { caches: CacheInfo[], cacheManager: CacheManager }) => {
  const cacheManager: CacheManager = props.cacheManager;
  const [filteredCaches, setFilteredCaches] = useState<CacheInfo[]>([...props.caches]);
  const [cachesPagination, setCachesPagination] = useState({page: 1, perPage: 10});
  const [rows, setRows] = useState<(string | any)[]>([]);
  const [selectedCacheTypes, setSelectedCacheTypes] = useState<string[]>([]);
  const [isExpandedCacheTypes, setIsExpandedCacheTypes] = useState<boolean>(false);
  const [selectedCacheFeatures, setSelectedCacheFeatures] = useState<string[]>([]);
  const [isExpandedCacheFeatures, setIsExpandedCacheFeatures] = useState<boolean>(false);

  const columns = [{title: 'Name', transforms: [cellWidth(25)]},
    {title: 'Type', transforms: [cellWidth(10)]},
    {title: 'Features', transforms: [cellWidth(40)]},
    {title: 'Actions', transforms: [cellWidth('max')]}];

  const cacheTypesOptions = [
    <SelectOption key={0} value="Local"/>,
    <SelectOption key={1} value="Replicated"/>,
    <SelectOption key={2} value="Distributed"/>,
    <SelectOption key={3} value="Invalidated"/>,
    <SelectOption key={4} value="Scattered"/>
  ];

  const cacheFeaturesOptions = [
    <SelectOption key={0} value="Bounded"/>,
    <SelectOption key={1} value="Indexed"/>,
    <SelectOption key={2} value="Persistent"/>,
    <SelectOption key={3} value="Transactional"/>,
    <SelectOption key={4} value="Secured"/>,
    <SelectOption key={5} value="Has Remote Backup"/>
  ];

  useEffect(() => {
      const initSlice = (cachesPagination.page - 1) * cachesPagination.perPage;
      updateRows(filteredCaches.slice(initSlice, initSlice + cachesPagination.perPage));
    },
    []);

  const onSetPage = (_event, pageNumber) => {
    setCachesPagination({
      page: pageNumber,
      perPage: cachesPagination.perPage
    });
    const initSlice = (pageNumber - 1) * cachesPagination.perPage;
    updateRows(filteredCaches.slice(initSlice, initSlice + cachesPagination.perPage));
  };

  const onPerPageSelect = (_event, perPage) => {
    setCachesPagination({
      page: cachesPagination.page,
      perPage: perPage
    });
    const initSlice = (cachesPagination.page - 1) * perPage;
    updateRows(filteredCaches.slice(initSlice, initSlice + perPage));
  };

  const updateRows = (caches) => {
    let rows: { heightAuto: boolean, cells: (string | any)[] }[];

    if (caches.length == 0) {
      rows = [{
        heightAuto: true,
        cells: [
          {
            props: {colSpan: 8},
            title: (
              <Bullseye>
                <EmptyState variant={EmptyStateVariant.small}>
                  <EmptyStateIcon icon={SearchIcon}/>
                  <Title headingLevel="h2" size="lg">
                    No caches found
                  </Title>
                  <EmptyStateBody>
                    <CreateCacheButton/>
                  </EmptyStateBody>
                </EmptyState>
              </Bullseye>
            )
          },
        ]
      }]
    } else {
      rows = caches.map(cache => {
        return {
          heightAuto: true,
          cells: [cache.name,
            {title: <CacheType type={cache.type}/>},
            {title: <CacheFeatures cache={cache}/>},
            {title: <CacheActionLinks name={cache.name}/>}]
        };
      });
    }
    setRows(rows);
  };

  const CreateCacheButton = () => {
    return <Link to={{
      pathname: '/caches/create',
      state: {
        cacheManager: cacheManager,
      }
    }}>
      <Button component="a" target="_blank" variant="link" icon={<PlusCircleIcon/>}>
        Create cache
      </Button>
    </Link>;
  };

  const CacheActionLinks: React.FunctionComponent<any> = (props) => {
    const name: string = props.name;

    return (<Link to={{
      pathname: '/cache/' + name,
      state: {
        cacheName: name,
      }
    }}><InfoIcon/>More</Link>);
  };

  const hasFeatureColor = (feature: boolean) => {
    if (feature) {
      return chart_color_blue_500.value;
    } else {
      return chart_color_black_200.value;
    }
  };

  const CacheFeatures = (props: { cache: CacheInfo }) => {
    const cache: CacheInfo = props.cache;
    return (<Level>
      <LevelItem><CacheFeature icon={<Spinner2Icon color={hasFeatureColor(cache.bounded)}/>}
                               tooltip={'Bounded'}/></LevelItem>
      <LevelItem><CacheFeature icon={<StorageDomainIcon color={hasFeatureColor(cache.indexed)}/>}
                               tooltip={'Indexed'}/></LevelItem>
      <LevelItem><CacheFeature icon={<SaveIcon color={hasFeatureColor(cache.persistent)}/>}
                               tooltip={'Persisted'}/></LevelItem>
      <LevelItem><CacheFeature icon={<ServiceIcon color={hasFeatureColor(cache.transactional)}/>}
                               tooltip={'Transactional'}/></LevelItem>
      <LevelItem><CacheFeature icon={<KeyIcon color={hasFeatureColor(cache.secured)}/>}
                               tooltip={'Secured'}/></LevelItem>
      <LevelItem><CacheFeature icon={<DegradedIcon color={hasFeatureColor(cache.hasRemoteBackup)}/>}
                               tooltip={'Has remote backups'}/></LevelItem>
    </Level>);
  };

  const CacheFeature = (props) => {
    return (<LevelItem>
      <Tooltip position="right"
               content={
                 <div>{props.tooltip}</div>
               }>
        {props.icon}
      </Tooltip></LevelItem>);
  };

  const CacheType = (props) => {
    return (<Label style={{backgroundColor: displayUtils.cacheTypeColor(props.type), marginRight: 15}}>
      {props.type}</Label>);
  };

  const onToggleCacheType = isExpanded => {
    setIsExpandedCacheTypes(isExpanded);
  };

  const onSelectCacheType = (event, selection) => {
    let actualSelection: string[] = [];

    if (selectedCacheTypes.includes(selection)) {
      actualSelection = selectedCacheTypes.filter(item => item !== selection);
    } else {
      actualSelection = [...selectedCacheTypes, selection];
    }
    let newFilteredCaches: CacheInfo[] = props.caches.filter(cacheInfo => actualSelection.length == 0
      || actualSelection.find(type => type === cacheInfo.type));
    updateRows(newFilteredCaches);
    setSelectedCacheTypes(actualSelection);
    setFilteredCaches(newFilteredCaches);
  };

  const onToggleCacheFeature = isExpanded => {
    setIsExpandedCacheFeatures(isExpanded);
  };

  const hasFeature = (cacheInfo: CacheInfo, actualSelection: string[]): boolean => {
    if (actualSelection.find(feature => feature === 'Transactional') && cacheInfo.transactional) {
      return true;
    }
    if (actualSelection.find(feature => feature === 'Bounded') && cacheInfo.bounded) {
      return true;
    }

    if (actualSelection.find(feature => feature === 'Indexed') && cacheInfo.indexed) {
      return true;
    }

    if (actualSelection.find(feature => feature === 'Persistent') && cacheInfo.persistent) {
      return true;
    }

    if (actualSelection.find(feature => feature === 'Secured') && cacheInfo.secured) {
      return true;
    }
    if (actualSelection.find(feature => feature === 'Has Remote Backup') && cacheInfo.hasRemoteBackup) {
      return true;
    }
    return false;
  };


  const onSelectCacheFeature = (event, selection) => {
    let actualSelection: string[] = [];

    if (selectedCacheFeatures.includes(selection)) {
      actualSelection = selectedCacheFeatures.filter(item => item !== selection);
    } else {
      actualSelection = [...selectedCacheFeatures, selection];
    }

    let newFilteredCaches: CacheInfo[] = props.caches.filter(cacheInfo => actualSelection.length == 0 || hasFeature(cacheInfo, actualSelection));
    updateRows(newFilteredCaches);
    setSelectedCacheFeatures(actualSelection);
    setFilteredCaches(newFilteredCaches);
  };

  return (
    <Stack>
      <StackItem>
        <CreateCacheButton/>
        <Link to={{
          pathname: 'container/' + cacheManager.name + '/configurations/',
          state: {
            cacheManager: cacheManager.name
          }
        }}> <Button variant="link" icon={<CatalogIcon/>}>Configurations </Button>{' '}
        </Link>
      </StackItem>
      <StackItem>
        <Grid style={{marginBottom: 10}} gutter={"md"}>
          <GridItem span={3}>
            <Select
              variant={SelectVariant.checkbox}
              aria-label="Select cache type"
              onToggle={onToggleCacheType}
              onSelect={onSelectCacheType}
              selections={selectedCacheTypes}
              isExpanded={isExpandedCacheTypes}
              placeholderText="Filter by cache type"
              ariaLabelledBy="cache-type-filter-select-id"
            >
              {cacheTypesOptions}
            </Select>
          </GridItem>
          <GridItem span={3}>
            <Select
              variant={SelectVariant.checkbox}
              aria-label="Select cache feature"
              onToggle={onToggleCacheFeature}
              onSelect={onSelectCacheFeature}
              selections={selectedCacheFeatures}
              isExpanded={isExpandedCacheFeatures}
              placeholderText="Filter by cache feature"
              ariaLabelledBy="cache-feature-filter-select-id"
            >
              {cacheFeaturesOptions}
            </Select>
          </GridItem>
          <GridItem span={6}>
            <Pagination
              itemCount={filteredCaches.length}
              perPage={cachesPagination.perPage}
              page={cachesPagination.page}
              onSetPage={onSetPage}
              widgetId="pagination-caches"
              onPerPageSelect={onPerPageSelect}
              isCompact
            />
          </GridItem>
        </Grid>
      </StackItem>
      <StackItem>
        <Table aria-label="Caches" cells={columns} rows={rows} className={'caches-table'}>
          <TableHeader/>
          <TableBody/>
        </Table>
      </StackItem>
    </Stack>
  );
};

export {CacheTableDisplay};
