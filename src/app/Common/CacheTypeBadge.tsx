import displayUtils from '@services/displayUtils';
import {
  global_FontSize_md,
  global_FontSize_sm,
  global_spacer_sm,
  global_spacer_xs,
} from '@patternfly/react-tokens';
import { Badge } from '@patternfly/react-core';
import React from 'react';
import { CacheType } from '@services/utils';

const CacheTypeBadge = (props: { cacheType: string; small: boolean }) => {
  const cacheTypeEnum = CacheType[props.cacheType];

  return (
    <Badge
      style={{
        backgroundColor: displayUtils.cacheTypeColor(cacheTypeEnum),
        color: displayUtils.cacheTypeColorLabel(cacheTypeEnum),
        fontSize: props.small
          ? global_FontSize_sm.value
          : global_FontSize_md.value,
        fontWeight: 'lighter',
        padding: global_spacer_xs.value,
        paddingRight: global_spacer_sm.value,
        paddingLeft: global_spacer_sm.value,
      }}
    >
      {props.cacheType}
    </Badge>
  );
};
export { CacheTypeBadge };
