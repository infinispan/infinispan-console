import React from 'react';
import {
  Button,
  ButtonVariant,
  DataToolbar,
  DataToolbarContent,
  DataToolbarItem,
  InputGroup,
  Text,
  TextContent,
  TextInput,
  TextVariants
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';

const CacheEntries: React.FunctionComponent<any> = (props: {
  cacheName: string;
}) => {
  return (
    <DataToolbar id="cache-entries-toolbar">
      <DataToolbarContent>
        <DataToolbarItem>
          <InputGroup>
            <TextInput
              isDisabled
              name="textSearchByKey"
              id="textSearchByKey"
              type="search"
              aria-label="search by key"
              placeholder={'Get by key'}
            />
            <Button
              variant="control"
              aria-label="search button for search input"
              isDisabled
            >
              <SearchIcon />
            </Button>
          </InputGroup>
        </DataToolbarItem>
        <DataToolbarItem>
          <Button variant={ButtonVariant.primary} isDisabled>
            Add entry
          </Button>
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
