import React from 'react';
import {Label, Spinner, Switch, ToolbarItem} from '@patternfly/react-core';
import {useCacheDetail} from "@app/services/cachesHook";
import {useConnectedUser} from "@app/services/userManagementHook";
import {ConsoleServices} from "@services/ConsoleServices";
import {ConsoleACL} from "@services/securityService";
import {useTranslation} from "react-i18next";
import {useApiAlert} from "@app/utils/useApiAlert";
import {useDataContainer} from "@app/services/dataContainerHooks";

const RebalancingCache = () => {
  const { addAlert } = useApiAlert();
  const { t } = useTranslation();
  const { connectedUser } = useConnectedUser();
  const { cache, cacheManager, loading, reload } = useCacheDetail();

  // If rebalancing is not activated at cluster level, don't display anything
  if (!cacheManager.rebalancing_enabled || cache.rebalancing_enabled == undefined) {
    return ( <ToolbarItem/>)
  }

  if (loading || !cache) {
    return (
      <ToolbarItem>
        <Spinner size={'md'} />
      </ToolbarItem>
    );
  }

  /**
   * When the rehash is in progress just display the value
   */
  if (cache?.rehash_in_progress) {
    return (
      <ToolbarItem>
        <Spinner size={'md'} /> {t('caches.info.rebalancing')}
      </ToolbarItem>
    );
  }

  /**
   * If the user is ADMIN, can enable and disable rebalancing
   */
  if (ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)) {
    return (
      <ToolbarItem>
        <Switch
          id="rebalancing-switch"
          label={t('caches.info.rebalancing-enabled')}
          labelOff={t('caches.info.rebalancing-disabled')}
          isChecked={cache.rebalancing_enabled}
          onChange={() => {
            ConsoleServices.caches().rebalancing(cache.name, !cache.rebalancing_enabled)
              .then(r => {
                addAlert(r);
                reload();
              })
          }}
        />
      </ToolbarItem>
    );
  }

  if (cache.rebalancing_enabled) {
    return (
      <ToolbarItem>
        <Label>{t('caches.info.rebalanced')}</Label>
      </ToolbarItem>
    );
  }

  return (
    <ToolbarItem>
      <Label>{t('caches.info.rebalancing-disabled')}</Label>
    </ToolbarItem>
  );
};

export { RebalancingCache };
