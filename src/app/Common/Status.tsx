import React from 'react';
import {AlertVariant, Flex, FlexItem, Text, TextContent, TextVariants,} from '@patternfly/react-core';
import {AlertIcon} from '@patternfly/react-core/dist/js/components/Alert/AlertIcon';
import {chart_global_label_Fill} from "@patternfly/react-tokens";

const Status = (props: { status: ComponentStatus }) => {
  const componentStatus = props.status;

  return (
    <Flex>
      <FlexItem>
        <AlertIcon
          variant={componentStatus.icon as AlertVariant}
          style={{
            color: componentStatus.color,
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
            {componentStatus.name}
          </Text>
        </TextContent>
      </FlexItem>
    </Flex>
  );
};
export { Status };
