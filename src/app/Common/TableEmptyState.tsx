import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateVariant,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { ExclamationCircleIcon, SearchIcon } from '@patternfly/react-icons';
import { global_danger_color_100 } from '@patternfly/react-tokens';
import React from 'react';
import { useTranslation } from 'react-i18next';

const TableEmptyState = (props: {
  loading: boolean;
  error: string;
  empty: string;
}) => {
  if (props.loading) {
    return (
      <Bullseye>
        <Spinner size="xl" />
      </Bullseye>
    );
  }

  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  if (props.error != '') {
    return (
      <Bullseye>
        <EmptyState variant={EmptyStateVariant.small}>
          <EmptyStateIcon
            icon={ExclamationCircleIcon}
            color={global_danger_color_100.value}
          />
          <Title headingLevel="h2" size="lg">
            There was an error retrieving the data
          </Title>
          <EmptyStateBody>{props.error}</EmptyStateBody>
        </EmptyState>
      </Bullseye>
    );
  }

  return (
    <Bullseye>
      <EmptyState variant={EmptyStateVariant.small}>
        <EmptyStateIcon icon={SearchIcon} />
        <Title headingLevel="h2" size="lg">
          {props.empty}
        </Title>
      </EmptyState>
    </Bullseye>
  );
};

export { TableEmptyState };
