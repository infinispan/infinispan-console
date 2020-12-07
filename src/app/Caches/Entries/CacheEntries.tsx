import React, { useState } from 'react';
import {
  Bullseye,
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateIcon,
  EmptyStateVariant,
  InputGroup,
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  TextInput,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { CreateOrUpdateEntryForm } from '@app/Caches/Entries/CreateOrUpdateEntryForm';
import cacheService from '@services/cacheService';
import {
  Table,
  TableBody,
  TableHeader,
  TableVariant,
} from '@patternfly/react-table';
import { ClearAllEntries } from '@app/Caches/Entries/ClearAllEntries';
import { DeleteEntry } from '@app/Caches/Entries/DeleteEntry';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { githubGist } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import displayUtils from '@services/displayUtils';
import { ContentType } from '@services/utils';
import { useTranslation } from 'react-i18next';

const CacheEntries = (props: { cacheName: string }) => {
  const [
    isCreateOrUpdateEntryFormOpen,
    setCreateOrUpdateEntryFormOpen,
  ] = useState<boolean>(false);
  const [isDeleteEntryModalOpen, setDeleteEntryModalOpen] = useState<boolean>(
    false
  );
  const [keyToDelete, setKeyToDelete] = useState<string>('');
  const [keyToEdit, setKeyToEdit] = useState<string>('');
  const [isClearAllModalOpen, setClearAllModalOpen] = useState<boolean>(false);
  const [keyToSearch, setKeyToSearch] = useState<string>('');
  const [rows, setRows] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const entryActions = [
    {
      title: t('caches.entries.action-edit'),
      onClick: (event, rowId, rowData, extra) =>
        onClickEditEntryButton(rowData.cells[0].title),
    },
    {
      title: t('caches.entries.action-delete'),
      onClick: (event, rowId, rowData, extra) =>
        onClickDeleteEntryButton(rowData.cells[0].title),
    },
  ];

  const columns = [
    { title: t('caches.entries.column-key') },
    { title: t('caches.entries.column-value') },
    { title: t('caches.entries.column-lifespan') },
    { title: t('caches.entries.column-maxidle') },
    { title: t('caches.entries.column-expires') },
    { title: t('caches.entries.column-created') },
    { title: t('caches.entries.column-lastused') },
    { title: t('caches.entries.column-lastmodified') }
  ];
  const updateRows = (entries: CacheEntry[]) => {
    let rows: { heightAuto: boolean; cells: (string | any)[] }[];

    if (entries.length == 0) {
      rows = [
        {
          heightAuto: true,
          cells: [
            {
              props: { colSpan: 8 },
              title: (
                <Bullseye>
                  <EmptyState variant={EmptyStateVariant.full}>
                    <EmptyStateIcon icon={SearchIcon} />
                    <Title headingLevel="h2" size="lg">
                      {t('caches.entries.get-entry-not-found')} <strong>{keyToSearch}</strong>
                    </Title>
                  </EmptyState>
                </Bullseye>
              ),
            },
          ],
        },
      ];
      setActions([]);
    } else {
      rows = entries.map((entry) => {
        return {
          heightAuto: true,
          cells: [
            { title: entry.key },
            { title: displayValue(entry.value) },
            { title: entry.timeToLive ? entry.timeToLive : t('caches.entries.lifespan-immortal') },
            { title: entry.maxIdle ? entry.maxIdle : t('caches.entries.maxidle-immortal') },
            { title: entry.expires ? entry.expires : t('caches.entries.never-expire') },
            { title: entry.created },
            { title: entry.lastUsed },
            { title: entry.lastModified },
          ],
        };
      });
      setActions(entryActions);
    }
    setRows(rows);
  };

  const displayValue = (value: string) => {
    return (
      <SyntaxHighlighter
        wrapLines={false}
        style={githubGist}
        useInlineStyles={true}
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

  const onClickEditEntryButton = (entryKey: string) => {
    setKeyToEdit(entryKey);
    setCreateOrUpdateEntryFormOpen(true);
  };

  const onClickDeleteEntryButton = (entryKey: string) => {
    setDeleteEntryModalOpen(true);
    setKeyToDelete(entryKey);
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

    cacheService.getEntry(props.cacheName, keyToSearch, kt).then((response) => {
      if (response.isRight()) {
        updateRows([response.value]);
      } else {
        updateRows([]);
      }
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

  return (
    <React.Fragment>
      <Toolbar id="cache-entries-toolbar" style={{ paddingLeft: 0 }}>
        <ToolbarContent>
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
          <ToolbarItem>
            <Button
              key="add-entry-button"
              variant={ButtonVariant.primary}
              onClick={onClickAddEntryButton}
            >
              Add entry
            </Button>
          </ToolbarItem>
          <ToolbarItem>
            <Button
              variant={ButtonVariant.link}
              onClick={onClickClearAllButton}
            >
              Clear all entries
            </Button>
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <CreateOrUpdateEntryForm
        cacheName={props.cacheName}
        keyToEdit={keyToEdit}
        keyContentType={keyType as ContentType}
        isModalOpen={isCreateOrUpdateEntryFormOpen}
        closeModal={closeCreateOrEditEntryFormModal}
      />
      <DeleteEntry
        cacheName={props.cacheName}
        entryKey={keyToDelete}
        keyContentType={keyType as ContentType}
        isModalOpen={isDeleteEntryModalOpen}
        closeModal={closeDeleteEntryModal}
      />
      <ClearAllEntries
        cacheName={props.cacheName}
        isModalOpen={isClearAllModalOpen}
        closeModal={closeClearAllEntryModal}
      />
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
    </React.Fragment>
  );
};

export { CacheEntries };
