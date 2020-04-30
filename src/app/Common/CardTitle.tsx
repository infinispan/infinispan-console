import React from 'react';
import {
  Text,
  TextContent,
  TextVariants,
  Tooltip,
  TooltipPosition
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Form/form';

const CardTitle = (props: { title: string; toolTip: string }) => {
  return (
    <TextContent>
      <Text className={css(styles.formLabel)}>
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
