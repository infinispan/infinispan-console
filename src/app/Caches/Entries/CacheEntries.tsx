import React, { useEffect, useState } from 'react';
import {
  Bullseye,
  Button,
  ButtonVariant,
  Card,
  CardBody,
  Divider,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
  Pagination,
  SearchInput,
  Toolbar,
  ToolbarContent,
  ToolbarFilter,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
  Tooltip
} from '@patternfly/react-core';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core/deprecated';
import { ActionsColumn, IAction, Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { FilterIcon, HelpIcon, PlusCircleIcon, SearchIcon } from '@patternfly/react-icons';
import { global_spacer_md, global_spacer_sm } from '@patternfly/react-tokens';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { githubGist } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import displayUtils from '@services/displayUtils';
import { useTranslation } from 'react-i18next';
import { useCacheDetail, useCacheEntries } from '@app/services/cachesHook';
import { ConsoleServices } from '@services/ConsoleServices';
import { useConnectedUser } from '@app/services/userManagementHook';
import { ConsoleACL } from '@services/securityService';
import { CacheConfigUtils } from '@services/cacheConfigUtils';
import { ContentType, EncodingType } from '@services/infinispanRefData';
import { CreateOrUpdateEntryForm } from '@app/Caches/Entries/CreateOrUpdateEntryForm';
import { ClearAllEntries } from '@app/Caches/Entries/ClearAllEntries';
import { DeleteEntry } from '@app/Caches/Entries/DeleteEntry';

const CacheEntries = (props: { cacheName: string }) => {
  const { cacheEntries, totalEntriesCount, loadingEntries, errorEntries, infoEntries, reloadEntries, getByKey } =
    useCacheEntries();
  const { cache } = useCacheDetail();
  const { connectedUser } = useConnectedUser();
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const [isCreateOrUpdateEntryFormOpen, setCreateOrUpdateEntryFormOpen] = useState<boolean>(false);
  const [isDeleteEntryModalOpen, setDeleteEntryModalOpen] = useState<boolean>(false);
  const [keyToDelete, setKeyToDelete] = useState<string>('');
  const [keyToEdit, setKeyToEdit] = useState<string>('');
  const [keyContentTypeToEdit, setKeyContentTypeToEdit] = useState<ContentType>(ContentType.StringContentType);
  const [isClearAllModalOpen, setClearAllModalOpen] = useState<boolean>(false);
  const [rows, setRows] = useState<CacheEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<CacheEntry[]>([]);
  const [isOpenFilter, setIsOpenFilter] = useState<boolean>(false);
  const [selectSearchOption, setSelectSearchOption] = useState<ContentType>(ContentType.string);
  const [searchValue, setSearchValue] = useState<string>('');
  const [entriesPagination, setEntriesPagination] = useState<PaginationType>({
    page: 1,
    perPage: 10
  });

  useEffect(() => {
    if (cache.encoding.key == EncodingType.Protobuf) {
      setSelectSearchOption(ContentType.string);
      setKeyContentTypeToEdit(ContentType.string);
    } else if (cache.encoding.key == EncodingType.Java ||
               cache.encoding.key == EncodingType.JBoss ||
               cache.encoding.key == EncodingType.JavaSerialized) {
      setSelectSearchOption(ContentType.StringContentType);
      setKeyContentTypeToEdit(ContentType.StringContentType);
    } else if (cache.encoding.key == EncodingType.XML){
      setSelectSearchOption(ContentType.XML);
      setKeyContentTypeToEdit(ContentType.XML);
    } else if (cache.encoding.key == EncodingType.JSON) {
      setSelectSearchOption(ContentType.JSON);
      setSelectSearchOption(ContentType.JSON);
    } else if (cache.encoding.key == EncodingType.Text) {
      setSelectSearchOption(ContentType.StringContentType);
      setSelectSearchOption(ContentType.StringContentType);
    }
  }, [cache]);

  useEffect(() => {
    if (cacheEntries) {
      setFilteredEntries(cacheEntries);
    }
  }, [loadingEntries, errorEntries, cacheEntries]);

  useEffect(() => {
    if (filteredEntries) {
      const initSlice = (entriesPagination.page - 1) * entriesPagination.perPage;
      const updateRows = filteredEntries.slice(initSlice, initSlice + entriesPagination.perPage);
      updateRows.length > 0 ? setRows(updateRows) : setRows([]);
    }
  }, [entriesPagination, filteredEntries]);

  useEffect(() => {
    if (searchValue === '') {
      reloadEntries();
    }
  }, [searchValue]);

  const onSetPage = (_event, pageNumber) => {
    setEntriesPagination({
      ...entriesPagination,
      page: pageNumber
    });
  };

  const onPerPageSelect = (_event, perPage) => {
    setEntriesPagination({
      page: 1,
      perPage: perPage
    });
  };

  const displayActions = (row): IAction[] => [
    {
      'aria-label': 'editEntryAction',
      title: t('caches.entries.action-edit'),
      onClick: () => onClickEditEntryButton(row.key, row.keyContentType as ContentType)
    },
    {
      'aria-label': 'deleteEntryAction',
      title: t('caches.entries.action-delete'),
      onClick: () => onClickDeleteEntryButton(row.key, row.keyContentType as ContentType)
    }
  ];

  const columnNames = {
    key: t('caches.entries.column-key'),
    value: t('caches.entries.column-value'),
    lifespan: t('caches.entries.column-lifespan'),
    maxIdle: t('caches.entries.column-maxidle'),
    expires: t('caches.entries.column-expires')
  };

  const displayHighlighted = (value: string, encodingType: EncodingType, contentType?: ContentType) => {
    const highlightedContent = (
      <SyntaxHighlighter
        language="json"
        lineProps={{ style: { wordBreak: 'break-all' } }}
        style={githubGist}
        useInlineStyles={true}
        wrapLongLines={true}
      >
        {displayUtils.formatContentToDisplay(value, contentType)}
      </SyntaxHighlighter>
    );

    if (encodingType == EncodingType.Protobuf && contentType) {
      return (
        <Tooltip position="top" content={<div>{contentType}</div>}>
          {highlightedContent}
        </Tooltip>
      );
    }
    return highlightedContent;
  };

  const onClickAddEntryButton = () => {
    setKeyToEdit('');
    setCreateOrUpdateEntryFormOpen(true);
  };

  const onClickClearAllButton = () => {
    setClearAllModalOpen(true);
  };

  const onClickEditEntryButton = (entryKey: string, keyContentType: ContentType) => {
    setKeyToEdit(entryKey);
    setKeyContentTypeToEdit(keyContentType);
    setCreateOrUpdateEntryFormOpen(true);
  };

  const onClickDeleteEntryButton = (entryKey: string, keyContentType: ContentType) => {
    setDeleteEntryModalOpen(true);
    setKeyToDelete(entryKey);
    setKeyContentTypeToEdit(keyContentType);
  };

  const closeCreateOrEditEntryFormModal = () => {
    searchEntryByKey();
    setKeyToEdit('');
    setCreateOrUpdateEntryFormOpen(false);
  };

  const closeClearAllEntryModal = () => {
    setClearAllModalOpen(false);
    searchEntryByKey();
  };

  const closeDeleteEntryModal = () => {
    setDeleteEntryModalOpen(false);
    setKeyToDelete('');
    searchEntryByKey();
  };

  const onSelectFilter = (event, selection) => {
    setSelectSearchOption(selection);
    setIsOpenFilter(false);
  };

  const addEntryAction = () => {
    if (!ConsoleServices.security().hasCacheConsoleACL(ConsoleACL.WRITE, cache.name, connectedUser)) {
      return '';
    }

    return (
      <ToolbarItem>
        <Button
          data-cy="addEntryButton"
          key="add-entry-button"
          variant={ButtonVariant.primary}
          onClick={onClickAddEntryButton}
        >
          {t('caches.entries.add-entry-button-label')}
        </Button>
      </ToolbarItem>
    );
  };

  const clearAllAction = () => {
    if (!ConsoleServices.security().hasCacheConsoleACL(ConsoleACL.BULK_WRITE, cache.name, connectedUser)) {
      return '';
    }

    return (
      <ToolbarItem>
        <Button data-cy="clearAllButton" variant={ButtonVariant.link} onClick={onClickClearAllButton}>
          {t('caches.entries.clear-entry-button-label')}
        </Button>
      </ToolbarItem>
    );
  };

  const emptyPage = (
    <Card>
      <CardBody>
        <EmptyState variant={EmptyStateVariant.lg}>
          <EmptyStateHeader
            titleText={<>{t('caches.entries.empty-cache')}</>}
            icon={<EmptyStateIcon icon={PlusCircleIcon} />}
            headingLevel="h4"
          />
          <EmptyStateBody>{infoEntries ? infoEntries : t('caches.entries.empty-cache-body')}</EmptyStateBody>
          <EmptyStateFooter>
            <EmptyStateActions style={{ marginTop: global_spacer_sm.value }}>{addEntryAction()}</EmptyStateActions>
          </EmptyStateFooter>
        </EmptyState>
      </CardBody>
    </Card>
  );

  const toolbarPagination = (dropDirection) => {
    return (
      <Pagination
        data-cy="paginationArea"
        itemCount={filteredEntries.length}
        perPage={entriesPagination.perPage}
        page={entriesPagination.page}
        onSetPage={onSetPage}
        widgetId="pagination-caches"
        onPerPageSelect={onPerPageSelect}
        isCompact
        dropDirection={dropDirection}
      />
    );
  };

  const keyContentTypeOptions = () => {
    return CacheConfigUtils.getContentTypeOptions(cache.encoding.key as EncodingType).map((contentType) => (
      <SelectOption
        id={contentType == ContentType.customType ? 'customtype' : contentType}
        key={contentType as string}
        value={contentType}
      />
    ));
  };

  const searchEntryByKey = () => {
    if (searchValue.length == 0) {
      return;
    }

    getByKey(searchValue, selectSearchOption);
  };

  const buildSearch = (
    <ToolbarGroup variant="filter-group">
      <ToolbarItem>
        <Select
          variant={SelectVariant.single}
          aria-label={'search option'}
          onToggle={() => setIsOpenFilter(!isOpenFilter)}
          onSelect={onSelectFilter}
          selections={selectSearchOption}
          isOpen={isOpenFilter}
          toggleIcon={<FilterIcon />}
          maxHeight={'300px'}
          toggleId="keyType"
        >
          {keyContentTypeOptions()}
        </Select>
      </ToolbarItem>
      <ToolbarFilter categoryName={selectSearchOption}>
        <SearchInput
          name="textSearchByKey"
          id="textSearchByKey"
          placeholder={`Find by ${selectSearchOption}`}
          value={searchValue}
          onChange={(_event, val) => setSearchValue(val)}
          onSearch={() => searchEntryByKey()}
          onClear={() => setSearchValue('')}
        />
      </ToolbarFilter>
    </ToolbarGroup>
  );

  const toolbar = (
    <Toolbar
      id="attribute-search-filter-toolbar"
      clearAllFilters={() => {
        setSearchValue('');
      }}
      style={{ paddingBottom: global_spacer_md.value }}
    >
      <ToolbarContent>
        <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
          {buildSearch}
        </ToolbarToggleGroup>
        <Divider orientation={{ default: 'vertical' }} inset={{ default: 'insetSm' }} />
        {addEntryAction()}
        {clearAllAction()}
        <ToolbarItem variant="pagination">{toolbarPagination('down')}</ToolbarItem>
        <ToolbarItem>
          <Tooltip content={t('caches.entries.pagination-tooltip')}>
            <Button variant="plain">
              <HelpIcon />
            </Button>
          </Tooltip>
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );

  const displayTimeToLive = (entry) => {
    return entry.timeToLive ? entry.timeToLive : t('caches.entries.lifespan-immortal');
  };

  const displayMaxIdle = (entry) => {
    return entry.maxIdle ? entry.maxIdle : t('caches.entries.maxidle-immortal');
  };

  const displayExpires = (entry) => {
    return entry.expires ? entry.expires : t('caches.entries.never-expire');
  };

  return (
    <React.Fragment>
      {totalEntriesCount == 0 ? (
        emptyPage
      ) : (
        <React.Fragment>
          {toolbar}

          <Table className={'entries-table'} aria-label={'entries-table-label'} variant={'compact'}>
            <Thead>
              <Tr>
                <Th colSpan={1}>{columnNames.key}</Th>
                <Th colSpan={1}>{columnNames.value}</Th>
                <Th
                  info={{
                    popover: t('caches.entries.column-lifespan-tooltip', { brandname: brandname }),
                    popoverProps: {
                      headerContent: t('caches.entries.column-lifespan')
                    }
                  }}
                  colSpan={1}
                >
                  {columnNames.lifespan}
                </Th>
                <Th
                  info={{
                    popover: t('caches.entries.column-maxidle-tooltip', { brandname: brandname }),
                    popoverProps: {
                      headerContent: t('caches.entries.column-maxidle')
                    }
                  }}
                  colSpan={1}
                >
                  {columnNames.maxIdle}
                </Th>
                <Th colSpan={2}>{columnNames.expires}</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredEntries.length == 0 ? (
                <Tr>
                  <Td colSpan={6}>
                    <Bullseye>
                      <EmptyState variant={EmptyStateVariant.sm}>
                        <EmptyStateHeader
                          titleText={<>{t('caches.entries.no-filtered-entry')}</>}
                          icon={<EmptyStateIcon icon={SearchIcon} />}
                          headingLevel="h2"
                        />
                        <EmptyStateBody>{t('caches.entries.no-filtered-entry-tooltip')}</EmptyStateBody>
                        <EmptyStateFooter>
                          <EmptyStateActions style={{ marginTop: global_spacer_sm.value }}>
                            <Button
                              data-cy="clearSearch"
                              key="clear-search"
                              variant={ButtonVariant.link}
                              onClick={() => {
                                setSearchValue('');
                              }}
                            >
                              {t('caches.entries.no-filtered-entry-action')}
                            </Button>
                          </EmptyStateActions>
                        </EmptyStateFooter>
                      </EmptyState>
                    </Bullseye>
                  </Td>
                </Tr>
              ) : (
                rows.map((row) => {
                  return (
                    <Tr key={row.key}>
                      <Td dataLabel={columnNames.key}>
                        {displayHighlighted(
                          row.key,
                          cache.encoding.key as EncodingType,
                          row.keyContentType as ContentType
                        )}
                      </Td>
                      <Td dataLabel={columnNames.value}>
                        {displayHighlighted(
                          row.value,
                          cache.encoding.value as EncodingType,
                          row.valueContentType as ContentType
                        )}
                      </Td>
                      <Td dataLabel={columnNames.lifespan}>{displayTimeToLive(row)}</Td>
                      <Td dataLabel={columnNames.maxIdle}>{displayMaxIdle(row)}</Td>
                      <Td dataLabel={columnNames.expires}>{displayExpires(row)}</Td>
                      <Td isActionCell data-cy={`actions-${row.key}`}>
                        <ActionsColumn items={displayActions(row)} />
                      </Td>
                    </Tr>
                  );
                })
              )}
            </Tbody>
          </Table>
          <Toolbar>
            <ToolbarItem variant="pagination">{toolbarPagination('up')}</ToolbarItem>
          </Toolbar>
        </React.Fragment>
      )}
      <CreateOrUpdateEntryForm
        cacheName={props.cacheName}
        cacheEncoding={cache.encoding}
        keyToEdit={keyToEdit}
        keyContentType={keyContentTypeToEdit}
        isModalOpen={isCreateOrUpdateEntryFormOpen}
        closeModal={closeCreateOrEditEntryFormModal}
      />
      <DeleteEntry
        cacheName={props.cacheName}
        cacheEncoding={cache.encoding}
        entryKey={keyToDelete}
        keyContentType={keyContentTypeToEdit}
        isModalOpen={isDeleteEntryModalOpen}
        closeModal={closeDeleteEntryModal}
      />
      <ClearAllEntries
        cacheName={props.cacheName}
        isModalOpen={isClearAllModalOpen}
        closeModal={closeClearAllEntryModal}
      />
    </React.Fragment>
  );
};

export { CacheEntries };
