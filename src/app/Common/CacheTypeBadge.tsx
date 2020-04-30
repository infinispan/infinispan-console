import displayUtils from '../../services/displayUtils';
import {
  global_FontSize_lg,
  global_FontSize_sm,
  global_spacer_sm,
  global_spacer_xs
} from '@patternfly/react-tokens';
import { Badge } from '@patternfly/react-core';
import React from 'react';

const CacheTypeBadge = (props: { cacheType: string; small: boolean }) => {
  return (
    <Badge
      style={{
        backgroundColor: displayUtils.cacheTypeColor(props.cacheType),
        color: displayUtils.cacheTypeColorLabel(props.cacheType),
        fontSize: props.small
          ? global_FontSize_sm.value
          : global_FontSize_lg.value,
        fontWeight: 'lighter',
        padding: global_spacer_xs.value,
        paddingRight: global_spacer_sm.value,
        paddingLeft: global_spacer_sm.value
      }}
    >
      {props.cacheType}
    </Badge>
  );
};
export { CacheTypeBadge };
