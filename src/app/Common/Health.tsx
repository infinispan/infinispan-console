import React from 'react';
import { Flex, FlexItem, Text, TextContent } from '@patternfly/react-core';
import { AlertIcon } from '@patternfly/react-core/dist/js/components/Alert/AlertIcon';
import displayUtils from '@services/displayUtils';
import { ComponentHealth } from '@services/utils';

const Health = (props: { health: string; displayIcon?: boolean }) => {
  const health = ComponentHealth[props.health];
  const displayIcon = props.displayIcon == undefined ? true : props.displayIcon;

  return (
    <Flex>
      {displayIcon && (
        <FlexItem>
          <AlertIcon
            data-testid={'HealthIcon'}
            variant={displayUtils.healthAlertVariant(health)}
            style={{
              color: displayUtils.healthColor(health, true),
              display: 'inline',
            }}
          />
        </FlexItem>
      )}

      <FlexItem>
        <TextContent>
          <Text
            style={{
              color: displayUtils.healthColor(health, false),
            }}
          >
            {displayUtils.healthLabel(health)}
          </Text>
        </TextContent>
      </FlexItem>
    </Flex>
  );
};

export { Health };
