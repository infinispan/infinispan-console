import React from 'react';
import {Text, TextContent, Tooltip, TooltipPosition} from '@patternfly/react-core';
import {OutlinedQuestionCircleIcon} from '@patternfly/react-icons';
import {
  chart_global_Fill_Color_white,
  global_FontSize_md,
  global_FontSize_sm,
  global_spacer_xs
} from '@patternfly/react-tokens';

/**
 * This component is used to add tooltips in the labels of the forms
 */
const MoreInfoTooltip = (props: { label: string; toolTip: string }) => {
  const buildTooltipContent = () => {
    return (
      <TextContent>
        <Text
          style={{
            fontSize: global_FontSize_sm.value,
            color: chart_global_Fill_Color_white.value
          }}
        >
          {props.toolTip}
        </Text>
      </TextContent>
    );
  };

  return (
    <React.Fragment>
      {props.label}
      <Tooltip
        className={'pf-m-redhat-font'}
        position={TooltipPosition.right}
        content={buildTooltipContent()}
        isContentLeftAligned={true}
      >
        <OutlinedQuestionCircleIcon
          style={{
            fontSize: global_FontSize_md.value,
            paddingLeft: global_spacer_xs.value,
            paddingTop: global_spacer_xs.value
          }}
        />
      </Tooltip>
    </React.Fragment>
  );
};
export { MoreInfoTooltip };
