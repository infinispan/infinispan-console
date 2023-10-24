import {
  Bullseye,
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant,
  Spinner
} from '@patternfly/react-core';
import * as React from 'react';

const TableLoadingState = (props: { message: string }) => {
  return (
    <Bullseye>
      <EmptyState variant={EmptyStateVariant.sm}>
        <EmptyStateHeader titleText={props.message} icon={<EmptyStateIcon icon={Spinner} />} headingLevel="h4" />
      </EmptyState>
    </Bullseye>
  );
};
export { TableLoadingState };
