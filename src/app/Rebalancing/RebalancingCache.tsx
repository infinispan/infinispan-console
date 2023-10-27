import React, { useState } from 'react';
import { Label, Spinner, Switch, TextContent, ToolbarItem, Text } from '@patternfly/react-core';
import { useCacheDetail } from '@app/services/cachesHook';
import { useConnectedUser } from '@app/services/userManagementHook';
import { ConsoleServices } from '@services/ConsoleServices';
import { ConsoleACL } from '@services/securityService';
import { useTranslation } from 'react-i18next';
import { useApiAlert } from '@app/utils/useApiAlert';
import { RebalancingConfirmationModal } from '@app/Rebalancing/RebalancingConfirmationModal';

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
        <TextContent>
          <Text>
            <Spinner size={'md'} isInline /> {t('caches.rebalancing.rebalancing')}
          </Text>
        </TextContent>
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

  if (cache.rebalancing_enabled) {
    return (
      <ToolbarItem>
        <Label>{t('caches.rebalancing.rebalanced')}</Label>
      </ToolbarItem>
    );
  }

  return (
    <ToolbarItem>
      <Label>{t('caches.rebalancing.disabled')}</Label>
    </ToolbarItem>
  );
};

export { RebalancingCache };
