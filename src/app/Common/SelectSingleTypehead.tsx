import React, { CSSProperties, useEffect, useRef, useState } from 'react';
import {
  Button,
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  SelectOptionProps,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';

const SelectSingleTypehead = (props: {
  id: string;
  placeholder: string;
  options: SelectOptionProps[];
  selected: string;
  onSelect: (selection) => void;
  onClear?: () => void;
  isDisabled?: boolean;
  isFullWidth?: boolean;
  style?: CSSProperties | undefined;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [selectOptions, setSelectOptions] = useState<SelectOptionProps[]>(props.options);
  const [focusedItemIndex, setFocusedItemIndex] = useState<number | null>(null);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const textInputRef = useRef<HTMLInputElement>();

  useEffect(() => {
    let newSelectOptions: SelectOptionProps[] = props.options;

    // Filter menu items based on the text input value when one exists
    if (filterValue) {
      newSelectOptions = props.options.filter((menuItem) =>
        String(menuItem.children).toLowerCase().includes(filterValue.toLowerCase())
      );

      // When no options are found after filtering, display 'No results found'
      if (!newSelectOptions.length) {
        newSelectOptions = [
          { isDisabled: false, children: `No results found for "${filterValue}"`, value: 'no results' }
        ];
      }

      // Open the menu when the input value changes and the new value is not empty
      if (!isOpen) {
        setIsOpen(true);
      }
    }

    setSelectOptions(newSelectOptions);
    setActiveItem(null);
    setFocusedItemIndex(null);
  }, [filterValue]);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (_event, value) => {
    if (value && value !== 'no results') {
      setInputValue(value as string);
      setFilterValue('');
      setSelected(value as string);
      props.onSelect(value);
    }

    setIsOpen(false);
    setFocusedItemIndex(null);
    setActiveItem(null);
  };

  const onTextInputChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    setInputValue(value);
    setFilterValue(value);
  };

  const handleMenuArrowKeys = (key: string) => {
    let indexToFocus;

    if (isOpen) {
      if (key === 'ArrowUp') {
        // When no index is set or at the first index, focus to the last, otherwise decrement focus index
        if (focusedItemIndex === null || focusedItemIndex === 0) {
          indexToFocus = selectOptions.length - 1;
        } else {
          indexToFocus = focusedItemIndex - 1;
        }
      }

      if (key === 'ArrowDown') {
        // When no index is set or at the last index, focus to the first, otherwise increment focus index
        if (focusedItemIndex === null || focusedItemIndex === selectOptions.length - 1) {
          indexToFocus = 0;
        } else {
          indexToFocus = focusedItemIndex + 1;
        }
      }

      setFocusedItemIndex(indexToFocus);
      const focusedItem = selectOptions.filter((option) => !option.isDisabled)[indexToFocus];
      setActiveItem(`select-typeahead-${focusedItem.value.replace(' ', '-')}`);
    }
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const enabledMenuItems = selectOptions.filter((option) => !option.isDisabled);
    const [firstMenuItem] = enabledMenuItems;
    const focusedItem = focusedItemIndex ? enabledMenuItems[focusedItemIndex] : firstMenuItem;

    switch (event.key) {
      // Select the first available option
      case 'Enter':
        if (isOpen && focusedItem.value !== 'no results') {
          setInputValue(String(focusedItem.children));
          setFilterValue('');
          setSelected(String(focusedItem.children));
        }

        setIsOpen((prevIsOpen) => !prevIsOpen);
        setFocusedItemIndex(null);
        setActiveItem(null);

        break;
      case 'Tab':
      case 'Escape':
        setIsOpen(false);
        setActiveItem(null);
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        handleMenuArrowKeys(event.key);
        break;
    }
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      variant={'typeahead'}
      onClick={onToggleClick}
      isDisabled={props.isDisabled}
      id={'toggle-' + props.id}
      data-cy={'toggle-' + props.id}
      isExpanded={isOpen}
      style={props.style}
      isFullWidth={props.isFullWidth}
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={inputValue}
          onClick={onToggleClick}
          onChange={onTextInputChange}
          onKeyDown={onInputKeyDown}
          id={'typeahead-select-input-' + props.id}
          autoComplete="off"
          innerRef={textInputRef}
          placeholder={props.placeholder}
          {...(activeItem && { 'aria-activedescendant': activeItem })}
          role="combobox"
          isExpanded={isOpen}
          aria-controls={'select-typeahead-listbox-' + props.id}
        />

        <TextInputGroupUtilities>
          {!!inputValue && (
            <Button
              variant="plain"
              onClick={() => {
                if (props.onClear) props.onClear();
                setSelected('');
                setInputValue('');
                setFilterValue('');
                textInputRef?.current?.focus();
              }}
              aria-label="Clear input value"
            >
              <TimesIcon aria-hidden />
            </Button>
          )}
        </TextInputGroupUtilities>
      </TextInputGroup>
    </MenuToggle>
  );

  const idSelect = 'select-typeahead-' + props.id;
  const idSelectList = 'select-list-typeahead-' + props.id;
  return (
    <Select
      id={idSelect}
      data-cy={idSelect}
      isOpen={isOpen}
      selected={selected}
      onSelect={onSelect}
      onOpenChange={() => {
        setIsOpen(false);
      }}
      toggle={toggle}
      isScrollable={true}
    >
      <SelectList id={idSelectList} data-cy={idSelectList}>
        {selectOptions.map((option, index) => (
          <SelectOption
            key={option.value || option.children}
            isFocused={focusedItemIndex === index}
            className={option.className}
            onClick={() => setSelected(option.value)}
            id={`option-typeahead-${option.id}`}
            data-cy={`option-typeahead-${option.id}`}
            {...option}
            ref={null}
          />
        ))}
      </SelectList>
    </Select>
  );
};

export { SelectSingleTypehead };
