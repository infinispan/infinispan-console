import React, { useEffect, useState } from 'react';
import { ConsoleServices } from '@services/ConsoleServices';
import { useBanner } from '@utils/useApiAlert';
import { useConnectedUser } from '@app/services/userManagementHook';
import { ROLLING_UPGRADE_BANNER } from '@app/providers/APIAlertProvider';
import { useTranslation } from 'react-i18next';

export const RollingUpgradeContext = React.createContext('');

const RollingUpgradeDetectionProvider = ({ children }) => {
  const { connectedUser, notSecured } = useConnectedUser();
  const [rollingUpgrade, setRollingUpgrade] = useState<string>('');
  const { addBanner, removeBanner } = useBanner();
  const { t } = useTranslation();

  const ROLLING_UPGRADE_KEY = 'rolling_upgrade';
  useEffect(() => {
    if (notSecured || connectedUser.name != '') {
      if (localStorage) {
        const item = localStorage.getItem(ROLLING_UPGRADE_KEY);
        if (item == null) {
          localStorage.setItem(ROLLING_UPGRADE_KEY, '');
        }
      }
      ConsoleServices.cluster()
        .getClusterMembers()
        .then((eitherDefaultCm) => {
          if (eitherDefaultCm.isRight()) {
            const value = eitherDefaultCm.value as unknown as ClusterMembers;
            return value.rolling_upgrade;
          }
          return false;
        })
        .then((rollingUpgrade) => setRollingUpgrade(rollingUpgrade + ''));
    }
  }, [connectedUser, notSecured]);

  useEffect(() => {
    if (rollingUpgrade == '') {
      return;
    }

    if (rollingUpgrade == 'true') {
      addBanner(ROLLING_UPGRADE_BANNER, t('rolling-upgrade.started'));
    }

    if (localStorage) {
      // Store the status
      const prevRollingUpgrade = localStorage.getItem(ROLLING_UPGRADE_KEY) as string;
      localStorage.setItem(ROLLING_UPGRADE_KEY, rollingUpgrade);

      if (prevRollingUpgrade == 'true' && rollingUpgrade == 'false') {
        // We stored a rolling upgrade. Reload the Console in case you don't see the good version
        addBanner(ROLLING_UPGRADE_BANNER, t('rolling-upgrade.finished'));
      }
    } else if (rollingUpgrade == 'false') {
      // Remove the banner
      removeBanner(ROLLING_UPGRADE_BANNER);
    }
  }, [rollingUpgrade]);

  return <RollingUpgradeContext.Provider value={rollingUpgrade}>{children}</RollingUpgradeContext.Provider>;
};

export { RollingUpgradeDetectionProvider };
