import React from 'react';
import {Popover} from '@patternfly/react-core';
import {HelpIcon} from '@patternfly/react-icons';

/**
 * This component is used to add pop over helps to forms
 */
const PopoverHelp = (props: { name: string, label: string; content: string}) => {
  return (
    <Popover
      headerContent={props.label}
      bodyContent={props.content}>
      <button
        type="button"
        aria-label={'more-info-' + props.name}
        onClick={e => e.preventDefault()}
        aria-describedby={'help' + props.name}
        className="pf-c-form__group-label-help"
      >
        <HelpIcon noVerticalAlign />
      </button>
    </Popover>
  );
};
export { PopoverHelp };
