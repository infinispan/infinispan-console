import React, { useState } from 'react';
import {
  Button,
  ButtonVariant,
  Content,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  PageSection,
  Spinner
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useRollingUpgrade } from '@app/hooks/useRollingUpgrade';
import { useRollingUpgradeState } from '@app/providers/RollingUpgradeDetectionProvider';
import { RollingUpgradeStatus } from './RollingUpgradeStatus';
import { RollingUpgradeWizard } from './RollingUpgradeWizard';

const RollingUpgrades = () => {
  const { t } = useTranslation();
  const { rollingUpgrade } = useRollingUpgradeState();
  const { cacheStatuses, loading, syncCache, disconnectCache, syncAll, disconnectAll, refresh } = useRollingUpgrade();
  const [wizardOpen, setWizardOpen] = useState(false);

  const hasActiveConnections = cacheStatuses.some((s) => s.connected);

  const handleWizardComplete = () => {
    setWizardOpen(false);
    refresh();
  };

  if (loading) {
    return (
      <PageSection>
        <Spinner size="lg" />
      </PageSection>
    );
  }

  if (rollingUpgrade || hasActiveConnections) {
    return (
      <>
        <RollingUpgradeStatus
          cacheStatuses={cacheStatuses}
          syncCache={syncCache}
          disconnectCache={disconnectCache}
          syncAll={syncAll}
          disconnectAll={disconnectAll}
        />
        <RollingUpgradeWizard
          isOpen={wizardOpen}
          onClose={() => setWizardOpen(false)}
          onComplete={handleWizardComplete}
        />
      </>
    );
  }

  return (
    <>
      <PageSection>
        <Content>
          <h1>{t('rolling-upgrades.title')}</h1>
        </Content>
        <EmptyState>
          <EmptyStateBody>{t('rolling-upgrades.no-active')}</EmptyStateBody>
          <EmptyStateBody>{t('rolling-upgrades.description')}</EmptyStateBody>
          <EmptyStateFooter>
            <EmptyStateActions>
              <Button variant={ButtonVariant.primary} onClick={() => setWizardOpen(true)}>
                {t('rolling-upgrades.start-button')}
              </Button>
            </EmptyStateActions>
          </EmptyStateFooter>
        </EmptyState>
      </PageSection>
      <RollingUpgradeWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onComplete={handleWizardComplete}
      />
    </>
  );
};

export { RollingUpgrades };
