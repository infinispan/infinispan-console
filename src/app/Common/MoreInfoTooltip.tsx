import React from 'react';
import { Flex, FlexItem, Text, TextContent, Tooltip, TooltipPosition, TextVariants } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import {
  chart_global_Fill_Color_white,
  global_FontSize_md,
  global_FontSize_sm,
  global_spacer_xs,
  global_FontWeight_bold
} from '@patternfly/react-tokens';

/**
 * This component is used to add tooltips in the labels of the forms
 */
const MoreInfoTooltip = (props: { label: string; toolTip: string; textComponent?: TextVariants }) => {
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
      <Flex spaceItems={{ default: 'spaceItemsNone' }}>
        <FlexItem>
          <TextContent>
            <Text component={props.textComponent}>{props.label}</Text>
          </TextContent>
        </FlexItem>
        <FlexItem>
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
        </FlexItem>
      </Flex>
    </React.Fragment>
  );
};
export { MoreInfoTooltip };
