import * as React from 'react';
import { useHistory } from 'react-router-dom';
import { Button, EmptyState, EmptyStateBody, EmptyStateIcon, PageSection, Title } from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const { t } = useTranslation();

  function GoHomeBtn() {
    const history = useHistory();

    function handleClick() {
      history.push('/');
    }

    return <Button onClick={handleClick}>{t('not-found-page.button')}</Button>;
  }

  return (
    <PageSection>
      <EmptyState variant="full">
        <EmptyStateIcon icon={ExclamationTriangleIcon} />
        <Title headingLevel="h1" size="lg">
          {t('not-found-page.title')}
        </Title>
        <EmptyStateBody>{t('not-found-page.description')}</EmptyStateBody>
        <GoHomeBtn />
      </EmptyState>
    </PageSection>
  );
};

export { NotFound };
