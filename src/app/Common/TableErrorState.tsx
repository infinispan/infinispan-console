import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Title
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { global_danger_color_200 } from '@patternfly/react-tokens';
import * as React from 'react';

const TableErrorState = (props: { error: string }) => {
  return (
    <Bullseye>
      <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon
          icon={ExclamationCircleIcon}
          color={global_danger_color_200.value}
        />
        <Title headingLevel="h2" size="lg">
          {props.error}
        </Title>
        <EmptyStateBody>
          There was an error retrieving data. Check your connection and try
          again.
        </EmptyStateBody>
      </EmptyState>
    </Bullseye>
  );
};
export { TableErrorState };
