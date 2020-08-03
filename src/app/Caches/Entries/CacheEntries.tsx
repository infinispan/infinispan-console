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
import { KeyContentType } from '@services/utils';

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

  const entryActions = [
    {
      title: 'Edit',
      onClick: (event, rowId, rowData, extra) =>
        onClickEditEntryButton(rowData.cells[0].title),
    },
    {
      title: 'Delete',
      onClick: (event, rowId, rowData, extra) =>
        onClickDeleteEntryButton(rowData.cells[0].title),
    },
  ];

  const columns = [
    { title: 'Key' },
    { title: 'Value' },
    { title: 'Time to live' },
    { title: 'Max idle' },
    { title: 'Expires' },
    { title: 'Created' },
    { title: 'Last used' },
    { title: 'Last modified' },
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
                  <EmptyState variant={EmptyStateVariant.small}>
                    <EmptyStateIcon icon={SearchIcon} />
                    <Title headingLevel="h2" size="lg">
                      Entry with key <strong>{keyToSearch}</strong> not found.
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
            { title: entry.timeToLive ? entry.timeToLive : 'Forever' },
            { title: entry.maxIdle ? entry.maxIdle : 'Forever' },
            { title: entry.expires ? entry.expires : 'Never' },
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

  const searchEntryByKey = () => {
    if (keyToSearch.length == 0) {
      return;
    }

    cacheService
      .getEntry(props.cacheName, keyToSearch, keyType as KeyContentType)
      .then((response) => {
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
    return Object.keys(KeyContentType).map((key) => (
      <SelectOption key={key} value={KeyContentType[key]} />
    ));
  };

  const [expandedKey, setExpandedKey] = useState(false);
  const [keyType, setKeyType] = useState<
    string | SelectOptionObject | (string | SelectOptionObject)[]
  >(KeyContentType.StringContentType);

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
                aria-label="search by key textfield"
                placeholder={'Get by key as ' + keyType}
                size={50}
                onChange={onChangeKeySearch}
                onKeyPress={searchEntryOnKeyPress}
              />
              <Button
                variant="control"
                aria-label="search button for search input"
                onClick={searchEntryByKey}
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
        isModalOpen={isCreateOrUpdateEntryFormOpen}
        closeModal={closeCreateOrEditEntryFormModal}
      />
      <DeleteEntry
        cacheName={props.cacheName}
        entryKey={keyToDelete}
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
