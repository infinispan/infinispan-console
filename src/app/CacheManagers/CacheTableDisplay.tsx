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
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Grid,
  GridItem,
  Pagination,
  Select,
  SelectOption,
  SelectVariant,
  Stack,
  StackItem,
  Text,
  TextContent,
  TextVariants,
  Title
} from '@patternfly/react-core';
import { chart_color_green_300 } from '@patternfly/react-tokens';
import displayUtils from '../../services/displayUtils';
import { OkIcon, PlusCircleIcon, SearchIcon } from '@patternfly/react-icons';
import { Link } from 'react-router-dom';

const CacheTableDisplay: React.FunctionComponent<any> = (props: {
  caches: CacheInfo[];
  cacheManager: CacheManager;
}) => {
  const cacheManager: CacheManager = props.cacheManager;
  const [filteredCaches, setFilteredCaches] = useState<CacheInfo[]>([
    ...props.caches
  ]);
  const [cachesPagination, setCachesPagination] = useState({
    page: 1,
    perPage: 10
  });
  const [rows, setRows] = useState<(string | any)[]>([]);
  const [selectedCacheTypes, setSelectedCacheTypes] = useState<string[]>([]);
  const [isExpandedCacheTypes, setIsExpandedCacheTypes] = useState<boolean>(
    false
  );
  const [selectedCacheFeatures, setSelectedCacheFeatures] = useState<string[]>(
    []
  );
  const [isExpandedCacheFeatures, setIsExpandedCacheFeatures] = useState<
    boolean
  >(false);

  const columns = [
    { title: 'Name', transforms: [cellWidth(20), textCenter] },
    {
      title: 'Type',
      transforms: [cellWidth(20), textCenter],
      cellTransforms: [textCenter]
    },
    {
      title: 'Health',
      transforms: [cellWidth(10), textCenter],
      cellTransforms: [textCenter]
    },
    {
      title: 'Bounded',
      transforms: [textCenter],
      cellTransforms: [textCenter]
    },
    {
      title: 'Indexed',
      transforms: [textCenter],
      cellTransforms: [textCenter]
    },
    {
      title: 'Persisted',
      transforms: [textCenter],
      cellTransforms: [textCenter]
    },
    {
      title: 'Transactional',
      transforms: [textCenter],
      cellTransforms: [textCenter]
    },
    {
      title: 'Secured',
      transforms: [textCenter],
      cellTransforms: [textCenter]
    },
    {
      title: 'Remote backups',
      transforms: [textCenter],
      cellTransforms: [textCenter]
    }
  ];

  const cacheTypesOptions = [
    <SelectOption key={0} value="Local" />,
    <SelectOption key={1} value="Replicated" />,
    <SelectOption key={2} value="Distributed" />,
    <SelectOption key={3} value="Invalidated" />,
    <SelectOption key={4} value="Scattered" />
  ];

  const cacheFeaturesOptions = [
    <SelectOption key={0} value="Bounded" />,
    <SelectOption key={1} value="Indexed" />,
    <SelectOption key={2} value="Persistent" />,
    <SelectOption key={3} value="Transactional" />,
    <SelectOption key={4} value="Secured" />,
    <SelectOption key={5} value="Has Remote Backup" />
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
                    <EmptyStateBody>
                      <CreateCacheButton />
                    </EmptyStateBody>
                  </EmptyState>
                </Bullseye>
              )
            }
          ]
        }
      ];
    } else {
      rows = caches.map(cache => {
        return {
          heightAuto: true,
          cells: [
            { title: <CacheName name={cache.name} /> },
            { title: <CacheType type={cache.type} /> },
            { title: <CacheHealth health={cache.health} /> },
            { title: <CacheFeature isPresent={cache.bounded} /> },
            { title: <CacheFeature isPresent={cache.indexed} /> },
            { title: <CacheFeature isPresent={cache.persistent} /> },
            { title: <CacheFeature isPresent={cache.transactional} /> },
            { title: <CacheFeature isPresent={cache.secured} /> },
            { title: <CacheFeature isPresent={cache.hasRemoteBackup} /> }
          ]
          //TODO {title: <CacheActionLinks name={cache.name}/>}]
        };
      });
    }
    setRows(rows);
  };

  const CreateCacheButton = () => {
    return (
      <Link
        to={{
          pathname: '/caches/create',
          state: {
            cm: cacheManager.name
          }
        }}
      >
        <Button
          component="a"
          target="_blank"
          variant="link"
          icon={<PlusCircleIcon />}
        >
          Create cache
        </Button>
      </Link>
    );
  };

  const CacheFeature = (props: { isPresent: boolean }) => {
    if (!props.isPresent) {
      return <span />;
    }
    return <OkIcon color={chart_color_green_300.value} />;
  };

  const CacheName = (props: { name: string }) => {
    return (
      <Link
        to={{
          pathname: '/cache/' + props.name,
          state: {
            cacheName: props.name
          }
        }}
      >
        <Button variant={'link'}>{props.name}</Button>
      </Link>
    );
  };

  const CacheType = (props: { type: string }) => {
    return (
      <Badge
        style={{
          backgroundColor: displayUtils.cacheTypeColor(props.type),
          marginRight: 15
        }}
      >
        {props.type}
      </Badge>
    );
  };

  const CacheHealth = (props: { health: string }) => {
    return (
      <TextContent>
        <Text
          component={TextVariants.h5}
          style={{ color: displayUtils.healthColor(props.health) }}
        >
          {displayUtils.healthLabel(props.health)}
        </Text>
      </TextContent>
    );
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

    let caches = props.caches;
    if (selectedCacheFeatures.length > 0) {
      caches = caches.filter(cacheInfo =>
        hasFeature(cacheInfo, selectedCacheFeatures)
      );
    }

    let newFilteredCaches: CacheInfo[] = caches.filter(
      cacheInfo =>
        actualSelection.length == 0 ||
        actualSelection.find(type => type === cacheInfo.type)
    );

    updateRows(newFilteredCaches);
    setSelectedCacheTypes(actualSelection);
    setFilteredCaches(newFilteredCaches);
  };

  const onToggleCacheFeature = isExpanded => {
    setIsExpandedCacheFeatures(isExpanded);
  };

  const hasFeature = (
    cacheInfo: CacheInfo,
    actualSelection: string[]
  ): boolean => {
    if (
      actualSelection.find(feature => feature === 'Transactional') &&
      cacheInfo.transactional
    ) {
      return true;
    }
    if (
      actualSelection.find(feature => feature === 'Bounded') &&
      cacheInfo.bounded
    ) {
      return true;
    }

    if (
      actualSelection.find(feature => feature === 'Indexed') &&
      cacheInfo.indexed
    ) {
      return true;
    }

    if (
      actualSelection.find(feature => feature === 'Persistent') &&
      cacheInfo.persistent
    ) {
      return true;
    }

    if (
      actualSelection.find(feature => feature === 'Secured') &&
      cacheInfo.secured
    ) {
      return true;
    }
    if (
      actualSelection.find(feature => feature === 'Has Remote Backup') &&
      cacheInfo.hasRemoteBackup
    ) {
      return true;
    }
    return false;
  };

  const onSelectCacheFeature = (event, selection) => {
    let actualSelection: string[] = [];

    if (selectedCacheFeatures.includes(selection)) {
      actualSelection = selectedCacheFeatures.filter(
        item => item !== selection
      );
    } else {
      actualSelection = [...selectedCacheFeatures, selection];
    }

    let caches = props.caches;
    if (selectedCacheTypes.length > 0) {
      caches = caches.filter(cacheInfo =>
        selectedCacheTypes.find(type => type === cacheInfo.type)
      );
    }

    let newFilteredCaches: CacheInfo[] = caches.filter(
      cacheInfo =>
        actualSelection.length == 0 || hasFeature(cacheInfo, actualSelection)
    );
    updateRows(newFilteredCaches);
    setSelectedCacheFeatures(actualSelection);
    setFilteredCaches(newFilteredCaches);
  };

  return (
    <Stack style={{ marginTop: 10 }}>
      <StackItem>
        <Grid style={{ marginBottom: 10 }} gutter={'md'}>
          <GridItem span={2}>
            <Select
              variant={SelectVariant.checkbox}
              aria-label="Select cache type"
              onToggle={onToggleCacheType}
              onSelect={onSelectCacheType}
              selections={selectedCacheTypes}
              isExpanded={isExpandedCacheTypes}
              placeholderText="Types"
              ariaLabelledBy="cache-type-filter-select-id"
            >
              {cacheTypesOptions}
            </Select>
          </GridItem>
          <GridItem span={2}>
            <Select
              variant={SelectVariant.checkbox}
              aria-label="Select cache feature"
              onToggle={onToggleCacheFeature}
              onSelect={onSelectCacheFeature}
              selections={selectedCacheFeatures}
              isExpanded={isExpandedCacheFeatures}
              placeholderText="Features"
              ariaLabelledBy="cache-feature-filter-select-id"
            >
              {cacheFeaturesOptions}
            </Select>
          </GridItem>
          <GridItem span={2}>
            <Link
              to={{
                pathname:
                  '/container/' + cacheManager.name + '/configurations/',
                state: {
                  cacheManager: cacheManager.name
                }
              }}
            >
              <Button variant={'link'}>Configurations</Button>
            </Link>
          </GridItem>
          <GridItem span={2}>
            <Link
              to={{
                pathname: '/caches/create',
                state: {
                  cm: cacheManager.name
                }
              }}
            >
              <Button variant={'primary'}>Create Cache</Button>
            </Link>
          </GridItem>
          <GridItem span={4}>
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
        <Table
          aria-label="Caches"
          cells={columns}
          rows={rows}
          className={'caches-table'}
        >
          <TableHeader />
          <TableBody />
        </Table>
      </StackItem>
    </Stack>
  );
};

export { CacheTableDisplay };
