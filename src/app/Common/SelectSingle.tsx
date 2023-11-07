import React, { CSSProperties, useState } from 'react';
import {
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  SelectOptionProps
} from '@patternfly/react-core';

const SelectSingle = (props: {
  id: string;
  placeholder: string;
  options: SelectOptionProps[];
  selected: string;
  onSelect: (selection) => void;
  style?: CSSProperties | undefined;
  isDisabled?: boolean;
  isFullWidth?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (_event, value) => {
    setIsOpen(false);
    props.onSelect(value);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      id={'toggle-' + props.id}
      data-cy={'toggle-' + props.id}
      onClick={onToggleClick}
      isExpanded={isOpen}
      style={props.style}
      isDisabled={props.isDisabled}
      isFullWidth={props.isFullWidth}
    >
      {!props.selected || props.selected.length == 0 ? props.placeholder : props.selected}
    </MenuToggle>
  );

  return (
    <Select
      id={'select-' + props.id}
      isOpen={isOpen}
      selected={props.selected}
      onSelect={onSelect}
      onOpenChange={(isOpen) => setIsOpen(isOpen)}
      toggle={toggle}
      shouldFocusToggleOnSelect
      isScrollable={true}
    >
      <SelectList id={'select-list-' + props.id}>
        {props.options.map((option, index) => {
          const id = 'option-' + option.id;
          return (
            <SelectOption id={id} key={id} data-cy={id} aria-label={option.id} value={option.value}>
              {option.children}
            </SelectOption>
          );
        })}
      </SelectList>
    </Select>
  );
};

export { SelectSingle };
