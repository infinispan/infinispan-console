import React, {useEffect, useState} from 'react';
import {
  Button,
  ButtonVariant,
  InputGroup,
  Pagination,
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  Text,
  TextContent,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarItemVariant,
} from '@patternfly/react-core';
import {SearchIcon} from '@patternfly/react-icons';
import {CreateOrUpdateEntryForm} from '@app/Caches/Entries/CreateOrUpdateEntryForm';
import {cellWidth, classNames, Table, TableBody, TableHeader, TableVariant, wrappable,} from '@patternfly/react-table';
import {ClearAllEntries} from '@app/Caches/Entries/ClearAllEntries';
import {DeleteEntry} from '@app/Caches/Entries/DeleteEntry';
import SyntaxHighlighter from 'react-syntax-highlighter';
import {githubGist} from 'react-syntax-highlighter/dist/esm/styles/hljs';
import displayUtils from '@services/displayUtils';
import {ContentType, RestUtils} from '@services/utils';
import {useTranslation} from 'react-i18next';
import {TableEmptyState} from '@app/Common/TableEmptyState';
import {useCacheDetail, useCacheEntries} from '@app/services/cachesHook';
import {MoreInfoTooltip} from "@app/Common/MoreInfoTooltip";
import {ConsoleServices} from "@services/ConsoleServices";
import {useConnectedUser} from "@app/services/userManagementHook";
import {ConsoleACL} from "@services/securityService";

