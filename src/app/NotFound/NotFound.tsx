import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { MissingPage } from '@patternfly/react-component-groups';
import { ConsoleServices } from '@services/ConsoleServices';

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <MissingPage
      ouiaId={'not-found'}
      toHomePageUrl={ConsoleServices.landing()}
      toHomePageText={t('not-found-page.button')}
      titleText={t('not-found-page.title')}
      bodyText={t('not-found-page.description')}
    />
  );
};

export { NotFound };
