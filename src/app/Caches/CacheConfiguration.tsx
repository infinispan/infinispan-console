import React from 'react';
import {
  Card,
  CardBody,
  ClipboardCopy,
  ClipboardCopyVariant,
  Text,
  TextContent,
  TextVariants
} from '@patternfly/react-core';

const CacheConfiguration: React.FunctionComponent<any> = (props: {
  config: CacheConfig;
}) => {
  return (
    <Card>
      <CardBody>
        <TextContent key={props.config.name + '-config-text-content'}>
          <Text
            component={TextVariants.pre}
            key={props.config.name + '-config-text'}
          >
            {props.config.config}
          </Text>
          <ClipboardCopy
            isReadOnly
            isCode
            variant={ClipboardCopyVariant.inline}
          >
            {props.config.config}
          </ClipboardCopy>
        </TextContent>
      </CardBody>
    </Card>
  );
};

export { CacheConfiguration };
