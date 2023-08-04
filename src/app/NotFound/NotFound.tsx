import * as React from 'react';
import { useHistory } from 'react-router-dom';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  PageSection,
  EmptyStateHeader,
  EmptyStateFooter
} from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const { t } = useTranslation();

  function GoHomeBtn() {
    const history = useHistory();

    function handleClick() {
      history.push(history?.location?.search ? '/' + history?.location?.search : '/');
    }

    return <Button onClick={handleClick}>{t('not-found-page.button')}</Button>;
  }

  return (
    <PageSection>
      <EmptyState variant="full">
        <EmptyStateHeader
          titleText={<>{t('not-found-page.title')}</>}
          icon={<EmptyStateIcon icon={ExclamationTriangleIcon} />}
          headingLevel="h1"
        />
        <EmptyStateBody>{t('not-found-page.description')}</EmptyStateBody>
        <EmptyStateFooter>
          <GoHomeBtn />
        </EmptyStateFooter>
      </EmptyState>
    </PageSection>
  );
};

export { NotFound };
