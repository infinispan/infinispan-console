import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
  EmptyStateVariant
} from '@patternfly/react-core';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { global_danger_color_200 } from '@patternfly/react-tokens';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

const TableErrorState = (props: { error: string; detail?: string }) => {
  const { t } = useTranslation();
  const displayErrorBody = () => {
    if (props.detail) {
      return props.detail as string;
    } else {
      return t('common.loading-error-message');
    }
  };

  return (
    <Bullseye>
      <EmptyState variant={EmptyStateVariant.full}>
        <EmptyStateHeader
          titleText={<>{props.error}</>}
          icon={<EmptyStateIcon icon={ExclamationCircleIcon} color={global_danger_color_200.value} />}
          headingLevel="h2"
        />
        <EmptyStateBody>{displayErrorBody()}</EmptyStateBody>
      </EmptyState>
    </Bullseye>
  );
};
export { TableErrorState };
