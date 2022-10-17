import { Bullseye, EmptyState, EmptyStateBody, EmptyStateIcon, EmptyStateVariant, Title } from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { global_danger_color_200 } from '@patternfly/react-tokens';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

const TableErrorState = (props: { error: string; detail?: string }) => {
  const displayErrorBody = () => {
    if (props.detail) {
      return props.detail as string;
    } else {
      return 'There was an error retrieving data.\n' + ' Check your connection and try again.';
    }
  };

  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  return (
    <Bullseye>
      <EmptyState variant={EmptyStateVariant.full}>
        <EmptyStateIcon icon={ExclamationCircleIcon} color={global_danger_color_200.value} />
        <Title headingLevel="h2" size="lg">
          {props.error}
        </Title>
        <EmptyStateBody>{displayErrorBody()}</EmptyStateBody>
      </EmptyState>
    </Bullseye>
  );
};
export { TableErrorState };
