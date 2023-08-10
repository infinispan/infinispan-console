import * as React from 'react';
import { useEffect, useState } from 'react';

import {
  Alert,
  AlertVariant,
  Bullseye,
  EmptyState,
  EmptyStateIcon,
  PageSection,
  PageSectionVariants,
  Spinner,
  Text,
  TextContent,
  TextVariants,
  Toolbar,
  ToolbarContent,
  EmptyStateHeader
} from '@patternfly/react-core';
import displayUtils from '@services/displayUtils';
import { DataContainerBreadcrumb } from '@app/Common/DataContainerBreadcrumb';
import { ConsoleServices } from '@services/ConsoleServices';
import { useTranslation } from 'react-i18next';
import { CreateCacheWizard } from '@app/Caches/Create/CreateCacheWizard';
import { CreateCacheProvider } from '@app/providers/CreateCacheProvider';
import { TableErrorState } from '@app/Common/TableErrorState';
import { ConsoleACL } from '@services/securityService';
import { useConnectedUser } from '@app/services/userManagementHook';

const CreateCache = () => {
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const [cacheManager, setCacheManager] = useState<CacheManager | undefined>();
  const [error, setError] = useState('');
  const [loadingBackups, setLoadingBackups] = useState(true);
  const [isBackupAvailable, setIsBackupAvailable] = useState(false);
  const [localSite, setLocalSite] = useState('');
  const [title, setTitle] = useState('Data container is empty.');
  const { connectedUser } = useConnectedUser();
  const canCreateCache = ConsoleServices.security().hasConsoleACL(ConsoleACL.CREATE, connectedUser);

  useEffect(() => {
    if (!cacheManager && loadingBackups) {
      ConsoleServices.dataContainer()
        .getDefaultCacheManager()
        .then((r) => {
          if (r.isRight()) {
            const cm = r.value;
            setCacheManager(cm);
            setTitle(displayUtils.capitalize(displayUtils.capitalize(cm.name)));
            setIsBackupAvailable(cm.backups_enabled);
            if (cm.backups_enabled && cm.local_site) {
              setLocalSite(cm.local_site);
            }
          } else {
            setError(r.value.message);
          }
        })
        .then(() => setLoadingBackups(false));
    }
  }, []);

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
              <Text component={TextVariants.h1} style={{ marginBottom: '1rem' }}>
                {!isBackupAvailable
                  ? t(`caches.${id}.page-title`, { cmName: title })
                  : t(`caches.${id}.page-title-with-backups`, { cmName: title, localsite: localSite })}
              </Text>
              {canCreateCache && <Text component={TextVariants.p}>{t(`caches.${id}.page-title-description`)}</Text>}
            </TextContent>
          </ToolbarContent>
          <ToolbarContent style={{ paddingLeft: 0 }}>
            {!canCreateCache && (
              <Alert
                title={t('caches.setup.page-title-description', { brandname: brandname })}
                variant={AlertVariant.info}
                isPlain
                isInline
              />
            )}
          </ToolbarContent>
        </Toolbar>
      </PageSection>
      {!cacheManager && displayLoading()}
      {error != '' && displayError()}
      {cacheManager && <CreateCacheWizard cacheManager={cacheManager} create={create} />}
    </CreateCacheProvider>
  );
};
export { CreateCache };
