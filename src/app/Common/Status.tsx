import React from 'react';
import {AlertVariant, Flex, FlexItem, Text, TextContent, TextVariants,} from '@patternfly/react-core';
import {AlertIcon} from '@patternfly/react-core/dist/js/components/Alert/AlertIcon';
import {chart_global_label_Fill} from "@patternfly/react-tokens";
import {UNKNOWN_STATUS} from "@services/displayUtils";

const Status = (props: { status?: Status }) => {
  const status = props.status? props.status : UNKNOWN_STATUS;

  return (
    <Flex>
      <FlexItem>
        <AlertIcon
          variant={status.icon as AlertVariant}
          style={{
            color: status.color,
            display: 'inline',
          }}
        />
      </FlexItem>
      <FlexItem>
        <TextContent>
          <Text
            component={TextVariants.p}
            style={{ color: chart_global_label_Fill.value}}
          >
            {status.name}
          </Text>
        </TextContent>
      </FlexItem>
    </Flex>
  );
};
export { Status };
