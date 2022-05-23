import * as React from 'react';
import { useEffect, useState } from 'react';

import {
  PageSection,
  PageSectionVariants,
  Text,
  TextContent,
  TextVariants,
  Toolbar,
  ToolbarContent,
} from '@patternfly/react-core';
import displayUtils from '@services/displayUtils';
import { DataContainerBreadcrumb } from '@app/Common/DataContainerBreadcrumb';
import { ConsoleServices } from '@services/ConsoleServices';
import { useTranslation } from 'react-i18next';
import { CreateCacheWizard } from './Create/CreateCacheWizard';

const CreateCache: React.FunctionComponent<any> = (props) => {
  const cmName = props.computedMatch.params.cmName;

  const [loadingBackups, setLoadingBackups] = useState(true);
  const [isBackupAvailable, setIsBackupAvailable] = useState(false);
  const [localSite, setLocalSite] = useState('');

  const { t } = useTranslation();

  useEffect(() => {
    if (loadingBackups) {
      ConsoleServices.dataContainer().getDefaultCacheManager()
        .then((r) => {
          if (r.isRight()) {
            const cm = r.value;
            setIsBackupAvailable(cm.backups_enabled);
            if (cm.backups_enabled && cm.local_site) {
              setLocalSite(cm.local_site);
            }
          }
        }).then(() => setLoadingBackups(false));
    }
  }, [loadingBackups]);

  let title = 'Data container is empty.';
  if (cmName !== undefined) {
    title = displayUtils.capitalize(cmName);
  }

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <DataContainerBreadcrumb currentPage="Create a cache" />
        <Toolbar id="create-cache-header">
          <ToolbarContent style={{ paddingLeft: 0 }}>
            <TextContent>
              <Text component={TextVariants.h1}>
                {!isBackupAvailable ?
                  t('caches.create.page-title', { cmName: title })
                  : t('caches.create.page-title-with-backups', { cmName: title, localsite: localSite })
                }
              </Text>
            </TextContent>
          </ToolbarContent>
        </Toolbar>
      </PageSection>
      <CreateCacheWizard cmName={cmName} />
    </React.Fragment>
  );
};
export { CreateCache };
