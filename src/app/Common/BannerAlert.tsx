import React from 'react';
import { Banner } from '@patternfly/react-core';
import { useBanner } from '@app/utils/useApiAlert';

const BannerAlert = () => {
  const { banner } = useBanner();

  if (!banner || banner.length == 0) {
    return <span data-testid={'NoBanner'} />;
  }

  return <Banner variant="danger">{banner}</Banner>;
};
export { BannerAlert };
