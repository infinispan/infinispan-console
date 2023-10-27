import displayUtils from '@services/displayUtils';
import { global_FontSize_md, global_FontSize_sm, global_spacer_sm, global_spacer_xs } from '@patternfly/react-tokens';
import { Label } from '@patternfly/react-core';
import React from 'react';
import { CacheType } from '@services/infinispanRefData';

const CacheTypeBadge = (props: { cacheType: string; small: boolean; cacheName: string }) => {
  const cacheTypeEnum = CacheType[props.cacheType];

  return (
    <Label
      data-cy={`type-${props.cacheName}`}
      color={displayUtils.cacheTypeColor(cacheTypeEnum)}
      style={{
        fontSize: props.small ? global_FontSize_sm.value : global_FontSize_md.value,
        fontWeight: 'lighter',
        padding: global_spacer_xs.value,
        paddingRight: global_spacer_sm.value,
        paddingLeft: global_spacer_sm.value
      }}
    >
      {props.cacheType}
    </Label>
  );
};
export { CacheTypeBadge };
