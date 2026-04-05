import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Bullseye,
  Button,
  ButtonVariant,
  Card,
  CardBody,
  Checkbox,
  Divider,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
  Flex,
  FlexItem,
  Pagination,
  SearchInput,
  SelectOptionProps,
  Switch,
  Toolbar,
  ToolbarContent,
  ToolbarFilter,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
  Tooltip,
} from '@patternfly/react-core';
import {
  ActionsColumn,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import {
  ColumnsIcon,
  FilterIcon,
  HelpIcon,
  PlusCircleIcon,
  SearchIcon,
} from '@patternfly/react-icons';
import ColumnManagementModal, {
  ColumnManagementModalColumn,
} from '@patternfly/react-component-groups/dist/dynamic/ColumnManagementModal';
import {
  t_global_spacer_md,
  t_global_spacer_sm,
} from '@patternfly/react-tokens';
import SyntaxHighlighter from 'react-syntax-highlighter';
import displayUtils from '@services/displayUtils';
import { useTranslation } from 'react-i18next';
import { useCacheDetail, useCacheEntries } from '@app/hooks/cachesHook';
import { ConsoleServices } from '@services/ConsoleServices';
import { useConnectedUser } from '@app/hooks/userManagementHook';
import { ConsoleACL } from '@services/securityService';
import { CacheConfigUtils } from '@services/cacheConfigUtils';
import { ContentType, EncodingType } from '@services/infinispanRefData';
import { CreateOrUpdateEntryForm } from '@app/Caches/Entries/CreateOrUpdateEntryForm';
import { ClearAllEntries } from '@app/Caches/Entries/ClearAllEntries';
import { DeleteEntry } from '@app/Caches/Entries/DeleteEntry';
import { ThemeContext } from '@app/providers/ThemeProvider';
import { SelectSingle } from '@app/Common/SelectSingle';
import {
  selectOptionProps,
  selectOptionPropsFromArray,
} from '@utils/selectOptionPropsCreator';
import { useLocalStorage } from '@app/utils/localStorage';

const CacheEntries = () => {
  const {
    cacheEntries,
    totalEntriesCount,
    loadingEntries,
    errorEntries,
    infoEntries,
    reloadEntries,
    getByKey,
    limit,
    setLimit,
  } = useCacheEntries();
  const { cache } = useCacheDetail();
  const { connectedUser } = useConnectedUser();
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const encodingDocs = t('brandname.encoding-docs-link');
  const [isCreateOrUpdateEntryFormOpen, setCreateOrUpdateEntryFormOpen] =
    useState<boolean>(false);
  const [isDeleteEntryModalOpen, setDeleteEntryModalOpen] =
    useState<boolean>(false);
  const [keyToDelete, setKeyToDelete] = useState<string>('');
  const [keyToEdit, setKeyToEdit] = useState<string>('');
  const [keyContentTypeToEdit, setKeyContentTypeToEdit] = useState<ContentType>(
    ContentType.StringContentType,
  );
  const [isClearAllModalOpen, setClearAllModalOpen] = useState<boolean>(false);
  const [rows, setRows] = useState<CacheEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<CacheEntry[]>([]);
  const [selectSearchOption, setSelectSearchOption] = useState<ContentType>(
    ContentType.string,
  );
  const [searchValue, setSearchValue] = useState<string>('');
  const [trim, setTrim] = useState<boolean>(false);
  const [entriesPagination, setEntriesPagination] =
    useLocalStorage<PaginationType>('cache-entries-table', {
      page: 1,
      perPage: 10,
    });

  const { syntaxHighLighterTheme } = useContext(ThemeContext);
  const [isColumnModalOpen, setColumnModalOpen] = useState(false);

  const defaultColumns: ColumnManagementModalColumn[] = [
    {
      title: t('caches.entries.column-key'),
      key: 'key',
      isShownByDefault: true,
      isShown: true,
      isUntoggleable: true,
    },
    {
      title: t('caches.entries.column-value'),
      key: 'value',
      isShownByDefault: true,
      isShown: true,
      isUntoggleable: true,
    },
    {
      title: t('caches.entries.column-lifespan'),
      key: 'lifespan',
      isShownByDefault: true,
      isShown: true,
    },
    {
      title: t('caches.entries.column-maxidle'),
      key: 'maxIdle',
      isShownByDefault: true,
      isShown: true,
    },
    {
      title: t('caches.entries.column-expires'),
      key: 'expires',
      isShownByDefault: false,
      isShown: false,
    },
  ];

  const [savedColumnVisibility, setSavedColumnVisibility] = useLocalStorage<
    Record<string, boolean>
  >('cache-entries-columns', {});

  const [columns, setColumns] = useState<ColumnManagementModalColumn[]>(() =>
    defaultColumns.map((col) => ({
      ...col,
      isShown:
        col.key in savedColumnVisibility
          ? savedColumnVisibility[col.key]
          : col.isShown,
    })),
  );

  const applyColumns = (newColumns: ColumnManagementModalColumn[]) => {
    setColumns(newColumns);
    const visibility: Record<string, boolean> = {};
    newColumns.forEach((col) => (visibility[col.key] = col.isShown ?? false));
    setSavedColumnVisibility(visibility);
  };

  const isColumnShown = (key: string) =>
    columns.find((c) => c.key === key)?.isShown ?? false;

  useEffect(() => {
    if (cache.encoding?.key == EncodingType.Protobuf) {
      setSelectSearchOption(ContentType.string);
      setKeyContentTypeToEdit(ContentType.string);
    } else if (
      cache.encoding?.key == EncodingType.Java ||
      cache.encoding?.key == EncodingType.JBoss ||
      cache.encoding?.key == EncodingType.JavaSerialized
    ) {
      setSelectSearchOption(ContentType.StringContentType);
      setKeyContentTypeToEdit(ContentType.StringContentType);
    } else if (cache.encoding?.key == EncodingType.XML) {
      setSelectSearchOption(ContentType.XML);
      setKeyContentTypeToEdit(ContentType.XML);
    } else if (cache.encoding?.key == EncodingType.JSON) {
      setSelectSearchOption(ContentType.JSON);
      setSelectSearchOption(ContentType.JSON);
    } else if (cache.encoding?.key == EncodingType.Text) {
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
      const initSlice =
        (entriesPagination.page - 1) * entriesPagination.perPage;
      const updateRows = filteredEntries.slice(
        initSlice,
        initSlice + entriesPagination.perPage,
      );
      setRows(updateRows);
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
      page: pageNumber,
    });
  };

  const onPerPageSelect = (_event, perPage) => {
    setEntriesPagination({
      page: 1,
      perPage: perPage,
    });
  };

  const displayActions = (row) => {
    if (
      !ConsoleServices.security().hasCacheConsoleACL(
        ConsoleACL.WRITE,
        cache.name,
        connectedUser,
      )
    ) {
      return <Td></Td>;
    }

    const actions = [];
    if (cache.updateEntry) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      actions.push({
        'aria-label': 'editEntryAction',
        title: t('caches.entries.action-edit'),
        onClick: () =>
          onClickEditEntryButton(row.key, row.keyContentType as ContentType),
      });
    }
    if (cache.deleteEntry) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      actions.push({
        'aria-label': 'deleteEntryAction',
        title: t('caches.entries.action-delete'),
        onClick: () =>
          onClickDeleteEntryButton(row.key, row.keyContentType as ContentType),
      });
    }

    if (actions.length == 0) {
      return undefined;
    }

    return (
      <Td isActionCell data-cy={`actions-${row.key}`}>
        <ActionsColumn items={actions} />
      </Td>
    );
  };

  const columnNames = {
    key: t('caches.entries.column-key'),
    value: t('caches.entries.column-value'),
    lifespan: t('caches.entries.column-lifespan'),
    maxIdle: t('caches.entries.column-maxidle'),
    expires: t('caches.entries.column-expires'),
  };

  const displayHighlighted = (
    value: string,
    encodingType: EncodingType,
    contentType?: ContentType,
  ) => {
    const highlightedContent = (
      <SyntaxHighlighter
        language="json"
        lineProps={{ style: { wordBreak: 'break-all' } }}
        style={syntaxHighLighterTheme}
        useInlineStyles={true}
        wrapLongLines={true}
      >
        {trim
          ? displayUtils.formatContentToDisplayWithTruncate(value, contentType)
          : displayUtils.formatContentToDisplay(value, contentType)}
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

  const onClickEditEntryButton = (
    entryKey: string,
    keyContentType: ContentType,
  ) => {
    setKeyToEdit(entryKey);
    setKeyContentTypeToEdit(keyContentType);
    setCreateOrUpdateEntryFormOpen(true);
  };

  const onClickDeleteEntryButton = (
    entryKey: string,
    keyContentType: ContentType,
  ) => {
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

  const addEntryAction = () => {
    if (
      !ConsoleServices.security().hasCacheConsoleACL(
        ConsoleACL.WRITE,
        cache.name,
        connectedUser,
      )
    ) {
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
    if (
      !ConsoleServices.security().hasCacheConsoleACL(
        ConsoleACL.BULK_WRITE,
        cache.name,
        connectedUser,
      )
    ) {
      return '';
    }

    return (
      <ToolbarItem>
        <Button
          data-cy="clearAllButton"
          variant={ButtonVariant.link}
          onClick={onClickClearAllButton}
        >
          {t('caches.entries.clear-entry-button-label')}
        </Button>
      </ToolbarItem>
    );
  };

  const emptyPage = (
    <EmptyState
      variant={EmptyStateVariant.lg}
      titleText={<>{t('caches.entries.empty-cache')}</>}
      icon={PlusCircleIcon}
      headingLevel="h4"
    >
      <EmptyStateBody>
        {infoEntries ? t(infoEntries) : t('caches.entries.empty-cache-body')}
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions style={{ marginTop: t_global_spacer_sm.value }}>
          {addEntryAction()}
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
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

  const keyContentTypeOptions = (): SelectOptionProps[] => {
    return selectOptionPropsFromArray(
      CacheConfigUtils.getContentTypeOptions(
        cache.encoding?.key as EncodingType,
      ),
    );
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
        <SelectSingle
          id={'contentTypeFilter'}
          placeholder={''}
          selected={selectSearchOption}
          options={keyContentTypeOptions()}
          style={{ width: '160px' }}
          onSelect={(value) => setSelectSearchOption(value)}
        />
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
      style={{ paddingBottom: t_global_spacer_md.value }}
    >
      <ToolbarContent>
        <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
          {buildSearch}
        </ToolbarToggleGroup>
        <Divider
          orientation={{ default: 'vertical' }}
          inset={{ default: 'insetSm' }}
        />
        {addEntryAction()}
        {clearAllAction()}
        <ToolbarItem>
          <SelectSingle
            id={'view'}
            placeholder={'100'}
            selected={limit}
            options={selectOptionProps(['100', '500', '1000'])}
            style={{ width: '100px' }}
            onSelect={(value) => setLimit(value)}
          />
          <Tooltip
            content={t('caches.entries.pagination-tooltip', { number: limit })}
          >
            <Button variant="plain">
              <HelpIcon />
            </Button>
          </Tooltip>
        </ToolbarItem>
      </ToolbarContent>
      <ToolbarContent>
        <ToolbarItem>
          <Flex>
            <FlexItem>
              <Button
                data-cy="manageColumnsButton"
                variant={ButtonVariant.link}
                onClick={() => setColumnModalOpen(true)}
                icon={<ColumnsIcon />}
              >
                {t('caches.entries.manage-columns')}
              </Button>
            </FlexItem>
            <FlexItem data-cy="truncateSwitch">
              <Switch
                label={t('caches.entries.truncate-values')}
                id="checkbox-trim"
                isChecked={trim}
                hasCheckIcon
                onChange={() => setTrim(!trim)}
              />
            </FlexItem>
          </Flex>
        </ToolbarItem>
        <ToolbarItem variant="pagination">
          {toolbarPagination('down')}
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );

  const displayTimeToLive = (entry) => {
    return entry.timeToLive
      ? entry.timeToLive
      : t('caches.entries.lifespan-immortal');
  };

  const displayMaxIdle = (entry) => {
    return entry.maxIdle ? entry.maxIdle : t('caches.entries.maxidle-immortal');
  };

  const displayExpires = (entry) => {
    return entry.expires ? entry.expires : t('caches.entries.never-expire');
  };

  const encodingMessageDisplay = () => {
    if (
      !ConsoleServices.security().hasCacheConsoleACL(
        ConsoleACL.READ,
        cache.name,
        connectedUser,
      )
    ) {
      return '';
    }
    const encodingKey = CacheConfigUtils.toEncoding(cache.encoding?.key);
    const encodingValue = CacheConfigUtils.toEncoding(cache.encoding?.value);
    if (
      encodingKey == EncodingType.Java ||
      encodingKey == EncodingType.JavaSerialized ||
      encodingKey == EncodingType.JBoss ||
      encodingKey == EncodingType.Octet ||
      encodingValue == EncodingType.Java ||
      encodingValue == EncodingType.JavaSerialized ||
      encodingValue == EncodingType.JBoss ||
      encodingValue == EncodingType.Octet
    ) {
      return (
        <Alert
          isInline
          title={t('caches.configuration.pojo-encoding', {
            brandname: brandname,
            encodingKey: encodingKey,
            encodingValue: encodingValue,
          })}
          variant={AlertVariant.info}
          actionLinks={
            <AlertActionLink
              onClick={() => window.open(encodingDocs, '_blank')}
            >
              {t('caches.configuration.encoding-docs-message')}
            </AlertActionLink>
          }
        />
      );
    }
    return '';
  };

  if (!cache.started) {
    // Don't display anything if the cache is not started
    return <></>;
  }
  return (
    <Card isPlain isFullHeight>
      <CardBody>
        {encodingMessageDisplay()}
        {totalEntriesCount == 0 ? (
          emptyPage
        ) : (
          <React.Fragment>
            {toolbar}

            <Table
              className={'entries-table'}
              aria-label={'entries-table-label'}
              variant={'compact'}
            >
              <Thead>
                <Tr>
                  <Th colSpan={1}>{columnNames.key}</Th>
                  <Th colSpan={1}>{columnNames.value}</Th>
                  {isColumnShown('lifespan') && (
                    <Th
                      info={{
                        popover: t('caches.entries.column-lifespan-tooltip', {
                          brandname: brandname,
                        }),
                        popoverProps: {
                          headerContent: t('caches.entries.column-lifespan'),
                        },
                      }}
                      colSpan={1}
                    >
                      {columnNames.lifespan}
                    </Th>
                  )}
                  {isColumnShown('maxIdle') && (
                    <Th
                      info={{
                        popover: t('caches.entries.column-maxidle-tooltip', {
                          brandname: brandname,
                        }),
                        popoverProps: {
                          headerContent: t('caches.entries.column-maxidle'),
                        },
                      }}
                      colSpan={1}
                    >
                      {columnNames.maxIdle}
                    </Th>
                  )}
                  {isColumnShown('expires') && (
                    <Th colSpan={1}>{columnNames.expires}</Th>
                  )}
                  <Th />
                </Tr>
              </Thead>
              <Tbody>
                {filteredEntries.length == 0 ? (
                  <Tr>
                    <Td colSpan={6}>
                      <Bullseye>
                        <EmptyState
                          variant={EmptyStateVariant.sm}
                          titleText={
                            <>{t('caches.entries.no-filtered-entry')}</>
                          }
                          icon={SearchIcon}
                          headingLevel="h2"
                        >
                          <EmptyStateBody>
                            {t('caches.entries.no-filtered-entry-tooltip')}
                          </EmptyStateBody>
                          <EmptyStateFooter>
                            <EmptyStateActions
                              style={{ marginTop: t_global_spacer_sm.value }}
                            >
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
                            cache.encoding?.key as EncodingType,
                            row.keyContentType as ContentType,
                          )}
                        </Td>
                        <Td dataLabel={columnNames.value}>
                          {displayHighlighted(
                            row.value,
                            cache.encoding?.value as EncodingType,
                            row.valueContentType as ContentType,
                          )}
                        </Td>
                        {isColumnShown('lifespan') && (
                          <Td dataLabel={columnNames.lifespan}>
                            {displayTimeToLive(row)}
                          </Td>
                        )}
                        {isColumnShown('maxIdle') && (
                          <Td dataLabel={columnNames.maxIdle}>
                            {displayMaxIdle(row)}
                          </Td>
                        )}
                        {isColumnShown('expires') && (
                          <Td dataLabel={columnNames.expires}>
                            {displayExpires(row)}
                          </Td>
                        )}
                        {displayActions(row)}
                      </Tr>
                    );
                  })
                )}
              </Tbody>
            </Table>
            <Toolbar>
              <ToolbarItem variant="pagination">
                {toolbarPagination('up')}
              </ToolbarItem>
            </Toolbar>
          </React.Fragment>
        )}
        <CreateOrUpdateEntryForm
          cacheName={cache.name}
          cacheEncoding={cache.encoding!}
          keyToEdit={keyToEdit}
          keyContentType={keyContentTypeToEdit}
          isModalOpen={isCreateOrUpdateEntryFormOpen}
          closeModal={closeCreateOrEditEntryFormModal}
        />
        <DeleteEntry
          cacheName={cache.name}
          cacheEncoding={cache.encoding!}
          entryKey={keyToDelete}
          keyContentType={keyContentTypeToEdit}
          isModalOpen={isDeleteEntryModalOpen}
          closeModal={closeDeleteEntryModal}
        />
        <ClearAllEntries
          cacheName={cache.name}
          isModalOpen={isClearAllModalOpen}
          closeModal={closeClearAllEntryModal}
        />
        <ColumnManagementModal
          appliedColumns={columns}
          applyColumns={applyColumns}
          isOpen={isColumnModalOpen}
          onClose={() => setColumnModalOpen(false)}
        />
      </CardBody>
    </Card>
  );
};

export { CacheEntries };
