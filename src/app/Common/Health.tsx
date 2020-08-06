import React from 'react';
import {Flex, FlexItem, Text, TextContent} from '@patternfly/react-core';
import {AlertIcon} from '@patternfly/react-core/dist/js/components/Alert/AlertIcon';
import displayUtils from '../../services/displayUtils';

const Health = (props: { health: string }) => {
  return (
    <Flex>
      <FlexItem>
        <AlertIcon variant={displayUtils.healthAlertVariant(props.health)}
                   style={{
                     color: displayUtils.healthColor(props.health, true),
                     display: 'inline'
                   }}/>
      </FlexItem>
      <FlexItem>
        <TextContent>
          <Text>
            {displayUtils.healthLabel(props.health)}
          </Text>
        </TextContent>
      </FlexItem>
    </Flex>
  );
};

export {Health};
