import * as React from 'react';
import { useEffect, useState } from 'react';

import {
  Alert,
  AlertVariant,
  Bullseye,
  EmptyState,
  EmptyStateHeader,
  EmptyStateIcon,
  PageSection,
  PageSectionVariants,
  Spinner,
  Text,
  TextContent,
  TextVariants,
  Toolbar,
  ToolbarContent
} from '@patternfly/react-core';
import { DataContainerBreadcrumb } from '@app/Common/DataContainerBreadcrumb';
import { ConsoleServices } from '@services/ConsoleServices';
import { useTranslation } from 'react-i18next';
import { CreateCacheWizard } from '@app/Caches/Create/CreateCacheWizard';
import { CreateCacheProvider } from '@app/providers/CreateCacheProvider';
import { TableErrorState } from '@app/Common/TableErrorState';
import { ConsoleACL } from '@services/securityService';
import { useConnectedUser } from '@app/services/userManagementHook';
import { useDataContainer } from '@app/services/dataContainerHooks';

const CreateCache = () => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const { cm, loading, error } = useDataContainer();
  const [localSite, setLocalSite] = useState('');
  const { connectedUser } = useConnectedUser();
  const canCreateCache = ConsoleServices.security().hasConsoleACL(ConsoleACL.CREATE, connectedUser);

  useEffect(() => {
    if (cm) {
      if (cm.backups_enabled && cm.local_site) {
        setLocalSite(cm.local_site);
      }
    }
  }, [cm]);

  const displayError = () => {
    return (
      <PageSection variant={PageSectionVariants.light}>
        <TableErrorState error={error} />
      </PageSection>
    );
  };

  const displayLoading = () => {
    return (
      <PageSection variant={PageSectionVariants.light}>
        <Bullseye>
          <EmptyState>
            <EmptyStateHeader titleText="Loading" icon={<EmptyStateIcon icon={Spinner} />} headingLevel="h4" />
          </EmptyState>
        </Bullseye>
      </PageSection>
    );
  };

  const create = ConsoleServices.security().hasConsoleACL(ConsoleACL.CREATE, connectedUser);
  const id = create ? 'create' : 'setup';

  return (
    <CreateCacheProvider>
      <PageSection variant={PageSectionVariants.light}>
        {create && <DataContainerBreadcrumb currentPage={t('caches.create.breadcrumb')} />}
        <Toolbar id={`${id}-cache-header`}>
          <ToolbarContent style={{ paddingLeft: 0 }}>
            <TextContent>
              <Text component={TextVariants.h1}>
                {localSite == ''
                  ? t(`caches.${id}.page-title`)
                  : t(`caches.${id}.page-title-with-backups`, { localsite: localSite })}
              </Text>
            </TextContent>
          </ToolbarContent>
          {!canCreateCache && (
            <ToolbarContent style={{ paddingLeft: 0 }}>
              <Alert
                title={t('caches.setup.page-title-description', { brandname: brandname })}
                variant={AlertVariant.info}
                isPlain
                isInline
              />
            </ToolbarContent>
          )}
        </Toolbar>
      </PageSection>
      {loading && displayLoading()}
      {error != '' && displayError()}
      {cm && <CreateCacheWizard cacheManager={cm} create={create} />}
    </CreateCacheProvider>
  );
};
export { CreateCache };
