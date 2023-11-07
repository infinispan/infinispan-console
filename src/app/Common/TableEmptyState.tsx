import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Spinner,
  EmptyStateHeader
} from '@patternfly/react-core';
import { ExclamationCircleIcon, SearchIcon } from '@patternfly/react-icons';
import { global_danger_color_100 } from '@patternfly/react-tokens';
import React from 'react';
import { useTranslation } from 'react-i18next';

const TableEmptyState = (props: { loading: boolean; error: string; empty: string | React.ReactNode }) => {
  const { t } = useTranslation();

  if (props.loading) {
    return (
      <Bullseye>
        <Spinner size="xl" />
      </Bullseye>
    );
  }

  if (props.error != '') {
    return (
      <Bullseye>
        <EmptyState variant={EmptyStateVariant.sm}>
          <EmptyStateHeader
            titleText="There was an error retrieving the data"
            icon={<EmptyStateIcon icon={ExclamationCircleIcon} color={global_danger_color_100.value} />}
            headingLevel="h2"
          />
          <EmptyStateBody>{props.error}</EmptyStateBody>
        </EmptyState>
      </Bullseye>
    );
  }

  return (
    <Bullseye data-cy="noCacheConfigsFound">
      <EmptyState variant={EmptyStateVariant.sm}>
        <EmptyStateHeader
          titleText={<>{props.empty}</>}
          icon={<EmptyStateIcon icon={SearchIcon} />}
          headingLevel="h2"
        />
      </EmptyState>
    </Bullseye>
  );
};

export { TableEmptyState };
