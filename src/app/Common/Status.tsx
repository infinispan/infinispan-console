import React from 'react';
import {
  AlertVariant,
  Text,
  TextContent,
  TextVariants,
  Toolbar,
  ToolbarGroup,
  ToolbarItem
} from '@patternfly/react-core';
import {AlertIcon} from "@patternfly/react-core/dist/js/components/Alert/AlertIcon";
import displayUtils from "../../services/displayUtils";
import {global_spacer_sm} from "@patternfly/react-tokens";

const Status = (props: { status: string }) => {
  let variant;
  switch (props.status) {
    case 'STOPPING':
      variant = AlertVariant.warning;
      break;
    case 'RUNNING':
      variant = AlertVariant.success;
      break;
    case 'INSTANTIATED':
      variant = AlertVariant.warning;
      break;
    case 'INITIALIZING':
      variant = AlertVariant.warning;
      break;
    case 'FAILED':
      variant = AlertVariant.danger;
      break;
    case 'TERMINATED':
      variant = AlertVariant.info;
      break;
    default:
      variant = AlertVariant.warning;
  }

  return (
    <Toolbar>
      <ToolbarGroup>
        <ToolbarItem
          style={{paddingRight: global_spacer_sm.value, color: displayUtils.statusColor(props.status, true)}}>
          <AlertIcon variant={variant}/>
        </ToolbarItem>
        <ToolbarItem>
          <TextContent>
            <Text component={TextVariants.p}
                  style={{color: displayUtils.statusColor(props.status, false)}}>
              {displayUtils.capitalize(props.status)}</Text>
          </TextContent>
        </ToolbarItem>
      </ToolbarGroup>
    </Toolbar>
  );
};
export {Status};
