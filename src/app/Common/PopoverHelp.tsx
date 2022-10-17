import React, { ReactNode } from 'react';
import { Popover, TextContent, TextVariants, Text } from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

/**
 * This component is used to add pop over helps to forms
 */
const PopoverHelp = (props: { name: string; label: string; content: string | ReactNode; text?: string }) => {
  const popOver = (
    <Popover headerContent={props.label} bodyContent={props.content}>
      <button
        type="button"
        aria-label={'more-info-' + props.name}
        onClick={(e) => e.preventDefault()}
        aria-describedby={'help' + props.name}
        className="pf-c-form__group-label-help"
      >
        <HelpIcon noVerticalAlign />
      </button>
    </Popover>
  );

  if (props.text) {
    return (
      <TextContent>
        <Text component={TextVariants.p}>
          {props.text} {popOver}
        </Text>
      </TextContent>
    );
  }

  return popOver;
};
export { PopoverHelp };