const CacheEntries = (props: { cacheName: string }) => {
  const [
    isCreateOrUpdateEntryFormOpen,
    setCreateOrUpdateEntryFormOpen,
  ] = useState<boolean>(false);

  const {
    cacheEntries,
    loadingEntries,
    errorEntries,
    infoEntries,
    reloadEntries,
  } = useCacheEntries();
  const { cache } = useCacheDetail(props.cacheName);
  const {connectedUser} = useConnectedUser();
  const [isDeleteEntryModalOpen, setDeleteEntryModalOpen] = useState<boolean>(
    false
  );
  const [keyToDelete, setKeyToDelete] = useState<string>('');
  const [keyToEdit, setKeyToEdit] = useState<string>('');
  const [keyContentTypeToEdit, setKeyContentTypeToEdit] = useState<ContentType>(ContentType.StringContentType);
  const [isClearAllModalOpen, setClearAllModalOpen] = useState<boolean>(false);
  const [keyToSearch, setKeyToSearch] = useState<string>('');
  const [rows, setRows] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [entriesPagination, setEntriesPagination] = useState({
    page: 1,
    perPage: 10,
  });

  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  useEffect(() => {
    updateRows(cacheEntries, loadingEntries, errorEntries, infoEntries);
  }, [loadingEntries, cacheEntries]);

  useEffect(() => {
    if (keyToSearch == '') {
      reloadEntries();
    }
  }, [keyToSearch]);

  useEffect(() => {
    let paginationUpgrade = false;
    // Upgrade Pagination in necessary
    if (entriesPagination.page > 1) {
      const completePagesNum = Math.floor(
        cacheEntries.length / entriesPagination.perPage
      );
      const lastPageCount = cacheEntries.length % entriesPagination.perPage;
      if (lastPageCount == 0 && entriesPagination.page > completePagesNum) {
        paginationUpgrade = true;
        setEntriesPagination({
          page: completePagesNum,
          perPage: entriesPagination.perPage,
        });
      }
    }

    if (!paginationUpgrade) {
      updateRows(cacheEntries, loadingEntries, errorEntries, infoEntries);
    }
  }, [cacheEntries]);

  useEffect(() => {
      updateRows(cacheEntries, loadingEntries, errorEntries, infoEntries);
  }, [entriesPagination]);

  const entryActions = [
    {
      title: t('caches.entries.action-edit'),
      onClick: (event, rowId, rowData, extra) =>
        onClickEditEntryButton(rowData.cells[0].keyForAction, rowData.cells[0].keyContentType as ContentType),
    },
    {
      title: t('caches.entries.action-delete'),
      onClick: (event, rowId, rowData, extra) =>
        onClickDeleteEntryButton(rowData.cells[0].keyForAction, rowData.cells[0].keyContentType as ContentType),
    },
  ];

  const columns = [
    { title: t('caches.entries.column-key'), transforms: [cellWidth(30)]},
    { title: t('caches.entries.column-value'), transforms: [cellWidth(40)]},
    { title: t('caches.entries.column-lifespan'), transforms: [cellWidth(10)] },
    { title: t('caches.entries.column-maxidle'), transforms: [cellWidth(10)] },
    { title: t('caches.entries.column-expires'), transforms: [cellWidth(10)] }
  ];
  const displayEmptyMessage = (info:string) => {
    if(keyToSearch.trim() != '') {
      return (
        <Text>
          {t('caches.entries.get-entry-not-found')} <strong>{keyToSearch}</strong>
        </Text>
      )
    }

    return (
      <Text>
        {info? info : t('caches.entries.empty-cache')}
      </Text>
    )
  }

  const updateRows = (
    entries: CacheEntry[],
    loading: boolean,
    error: string,
    info: string
  ) => {
    const initSlice = (entriesPagination.page - 1) * entriesPagination.perPage;
    const currentPageEntries = entries.slice(
      initSlice,
      initSlice + entriesPagination.perPage
    );

    let rows: { heightAuto: boolean; cells: (string | any)[] }[];

    if (currentPageEntries.length == 0) {
      rows = [
        {
          heightAuto: true,
          cells: [
            {
              props: { colSpan: 8 },
              title: (
                <TableEmptyState
                  loading={loading}
                  error={error}
                  empty={
                    <TextContent>
                      {displayEmptyMessage(info)}
                    </TextContent>
                  }
                />
              ),
            },
          ],
        },
      ];
      setActions([]);
    } else {
      rows = currentPageEntries.map((entry) => {
        let keyForAction = entry.key;
        let keyContentType = entry.keyContentType;
        const isProtobuf = RestUtils.isProtobufCache(cache.configuration.config);
        if (isProtobuf[0]) {
          keyForAction = RestUtils.extractValueFromProtobufType(entry.key);
        }

        return {
          heightAuto: true,
          cells: [
            { title: displayHighlighted(entry.key), keyForAction: keyForAction, keyContentType: keyContentType },
            { title: displayHighlighted(entry.value) },
            {
              title: entry.timeToLive
                ? entry.timeToLive
                : t('caches.entries.lifespan-immortal'),
            },
            {
              title: entry.maxIdle
                ? entry.maxIdle
                : t('caches.entries.maxidle-immortal'),
            },
            {
              title: entry.expires
                ? entry.expires
                : t('caches.entries.never-expire'),
            }
          ],
        };
      });
      setActions(entryActions);
    }
    setRows(rows);
  };

  const displayHighlighted = (value: string) => {
    return (
      <SyntaxHighlighter
        lineProps={{style: {wordBreak: 'break-all'}}}
        style={githubGist}
        useInlineStyles={true}
        wrapLongLines={true}
      >
        {displayUtils.displayValue(value)}
      </SyntaxHighlighter>
    );
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

  const onClickDeleteEntryButton = (entryKey: string,  keyContentType: ContentType) => {
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

  const onChangeKeySearch = (value) => {
    if (value.length == 0) {
      setRows([]);
    }
    setKeyToSearch(value.trim());
  };

  const searchEntryByKey = (kt?: ContentType) => {
    if (keyToSearch.length == 0) {
      return;
    }
    if (!kt) {
      kt = keyType as ContentType;
    }
    updateRows([], true, '', '');
    ConsoleServices.caches().getEntry(props.cacheName, keyToSearch, kt).then((response) => {
      let entries: CacheEntry[] = [];
      let error = '';

      if (response.isRight()) {
        entries = [response.value];
      } else if (response.isLeft() && !response.value.success) {
        error = response.value.message;
      }
      updateRows(entries, false, error, infoEntries);
    });
  };

  const searchEntryOnKeyPress = (event) => {
    if (event.key === 'Enter') {
      searchEntryByKey();
    }
  };
  const keyContentTypeOptions = () => {
    return Object.keys(ContentType).map((key) => (
      <SelectOption key={key} value={ContentType[key]} />
    ));
  };

  const [expandedKey, setExpandedKey] = useState(false);
  const [keyType, setKeyType] = useState<
    string | SelectOptionObject | (string | SelectOptionObject)[]
  >(ContentType.StringContentType);

  const buildPagination = () => {
    return (
        <Pagination
          itemCount={cacheEntries.length}
          perPage={entriesPagination.perPage}
          page={entriesPagination.page}
          onSetPage={(_event, pageNumber) =>
            setEntriesPagination({
              page: pageNumber,
              perPage: entriesPagination.perPage,
            })
          }
          widgetId="pagination-entries"
          onPerPageSelect={(_event, perPage) =>
            setEntriesPagination({
              page: 1,
              perPage: perPage,
            })
          }
          isCompact
        />
    );
  };

  const secondRowItems = (
      <Toolbar>
        <ToolbarContent>
          <ToolbarItem variant={ToolbarItemVariant.pagination} alignment={{ default: "alignRight"}}>
            {buildPagination()}
          </ToolbarItem>
          <ToolbarItem><MoreInfoTooltip
            label={''}
            toolTip={'Shows up to 100 entries of the cache'}
          /></ToolbarItem>
        </ToolbarContent>
      </Toolbar>
  );

  const addEntryAction = () => {
    if(!ConsoleServices.security().hasCacheConsoleACL(ConsoleACL.WRITE, cache.name, connectedUser)) {
      return '';
    }

    return (
        <ToolbarItem>
          <Button
            key="add-entry-button"
            variant={ButtonVariant.primary}
            onClick={onClickAddEntryButton}
          >
            Add entry
          </Button>
        </ToolbarItem>
    )
  }

  const clearAllAction = () => {
    if(!ConsoleServices.security().hasCacheConsoleACL(ConsoleACL.BULK_WRITE, cache.name, connectedUser)) {
      return '';
    }

    return (
        <ToolbarItem>
          <Button
            variant={ButtonVariant.link}
            onClick={onClickClearAllButton}
          >
            Clear all entries
          </Button>
        </ToolbarItem>
    )
  }

  return (
    <React.Fragment>
      <Toolbar id="cache-entries-toolbar" style={{ paddingLeft: 0 }}>
        <ToolbarContent>
          <ToolbarGroup>
            <ToolbarItem>
              <Select
                width={125}
                variant={SelectVariant.single}
                aria-label="Select Key Content Type"
                onToggle={(isExpanded) => setExpandedKey(isExpanded)}
                onSelect={(event, selection) => {
                  setKeyType(selection);
                  setExpandedKey(false);
                  searchEntryByKey(selection as ContentType);
                }}
                selections={keyType}
                isOpen={expandedKey}
              >
                {keyContentTypeOptions()}
              </Select>
            </ToolbarItem>
            <ToolbarItem>
              <InputGroup>
                <TextInput
                  name="textSearchByKey"
                  id="textSearchByKey"
                  type="search"
                  aria-label={t('caches.entries.get-entry-label')}
                  placeholder={t('caches.entries.get-entry-text') + keyType}
                  size={50}
                  onChange={onChangeKeySearch}
                  onKeyPress={searchEntryOnKeyPress}
                />
                <Button
                  variant="control"
                  aria-label={t('caches.entries.get-entry-button-label')}
                  onClick={() => searchEntryByKey()}
                >
                  <SearchIcon />
                </Button>
              </InputGroup>
            </ToolbarItem>
            {addEntryAction()}
            {clearAllAction()}
          </ToolbarGroup>
        </ToolbarContent>
      </Toolbar>
      {secondRowItems}
      <Table
        variant={TableVariant.compact}
        aria-label="Entries"
        cells={columns}
        rows={rows}
        actions={actions}
        className={'entries-table'}
      >
        <TableHeader />
        <TableBody />
      </Table>
      <CreateOrUpdateEntryForm
        cacheName={props.cacheName}
        keyToEdit={keyToEdit}
        keyContentType={keyContentTypeToEdit}
        isModalOpen={isCreateOrUpdateEntryFormOpen}
        closeModal={closeCreateOrEditEntryFormModal}
      />
      <DeleteEntry
        cacheName={props.cacheName}
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
