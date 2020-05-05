import React, { useState } from 'react';
import {
  Button,
  Expandable,
  Form,
  FormGroup,
  Modal,
  Select,
  SelectOption,
  SelectVariant,
  TextInput
} from '@patternfly/react-core';
import { Flags, KeyContentType, ValueContentType } from '../../services/utils';
import { SelectOptionObject } from '@patternfly/react-core/src/components/Select/SelectOption';
import { MoreInfoTooltip } from '@app/Common/MoreInfoTooltip';
import cacheService from '../../services/cacheService';
import { useApiAlert } from '@app/utils/useApiAlert';
import { global_spacer_md } from '@patternfly/react-tokens';

interface IField {
  value: string;
  isValid: boolean;
  invalidText: string;
  helperText: string;
  validated: 'success' | 'error' | 'default';
}

interface ISelectField {
  selected: string | SelectOptionObject | (string | SelectOptionObject)[];
  expanded: boolean;
  helperText: string;
}

const AddEntryForm = (props: {
  cacheName: string;
  isModalOpen: boolean;
  closeModal: () => void;
}) => {
  const { addAlert } = useApiAlert();
  const keyInitialState: IField = {
    value: '',
    isValid: false,
    invalidText: 'Key is required',
    helperText: '',
    validated: 'default'
  };
  const valueInitialState: IField = {
    value: '',
    isValid: false,
    invalidText: 'Value is required',
    helperText: '',
    validated: 'default'
  };
  const selectSingleElementInitialState: ISelectField = {
    selected: '',
    expanded: false,
    helperText: 'Select content type. String is the default value'
  };
  const maxIdleInitialState: IField = {
    value: '',
    isValid: true,
    invalidText: 'Max idle has to be a number',
    helperText:
      'Number of seconds. If you set a negative value, the entry is never deleted.',
    validated: 'default'
  };
  const timeToLiveInitialState: IField = {
    value: '',
    isValid: true,
    invalidText: 'Time to live has to be a number',
    helperText:
      'Number of seconds. If you set a negative value, the entry is never deleted.',
    validated: 'default'
  };
  const flagsInitialState: ISelectField = {
    selected: [],
    expanded: false,
    helperText: 'Select flags'
  };

  const [key, setKey] = useState<IField>(keyInitialState);
  const [keyContentType, setKeyContentType] = useState<ISelectField>(
    selectSingleElementInitialState
  );
  const [value, setValue] = useState<IField>(valueInitialState);
  const [valueContentType, setValueContentType] = useState<ISelectField>(
    selectSingleElementInitialState
  );
  const [maxIdleField, setMaxIdleField] = useState<IField>(maxIdleInitialState);
  const [timeToLiveField, setTimeToLiveField] = useState<IField>(
    timeToLiveInitialState
  );
  const [flags, setFlags] = useState<ISelectField>(flagsInitialState);

  const keyContentTypeOptions = () => {
    return Object.keys(KeyContentType).map(key => (
      <SelectOption key={key} value={KeyContentType[key]} />
    ));
  };

  const valueContentTypeOptions = () => {
    return Object.keys(ValueContentType).map(key => (
      <SelectOption key={key} value={ValueContentType[key]} />
    ));
  };

  const flagsOptions = () => {
    return Object.keys(Flags).map(key => (
      <SelectOption key={key} value={Flags[key]} />
    ));
  };

  const onToggleKeyContentType = isExpanded => {
    setExpanded(isExpanded, setKeyContentType);
  };

  const onToggleValueContentType = isExpanded => {
    setExpanded(isExpanded, setValueContentType);
  };

  const onToggleFlags = isExpanded => {
    setExpanded(isExpanded, setFlags);
  };

  const setExpanded = (
    expanded: boolean,
    stateDispatch: React.Dispatch<React.SetStateAction<ISelectField>>
  ) => {
    stateDispatch(prevState => {
      return { ...prevState, expanded: expanded };
    });
  };

  const onSelectKeyContentType = (event, selection) => {
    setSelection(selection, false, setKeyContentType);
  };

  const onSelectValueContentType = (event, selection) => {
    setSelection(selection, false, setValueContentType);
  };

  const onSelectFlags = (event, selection) => {
    let prevSelectedFlags: SelectOptionObject[] = flags.selected as SelectOptionObject[];

    if (prevSelectedFlags.includes(selection)) {
      prevSelectedFlags = prevSelectedFlags.filter(item => item !== selection);
    } else {
      prevSelectedFlags = [...prevSelectedFlags, selection];
    }
    setSelection(prevSelectedFlags, true, setFlags);
  };

  const setSelection = (
    selection,
    expanded: boolean,
    stateDispatch: React.Dispatch<React.SetStateAction<ISelectField>>
  ) => {
    stateDispatch(prevState => {
      return { ...prevState, expanded: expanded, selected: selection };
    });
  };

  const onClearFlagsSelection = () => {
    setFlags(flagsInitialState);
  };

  const onChangeKey = value => {
    validateRequiredField(value, 'Key', setKey);
  };

  const onChangeValue = value => {
    validateRequiredField(value, 'Value', setValue);
  };

  const onChangeMaxIdle = value => {
    validateNotRequiredNumericField(value, 'Max idle', setMaxIdleField);
  };

  const onChangeTimeToLive = value => {
    validateNotRequiredNumericField(value, 'Time to live', setTimeToLiveField);
  };

  const validateRequiredField = (
    value: string,
    fieldName: string,
    stateDispatch: React.Dispatch<React.SetStateAction<IField>>
  ): boolean => {
    const trimmedValue = value.trim();
    const isValid = trimmedValue.length > 0;
    if (isValid) {
      stateDispatch({
        value: trimmedValue,
        isValid: isValid,
        invalidText: '',
        helperText: fieldName + ' is valid',
        validated: 'success'
      });
    } else {
      stateDispatch({
        value: trimmedValue,
        isValid: isValid,
        invalidText: fieldName + ' is required',
        helperText: 'Validating...',
        validated: 'error'
      });
    }
    return isValid;
  };

  const validateNotRequiredNumericField = (
    value: string,
    fieldName: string,
    stateDispatch: React.Dispatch<React.SetStateAction<IField>>
  ): boolean => {
    const isEmpty = value.trim().length == 0;
    const isValid = isEmpty ? true : !isNaN(Number(value));
    if (isValid) {
      stateDispatch({
        value: value,
        isValid: isValid,
        invalidText: '',
        helperText: fieldName + ' is valid',
        validated: isEmpty ? 'default' : 'success'
      });
    } else {
      stateDispatch({
        value: value,
        isValid: isValid,
        invalidText: fieldName + ' has to be a number',
        helperText: 'Validating...',
        validated: 'error'
      });
    }
    return isValid;
  };

  const handleAddEntryButton = () => {
    let isValid = true;
    isValid = validateRequiredField(key.value, 'Key', setKey) && isValid;
    isValid = validateRequiredField(value.value, 'Value', setValue) && isValid;
    isValid =
      validateNotRequiredNumericField(
        maxIdleField.value,
        'Max idle',
        setMaxIdleField
      ) && isValid;
    isValid =
      validateNotRequiredNumericField(
        timeToLiveField.value,
        'Time to live',
        setTimeToLiveField
      ) && isValid;

    if (isValid) {
      cacheService
        .addEntry(
          props.cacheName,
          key.value,
          keyContentType.selected as string,
          value.value,
          valueContentType.selected as string,
          maxIdleField.value,
          timeToLiveField.value,
          flags.selected as string[]
        )
        .then(response => {
          addAlert(response);
          onClose();
        });
    }
  };

  const onClose = () => {
    props.closeModal();
    setKey(keyInitialState);
    setValue(valueInitialState);
    setKeyContentType(selectSingleElementInitialState);
    setValueContentType(selectSingleElementInitialState);
    setFlags(flagsInitialState);
    setMaxIdleField(maxIdleInitialState);
    setTimeToLiveField(timeToLiveInitialState);
  };

  return (
    <Modal
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title="Add a new entry"
      onClose={onClose}
      isFooterLeftAligned
      aria-label="Add new entry modal"
      actions={[
        <Button key="putEntryButton" onClick={handleAddEntryButton}>
          Add
        </Button>,
        <Button key="cancel" variant="link" onClick={props.closeModal}>
          Cancel
        </Button>
      ]}
    >
      <Form
        onSubmit={e => {
          e.preventDefault();
        }}
        style={{ marginBottom: global_spacer_md.value }}
      >
        <FormGroup label="Cache name" isRequired fieldId="cache-name">
          <TextInput
            isDisabled
            value={props.cacheName}
            id="cacheName"
            aria-describedby="cache-name-helper"
          />
        </FormGroup>
        <FormGroup
          label="Key"
          isRequired
          helperText={key.helperText}
          helperTextInvalid={key.invalidText}
          fieldId="key-entry"
          validated={key.validated}
        >
          <TextInput
            isRequired
            validated={key.validated}
            value={key.value}
            id="key-entry"
            aria-describedby="key-entry-helper"
            onChange={onChangeKey}
          />
        </FormGroup>
        <FormGroup
          label="Value"
          isRequired
          helperText={value.helperText}
          helperTextInvalid={value.invalidText}
          fieldId="value-entry"
          validated={value.validated}
        >
          <TextInput
            isRequired
            validated={value.validated}
            value={value.value}
            id="value-entry"
            aria-describedby="value-entry-helper"
            onChange={onChangeValue}
          />
        </FormGroup>
      </Form>
      <Expandable toggleText="Advanced options">
        <Form
          onSubmit={e => {
            e.preventDefault();
          }}
        >
          <FormGroup
            label={
              <MoreInfoTooltip
                label="Max Idle:"
                toolTip={
                  'Sets the number of seconds that entries can be idle. ' +
                  'If a read or write operation does not occur for an entry after the maximum idle time elapses, ' +
                  'the entry is automatically deleted. If you do not set this parameter, ' +
                  'Infinispan uses the default value from the configuration. ' +
                  'If you set a negative value, the entry is never deleted.\n' +
                  '\n'
                }
              />
            }
            type="number"
            helperText={maxIdleField.helperText}
            helperTextInvalid={maxIdleField.invalidText}
            fieldId="maxIdle"
            validated={maxIdleField.validated}
          >
            <TextInput
              validated={maxIdleField.validated}
              value={maxIdleField.value}
              id="maxIdle"
              aria-describedby="maxIdle-helper"
              onChange={onChangeMaxIdle}
            />
          </FormGroup>
          <FormGroup
            label={
              <MoreInfoTooltip
                label="Time to live:"
                toolTip={
                  'Sets the number of seconds before ' +
                  'the entry is automatically deleted. If you do not set this parameter, ' +
                  'Infinispan uses the default value from the configuration. ' +
                  'If you set a negative value, the entry is never deleted.\n' +
                  '\n'
                }
              />
            }
            type="number"
            helperText={timeToLiveField.helperText}
            helperTextInvalid={timeToLiveField.invalidText}
            fieldId="timeToLive"
            validated={timeToLiveField.validated}
          >
            <TextInput
              validated={timeToLiveField.validated}
              value={timeToLiveField.value}
              id="timeToLive"
              aria-describedby="timeToLive-helper"
              onChange={onChangeTimeToLive}
            />
          </FormGroup>
          <FormGroup
            label="Flags:"
            fieldId="flags-helper"
            helperText="The flags used to add the entry. See 'org.infinispan.context.Flag' class for more information."
          >
            <Select
              variant={SelectVariant.typeaheadMulti}
              aria-label="Select Flags"
              onToggle={onToggleFlags}
              onSelect={onSelectFlags}
              selections={flags.selected}
              isExpanded={flags.expanded}
              placeholderText="Flags"
              onClear={onClearFlagsSelection}
              maxHeight={150}
            >
              {flagsOptions()}
            </Select>
          </FormGroup>
          <FormGroup
            label="Key content type"
            fieldId="key-content-type-helper"
            helperText={keyContentType.helperText}
            placeholder="Key content type"
          >
            <Select
              placeholderText="Select a key content type"
              variant={SelectVariant.typeahead}
              aria-label="Select Key Content Type"
              onToggle={onToggleKeyContentType}
              onSelect={onSelectKeyContentType}
              selections={keyContentType.selected}
              isExpanded={keyContentType.expanded}
            >
              {keyContentTypeOptions()}
            </Select>
          </FormGroup>

          <FormGroup
            label="Value content type"
            helperTextInvalid="Value content type is mandatory"
            fieldId="value-content-type-helper"
            helperText={valueContentType.helperText}
          >
            <Select
              placeholderText="Select a value content type"
              variant={SelectVariant.typeahead}
              aria-label="Select Value Content Type"
              onToggle={onToggleValueContentType}
              onSelect={onSelectValueContentType}
              selections={valueContentType.selected}
              isExpanded={valueContentType.expanded}
            >
              {valueContentTypeOptions()}
            </Select>
          </FormGroup>
        </Form>
      </Expandable>
    </Modal>
  );
};

export { AddEntryForm };
