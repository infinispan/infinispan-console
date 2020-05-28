import React from 'react';
import {Text, TextContent, TextVariants, Tooltip, TooltipPosition} from '@patternfly/react-core';
import {OutlinedQuestionCircleIcon} from '@patternfly/react-icons';
import {global_FontSize_sm, global_spacer_sm} from "@patternfly/react-tokens";

const CustomCardTitle = (props: { title: string; toolTip?: string }) => {
  const buildTooltip = () => {
    if(!props.toolTip) {
      return;
    }

    return (
      <Tooltip
        position={TooltipPosition.top}
        content={<div>{props.toolTip}</div>}
      >
        <OutlinedQuestionCircleIcon style={{fontSize: global_FontSize_sm.value, marginLeft: global_spacer_sm.value}}/>
      </Tooltip>
    );
  }

  return (
    <TextContent>
      <Text component={TextVariants.h5}>
        {props.title}{' '}
        {buildTooltip()}
      </Text>
    </TextContent>
  );
};
export { CustomCardTitle };
