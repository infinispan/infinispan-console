import React, { useState } from 'react';
import { Alert, Label, Spinner, Switch, ToolbarItem } from '@patternfly/react-core';
import { useCacheDetail } from '@app/services/cachesHook';
import { useConnectedUser } from '@app/services/userManagementHook';
import { ConsoleServices } from '@services/ConsoleServices';
import { ConsoleACL } from '@services/securityService';
import { useTranslation } from 'react-i18next';
import { useApiAlert } from '@app/utils/useApiAlert';
import { RebalancingConfirmationModal } from '@app/Rebalancing/RebalancingConfirmationModal';
import { global_spacer_xs } from '@patternfly/react-tokens';

const RebalancingCache = () => {
  const { addAlert } = useApiAlert();
  const { t } = useTranslation();
  const [confirmationModalOpened, setConfirmationModalOpened] = useState(false);
  const { connectedUser } = useConnectedUser();
  const { cache, cacheManager, loading, reload } = useCacheDetail();

  // If rebalancing is not activated at cluster level, don't display anything
  if (!cacheManager.rebalancing_enabled || cache.rebalancing_enabled == undefined) {
    return <></>;
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
        <Spinner size={'md'} isInline />
        <Alert variant="warning" isInline isPlain title={t('caches.rebalancing.rebalancing')} />
      </ToolbarItem>
    );
  }

  /**
   * If the user is ADMIN, can enable and disable rebalancing
   */
  if (ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser)) {
    return (
      <ToolbarItem style={{ paddingTop: global_spacer_xs.value }}>
        <Switch
          id="rebalancing-switch"
          label={t('caches.rebalancing.enabled')}
          labelOff={t('caches.rebalancing.disabled')}
          isChecked={cache.rebalancing_enabled}
          onChange={() => setConfirmationModalOpened(true)}
        />
        <RebalancingConfirmationModal
          type={'caches'}
          isModalOpen={confirmationModalOpened}
          confirmAction={() =>
            ConsoleServices.caches()
              .rebalancing(cache.name, !cache.rebalancing_enabled)
              .then((r) => {
                addAlert(r);
                reload();
              })
              .finally(() => setConfirmationModalOpened(false))
          }
          closeModal={() => setConfirmationModalOpened(false)}
          enabled={cache.rebalancing_enabled}
        />
      </ToolbarItem>
    );
  }

  return (
    <ToolbarItem>
      <Label>{cache.rebalancing_enabled ? t('caches.rebalancing.rebalanced') : t('caches.rebalancing.disabled')}</Label>
    </ToolbarItem>
  );
};

export { RebalancingCache };
