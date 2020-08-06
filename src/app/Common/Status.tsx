import React from 'react';
import {Flex, FlexItem, Text, TextContent, TextVariants} from '@patternfly/react-core';
import {AlertIcon} from '@patternfly/react-core/dist/js/components/Alert/AlertIcon';
import displayUtils from '../../services/displayUtils';

const Status = (props: { status: string }) => {
  return (
    <Flex>
      <FlexItem>
        <AlertIcon variant={displayUtils.statusAlterVariant(props.status)}
                   style={{
                     color: displayUtils.statusColor(props.status, true),
                     display: 'inline'
                   }}/>
      </FlexItem>
      <FlexItem>
        <TextContent>
          <Text
          component={TextVariants.p}
          style={{ color: displayUtils.statusColor(props.status, false) }}
          >
          {displayUtils.capitalize(props.status)}
          </Text>
        </TextContent>
      </FlexItem>
    </Flex>
  );
};
export { Status };
