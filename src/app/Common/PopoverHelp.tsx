import React, {ReactNode} from 'react';
import {Button, Flex, FlexItem, Popover, Text, TextContent} from '@patternfly/react-core';
import {HelpIcon} from '@patternfly/react-icons';

/**
 * This component is used to add pop over helps to forms
 */
const PopoverHelp = (props: { name: string; label: string; content: string | ReactNode; text?: string }) => {
  const popOver = (
    <Popover headerContent={props.label} bodyContent={props.content}>
      <Button
        variant="plain"
        aria-label={'more-info-' + props.name}
        onClick={(e) => e.preventDefault()}
        aria-describedby={'help' + props.name}
        className="pf-v5-c-form__group-label-help"
        icon={<HelpIcon />}
      />
    </Popover>
  );

  if (props.text) {
    return (
      <Flex>
        <FlexItem>
          <TextContent>
            <Text>{props.text}</Text>
          </TextContent>
        </FlexItem>
        <FlexItem>
          {popOver}
        </FlexItem>
      </Flex>
    );
  }

  return popOver;
};
export { PopoverHelp };
