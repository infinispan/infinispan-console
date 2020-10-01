import React from 'react';
import {
  AlertVariant,
  Text,
  TextContent,
  TextVariants,
  Toolbar,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { AlertIcon } from '@patternfly/react-core/dist/js/components/Alert/AlertIcon';
import displayUtils from '../../services/displayUtils';
import { global_spacer_sm } from '@patternfly/react-tokens';

const Health = (props: { health: string; displayIcon?: boolean }) => {
  const displayIcon = props.displayIcon == undefined ? true : props.displayIcon;

  return (
    <Toolbar>
      <ToolbarGroup>
        {displayIcon && (
          <ToolbarItem
            style={{
              paddingRight: global_spacer_sm.value,
              color: displayUtils.healthColor(props.health, true),
            }}
          >
            <AlertIcon
              variant={displayUtils.healthAlertVariant(props.health)}
            />
          </ToolbarItem>
        )}
        <ToolbarItem>
          <TextContent>
            <Text
              component={TextVariants.p}
              style={{ color: displayUtils.healthColor(props.health, false) }}
            >
              {displayUtils.healthLabel(props.health)}
            </Text>
          </TextContent>
        </ToolbarItem>
      </ToolbarGroup>
    </Toolbar>
  );
};

export { Health };
