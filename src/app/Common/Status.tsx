import React from 'react';
import {
  Flex,
  FlexItem,
  Text,
  TextContent,
  TextVariants,
} from '@patternfly/react-core';
import { AlertIcon } from '@patternfly/react-core/dist/js/components/Alert/AlertIcon';
import displayUtils from '@services/displayUtils';
import { ComponentStatus } from '@services/utils';

const Status = (props: { status: string }) => {
  const componentStatus = ComponentStatus[props.status];

  return (
    <Flex>
      <FlexItem>
        <AlertIcon
          variant={displayUtils.statusAlterVariant(componentStatus)}
          style={{
            color: displayUtils.statusColor(componentStatus, true),
            display: 'inline',
          }}
        />
      </FlexItem>
      <FlexItem>
        <TextContent>
          <Text
            component={TextVariants.p}
            style={{ color: displayUtils.statusColor(componentStatus, false) }}
          >
            {displayUtils.capitalize(props.status)}
          </Text>
        </TextContent>
      </FlexItem>
    </Flex>
  );
};
export { Status };
