import React, { useContext } from 'react';
import { Flex, FlexItem, Text, TextContent } from '@patternfly/react-core';
import { AlertIcon } from '@patternfly/react-core/dist/js/components/Alert/AlertIcon';
import displayUtils from '@services/displayUtils';
import { ComponentHealth } from '@services/infinispanRefData';
import { ThemeContext } from '@app/providers/ThemeProvider';
import { chart_global_label_Fill, global_Color_light_100 } from '@patternfly/react-tokens';

const Health = (props: { health?: string; displayIcon?: boolean; cacheName?: string }) => {
  const health = props.health ? ComponentHealth[props.health] : ComponentHealth.UNKNOWN;
  const displayIcon = props.displayIcon == undefined ? true : props.displayIcon;
  const { theme } = useContext(ThemeContext);

  const getHealthLabelColor = () => {
    const color = displayUtils.healthColor(health, false);
    return theme === 'dark' && color === chart_global_label_Fill.value ? global_Color_light_100.value : color;
  };
  return (
    <Flex>
      {displayIcon && (
        <FlexItem spacer={{ default: 'spacerXs' }}>
          <AlertIcon
            data-testid={'HealthIcon'}
            variant={displayUtils.healthAlertVariant(health)}
            style={{
              color: displayUtils.healthColor(health, true),
              display: 'inline'
            }}
          />
        </FlexItem>
      )}

      <FlexItem>
        <TextContent>
          <Text
            data-cy={`health-${props.cacheName}`}
            style={{
              color: getHealthLabelColor()
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
