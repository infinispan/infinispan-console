import React from 'react';
import {
  Text,
  TextContent,
  TextVariants,
  Tooltip,
  TooltipPosition
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';

const CardTitle: React.FunctionComponent<any> = (props: {
  title: string;
  toolTip: string;
}) => {
  return (
    <TextContent>
      <Text component={TextVariants.h2}>
        {props.title}{' '}
        <Tooltip
          position={TooltipPosition.top}
          content={<div>{props.toolTip}</div>}
        >
          <OutlinedQuestionCircleIcon style={{ fontSize: 15 }} />
        </Tooltip>
      </Text>
    </TextContent>
  );
};
export { CardTitle };
