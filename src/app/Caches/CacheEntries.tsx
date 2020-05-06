import React, { useEffect, useState } from 'react';
import {
  Bullseye,
  Button,
  ButtonVariant,
  Card,
  CardBody,
  DataToolbar,
  DataToolbarContent,
  DataToolbarItem,
  EmptyState,
  EmptyStateIcon,
  EmptyStateVariant,
  InputGroup,
  TextInput,
  Title
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { AddEntryForm } from '@app/Caches/AddEntryForm';
import cacheService from '../../services/cacheService';
import {
  Table,
  TableBody,
  TableHeader,
  TableVariant
} from '@patternfly/react-table';
import { MoreInfoTooltip } from '@app/Common/MoreInfoTooltip';
import { ClearAllEntries } from '@app/Caches/ClearAllEntries';
import { DeleteEntry } from '@app/Caches/DeleteEntry';
import { RecentActivityTable } from '@app/Caches/RecentActivityTable';
import { useRecentActivity } from '@app/utils/useRecentActivity';

const CacheEntries: React.FunctionComponent<any> = (props: {
  cacheName: string;
}) => {
  const { activities } = useRecentActivity();
  const [isAddEntryFormOpen, setAddEntryFormOpen] = useState<boolean>(false);
  const [isDeleteEntryModalOpen, setDeleteEntryModalOpen] = useState<boolean>(
    false
  );
  const [keyToDelete, setKeyToDelete] = useState<string>('');
  const [isClearAllModalOpen, setClearAllModalOpen] = useState<boolean>(false);
  const [keyToSearch, setKeyToSearch] = useState<string>('');
  const [rows, setRows] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);

  const entryActions = [
    {
      title: 'Delete',
      onClick: (event, rowId, rowData, extra) =>
        onClickDeleteEntryButton(rowData.cells[0].title)
    }
  ];

  const columns = [
    { title: 'Key' },
    { title: 'Value' },
    {
      title: (
        <MoreInfoTooltip
          label="Time to live"
          toolTip={
            'The number of seconds before the entry is automatically deleted.'
          }
        />
      )
    },
    {
      title: (
        <MoreInfoTooltip
          label="Max Idle"
          toolTip={
            'The number of seconds that entries can be idle. ' +
            'If a read or write operation does not occur for an entry after the maximum idle time elapses, ' +
            'the entry is automatically deleted.'
          }
        />
      )
    },
    { title: 'Expires' },
    { title: 'Created' },
    { title: 'Last used' },
    { title: 'Last modified' }
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
              )
            }
          ]
        }
      ];
      setActions([]);
    } else {
      rows = entries.map(entry => {
        return {
          heightAuto: true,
          cells: [
            { title: entry.key },
            { title: entry.value },
            { title: entry.timeToLive ? entry.timeToLive : 'Forever' },
            { title: entry.maxIdle ? entry.maxIdle : 'Forever' },
            { title: entry.expires ? entry.expires : 'Never' },
            { title: entry.created },
            { title: entry.lastUsed },
            { title: entry.lastModified }
          ]
        };
      });
      setActions(entryActions);
    }
    setRows(rows);
  };

  const onClickAddEntryButton = () => {
    setAddEntryFormOpen(true);
  };

  const onClickClearAllButton = () => {
    setClearAllModalOpen(true);
  };

  const onClickDeleteEntryButton = (entryKey: string) => {
    setDeleteEntryModalOpen(true);
    setKeyToDelete(entryKey);
  };

  const closeAddEntryFormModal = () => {
    setAddEntryFormOpen(false);
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

  const onChangeKeySearch = value => {
    if (value.length == 0) {
      setRows([]);
    }
    setKeyToSearch(value.trim());
  };

  const searchEntryByKey = () => {
    if (keyToSearch.length == 0) {
      return;
    }

    cacheService.getEntry(props.cacheName, keyToSearch).then(response => {
      if (response.isRight()) {
        updateRows([response.value]);
      } else {
        updateRows([]);
      }
    });
  };

  const searchEntryOnKeyPress = event => {
    if (event.key === 'Enter') {
      searchEntryByKey();
    }
  };

  return (
    <React.Fragment>
      <Card>
        <CardBody>
          <DataToolbar id="cache-entries-toolbar">
            <DataToolbarContent>
              <DataToolbarItem>
                <InputGroup>
                  <TextInput
                    name="textSearchByKey"
                    id="textSearchByKey"
                    type="search"
                    aria-label="search by key textfield"
                    placeholder={'Get by key'}
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
              </DataToolbarItem>
              <DataToolbarItem>
                <Button
                  key="add-entry-button"
                  variant={ButtonVariant.primary}
                  onClick={onClickAddEntryButton}
                >
                  Add entry
                </Button>
              </DataToolbarItem>
              <DataToolbarItem>
                <Button
                  variant={ButtonVariant.link}
                  onClick={onClickClearAllButton}
                >
                  Clear all entries
                </Button>
              </DataToolbarItem>
            </DataToolbarContent>
          </DataToolbar>
          <AddEntryForm
            cacheName={props.cacheName}
            isModalOpen={isAddEntryFormOpen}
            closeModal={closeAddEntryFormModal}
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
        </CardBody>
      </Card>
      <RecentActivityTable />
    </React.Fragment>
  );
};

export { CacheEntries };
