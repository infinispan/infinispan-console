import React from 'react';
import { Banner, Flex, FlexItem } from '@patternfly/react-core';
import { useBanner } from '@app/utils/useApiAlert';
import { ExclamationCircleIcon, ExclamationTriangleIcon } from '@patternfly/react-icons';
import { CACHES_BANNER, ROLLING_UPGRADE_BANNER } from '@app/providers/APIAlertProvider';

const BannerAlert = () => {
  const { bannerMap } = useBanner();

  if (!bannerMap || bannerMap.size == 0) {
    return <span data-testid={'NoBanner'} />;
  }

  const displayBanner = (id: string | undefined) => {
    if (!bannerMap.has(id)) {
      return <></>;
    }
    const bannerText = bannerMap.get(id) as string;
    const bannerStatus = id == CACHES_BANNER ? 'danger' : 'warning';
    const bannerIcon = id == CACHES_BANNER ? <ExclamationCircleIcon /> : <ExclamationTriangleIcon />;

    return (
      <Banner screenReaderText="Danger banner" status={bannerStatus}>
        <Flex spaceItems={{ default: 'spaceItemsSm' }}>
          <FlexItem>{bannerIcon}</FlexItem>
          <FlexItem>{bannerText}</FlexItem>
        </Flex>
      </Banner>
    );
  };
  return (
    <>
      {displayBanner(CACHES_BANNER)}
      {displayBanner(ROLLING_UPGRADE_BANNER)}
    </>
  );
};
export { BannerAlert };
