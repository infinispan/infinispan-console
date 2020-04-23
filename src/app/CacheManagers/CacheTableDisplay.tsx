import React, {useEffect, useState} from 'react';
import {cellWidth, Table, TableBody, TableHeader, textCenter} from '@patternfly/react-table';
import {
  Badge,
  Bullseye,
  Button,
  EmptyState,
  EmptyStateIcon,
  EmptyStateVariant,
  Flex,
  FlexItem, Level, LevelItem,
  Pagination,
  Select,
  SelectGroup,
  SelectOption,
  SelectVariant,
  Stack,
  StackItem,
  Text,
  TextContent,
  TextVariants,
  Title,
  Toolbar,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import displayUtils from '../../services/displayUtils';
import {FilterIcon, SearchIcon} from '@patternfly/react-icons';
import {Link} from 'react-router-dom';
import {DataToolbar, DataToolbarContent, DataToolbarItem} from '@patternfly/react-core/dist/js/experimental';

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
  const [isExpanded, setIsExpanded ]= useState<boolean>(
    false
  );

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
      rows = caches.map(cache => {
        return {
          heightAuto: true,
          cells: [
            { title: <CacheName name={cache.name} /> },
            { title: <CacheType type={cache.type} /> },
            { title: <CacheHealth health={cache.health} /> },
            { title: <CacheFeatures cacheInfo={cache} /> }
          ]
          //TODO {title: <CacheActionLinks name={cache.name}/>}]
        };
      });
    }
    setRows(rows);
  };

  const CacheFeatures = (props: { cacheInfo: CacheInfo }) => {
    return (
      <Flex>
        <FlexItem>
          <CacheFeature name={'Bounded'} isPresent={props.cacheInfo.bounded} />
        </FlexItem>
        <FlexItem>
          <CacheFeature name={'Indexed'} isPresent={props.cacheInfo.indexed} />
        </FlexItem>
        <FlexItem>
          <CacheFeature
            name={'Persisted'}
            isPresent={props.cacheInfo.persistent}
          />
        </FlexItem>
        <FlexItem>
          <CacheFeature
            name={'Transactional'}
            isPresent={props.cacheInfo.transactional}
          />
        </FlexItem>
        <FlexItem>
          <CacheFeature name={'Secured'} isPresent={props.cacheInfo.secured} />
        </FlexItem>
        <FlexItem>
          <CacheFeature
            name={'Backups'}
            isPresent={props.cacheInfo.hasRemoteBackup}
          />
        </FlexItem>
      </Flex>
    );
  };

  const CacheFeature = (props: { name: string; isPresent: boolean }) => {
    if (!props.isPresent) {
      return <span />;
    }

    return (
      <TextContent>
        <Text component={TextVariants.small} style={{ paddingRight: 10 }}>
         {props.name}
        </Text>
      </TextContent>
    );
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
          backgroundColor: displayUtils.cacheTypeColor(props.type)
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
          component={TextVariants.p}
          style={{ color: displayUtils.healthColor(props.health, false) }}
        >
          {displayUtils.healthLabel(props.health)}
        </Text>
      </TextContent>
    );
  };

  const cacheTypes = ["Local", "Replicated", "Distributed","Invalidated", "Scattered"];
  const cacheFeatures = ["Bounded", "Indexed", "Persistent","Transactional", "Secured", "Backups"];

  function extract(actualSelection: string[], ref: string[]) : string[] {
    return actualSelection.filter(s => ref.includes(s));
  }

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
      <SelectOption key={10} value="Backups"/>
    </SelectGroup>
  ];

  const onSelect = (event, selection) => {
    let actualSelection: string[] = [];

    if (selected.includes(selection)) {
      actualSelection = selected.filter(item => item !== selection);
    } else {
      actualSelection = [...selected, selection];
    }

    let newFilteredCaches: CacheInfo[] = props.caches;

    if(actualSelection.length > 0) {
      let filterFeatures = extract(actualSelection, cacheFeatures);
      let filterCacheType = extract(actualSelection, cacheTypes);

      if(filterCacheType.length > 0) {
        newFilteredCaches = newFilteredCaches.filter(
          cacheInfo => isCacheType(cacheInfo, filterCacheType)
        );
      }

      if(filterFeatures.length > 0) {
        newFilteredCaches = newFilteredCaches.filter(
          cacheInfo => hasFeatures(cacheInfo, filterFeatures)
        );
      }
    }

    updateRows(newFilteredCaches);
    setSelected(actualSelection);
    setFilteredCaches(newFilteredCaches);
  };

  const onToggle = isExpanded => {
    setIsExpanded(isExpanded);
  };

  const onClear = () => {
    setSelected([]);
  };

  const isCacheType = (
    cacheInfo: CacheInfo,
    actualSelection:string[]
  ): boolean => {
    return actualSelection.includes(cacheInfo.type);
  };

  const hasFeatures = (
    cacheInfo: CacheInfo,
    actualSelection: string[]
  ): boolean => {
    if (
      actualSelection.includes('Transactional') &&
      cacheInfo.transactional
    ) {
      return true;
    }
    if (
      actualSelection.includes('Bounded') &&
      cacheInfo.bounded
    ) {
      return true;
    }

    if (
      actualSelection.includes('Indexed') &&
      cacheInfo.indexed
    ) {
      return true;
    }

    if (
      actualSelection.includes('Persistent') &&
      cacheInfo.persistent
    ) {
      return true;
    }

    if (
      actualSelection.includes('Secured') &&
      cacheInfo.secured
    ) {
      return true;
    }
    if (
      actualSelection.includes('Backups') &&
      cacheInfo.hasRemoteBackup
    ) {
      return true;
    }
    return false;
  };


  return (
    <Stack>
      <StackItem>
        <Level>
          <LevelItem>
            <Toolbar>
              <ToolbarGroup>
                <ToolbarItem>
                  <Select
                    variant={SelectVariant.checkbox}
                    onToggle={onToggle}
                    onSelect={onSelect}
                    onClear={onClear}
                    selections={selected}
                    isExpanded={isExpanded}
                    placeholderText="Filter"
                    ariaLabelledBy={"Filter"}
                    toggleIcon={<FilterIcon/>}
                    maxHeight={200}
                    width={250}
                    isGrouped
                  >
                    {options}
                  </Select>
                </ToolbarItem>
                <ToolbarItem>
                  <DataToolbar id="space-item">
                    <DataToolbarContent>
                      <DataToolbarItem variant="separator"></DataToolbarItem>
                    </DataToolbarContent>
                  </DataToolbar>
                </ToolbarItem>
                <ToolbarItem>
                  <Link
                    to={{
                      pathname:
                        '/container/' + props.cmName + '/caches/create',
                      state: {
                        cacheManager: props.cmName
                      }
                    }}
                  >
                    <Button variant={'primary'}>Create Cache</Button>
                  </Link>
                </ToolbarItem>
                <ToolbarItem>
                  <Link
                    to={{
                      pathname:
                        '/container/' + props.cmName + '/configurations/',
                      state: {
                        cacheManager: props.cmName
                      }
                    }}
                  >
                    <Button variant={'link'}>Configuration templates</Button>
                  </Link>
                </ToolbarItem>
              </ToolbarGroup>
            </Toolbar>
          </LevelItem>
          <LevelItem>
            <Pagination
              itemCount={filteredCaches.length}
              perPage={cachesPagination.perPage}
              page={cachesPagination.page}
              onSetPage={onSetPage}
              widgetId="pagination-caches"
              onPerPageSelect={onPerPageSelect}
              isCompact
            />
          </LevelItem>
        </Level>
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
