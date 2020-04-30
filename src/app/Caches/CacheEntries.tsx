import React, { useState } from 'react';
import {
  Alert,
  AlertActionCloseButton,
  AlertGroup,
  Button,
  ButtonVariant,
  DataToolbar,
  DataToolbarContent,
  DataToolbarItem,
  InputGroup,
  TextInput
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { AddEntryForm } from '@app/Caches/AddEntryForm';

const CacheEntries: React.FunctionComponent<any> = (props: {
  cacheName: string;
}) => {
  const [isAddEntryFormOpen, setAddEntryFormOpen] = useState<boolean>(false);

  const onClickAddEntryButton = () => {
    setAddEntryFormOpen(true);
  };

  const closeAddEntryFormModal = () => {
    setAddEntryFormOpen(false);
  };

  return (
    <DataToolbar id="cache-entries-toolbar">
      <DataToolbarContent>
        <DataToolbarItem>
          <InputGroup>
            <TextInput
              name="textSearchByKey"
              id="textSearchByKey"
              type="search"
              aria-label="search by key"
              placeholder={'Get by key'}
              size={50}
            />
            <Button
              variant="control"
              aria-label="search button for search input"
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
          <AddEntryForm
            cacheName={props.cacheName}
            isModalOpen={isAddEntryFormOpen}
            closeModal={closeAddEntryFormModal}
          />
        </DataToolbarItem>
        <DataToolbarItem>
          <Button variant={ButtonVariant.link} isDisabled>
            Clear all entries
          </Button>
        </DataToolbarItem>
      </DataToolbarContent>
    </DataToolbar>
  );
};

export { CacheEntries };
