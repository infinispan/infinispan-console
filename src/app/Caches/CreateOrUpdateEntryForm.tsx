import React, { useEffect, useState } from 'react';
import {
  Alert,
  AlertVariant,
  Button,
  Expandable,
  Form,
  FormGroup,
  Modal,
  Select,
  SelectOption,
  SelectVariant, TextArea,
  TextInput
} from '@patternfly/react-core';
import { Flags, KeyContentType, ValueContentType} from '../../services/utils';
import { IField, ISelectField} from '../../services/formUtils';
import { SelectOptionObject } from '@patternfly/react-core/src/components/Select/SelectOption';
import { MoreInfoTooltip } from '@app/Common/MoreInfoTooltip';
import cacheService from '../../services/cacheService';
import { useApiAlert } from '@app/utils/useApiAlert';
import { global_spacer_md } from '@patternfly/react-tokens';
import { useRecentActivity } from '@app/utils/useRecentActivity';
import formUtils from "../../services/formUtils";

const CreateOrUpdateEntryForm = (props: {
  cacheName: string;
  keyToEdit: string;
  isModalOpen: boolean;
  closeModal: () => void;
}) => {
  const { addAlert } = useApiAlert();
  const { pushActivity } = useRecentActivity();

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
    helperText: 'Select content type.'
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

  const [error, setError] = useState<string | undefined>(undefined);
  const [isEdition, setIsEdition] = useState<boolean>(false);
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

  useEffect(() => {
    if (props.keyToEdit == '') {
      setIsEdition(false);
    } else {
      setIsEdition(true);
      cacheService
        .getEntry(props.cacheName, props.keyToEdit)
        .then(eitherResponse => {
          if (eitherResponse.isRight()) {
            setKey(prevState => {
              return { ...prevState, value: eitherResponse.value.key };
            });
            setValue(prevState => {
              return { ...prevState, value: eitherResponse.value.value };
            });
            if (eitherResponse.value.maxIdle) {
              setMaxIdleField(prevState => {
                return {
                  ...prevState,
                  value: eitherResponse.value.maxIdle as string
                };
              });
            }
            if (eitherResponse.value.timeToLive) {
              setTimeToLiveField(prevState => {
                return {
                  ...prevState,
                  value: eitherResponse.value.timeToLive as string
                };
              });
            }
          } else {
            setError(eitherResponse.value.message);
          }
        });
    }
  }, [props.isModalOpen]);

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

  const onClearKeyContentType = () => {
    setKeyContentType(selectSingleElementInitialState);
  };

  const onClearValueContentType = () => {
    setValueContentType(selectSingleElementInitialState);
  };

  const onClearFlagsSelection = () => {
    setFlags(flagsInitialState);
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

  const onChangeKey = value => {
    formUtils.validateRequiredField(value, 'Key', setKey);
  };

  const onChangeValue = value => {
    formUtils.validateRequiredField(value, 'Value', setValue);
  };

  const onChangeMaxIdle = value => {
    formUtils.validateNotRequiredNumericField(value, 'Max idle', setMaxIdleField);
  };

  const onChangeTimeToLive = value => {
    formUtils.validateNotRequiredNumericField(value, 'Time to live', setTimeToLiveField);
  };

  const handleAddOrUpdateEntryButton = () => {
    let isValid = true;
    setError(undefined);
    isValid = formUtils.validateRequiredField(key.value.trim(), 'Key', setKey) && isValid;
    isValid = formUtils.validateRequiredField(value.value.trim(), 'Value', setValue) && isValid;
    isValid =
      formUtils.validateNotRequiredNumericField(
        maxIdleField.value.trim(),
        'Max idle',
        setMaxIdleField
      ) && isValid;
    isValid =
      formUtils.validateNotRequiredNumericField(
        timeToLiveField.value.trim(),
        'Time to live',
        setTimeToLiveField
      ) && isValid;

    let selectedKeyContentType = keyContentType.selected as KeyContentType;
    let selectedValueContentType = valueContentType.selected as ValueContentType;

    if (isValid) {
      cacheService
        .createOrUpdate(
          props.cacheName,
          key.value,
          selectedKeyContentType,
          value.value,
          selectedValueContentType,
          maxIdleField.value,
          timeToLiveField.value,
          flags.selected as string[],
          !isEdition
        )
        .then(response => {
          if (response.success) {
            addAlert(response);
            let activity: Activity = {
              cacheName: props.cacheName,
              entryKey: key.value,
              action: isEdition ? 'Edit' : 'Add',
              date: new Date()
            };
            pushActivity(activity);
            onClose();
          } else {
            setError(response.message);
          }
        });
    }
  };

  const onClose = () => {
    props.closeModal();
    setError(undefined);
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
      title={isEdition ? 'Edit entry' : 'Add new entry'}
      onClose={onClose}
      isFooterLeftAligned
      aria-label={isEdition ? 'Edit entry form' : 'Add new entry form'}
      actions={[
        <Button key="putEntryButton" onClick={handleAddOrUpdateEntryButton}>
          {isEdition ? 'Edit' : 'Add'}
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose}>
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
        {error && (
          <Alert variant={AlertVariant.danger} isInline title={error} />
        )}

        <FormGroup
          label="Cache name"
          isRequired
          fieldId="cache-name"
          disabled={true}
        >
          <TextInput
            isDisabled
            value={props.cacheName}
            id="cacheName"
            aria-describedby="cache-name-helper"
          />
        </FormGroup>
        <FormGroup
          label={
            <MoreInfoTooltip
              label="Key:"
              toolTip={
                'The key can contain simple values but also JSON ' +
                'that are automatically converted to and from Protostream. \n' +
                'When writing JSON documents, a special field `_type` must be present.\n' +
                '{\n' +
                '   "_type": "Person",\n' +
                '   "name": "user1",\n' +
                '   "age": 32\n' +
                '}'
              }
            />
          }
          isRequired
          helperText={key.helperText}
          helperTextInvalid={key.invalidText}
          fieldId="key-entry"
          validated={key.validated}
          disabled={isEdition}
        >
          <TextArea
            isRequired
            validated={key.validated}
            value={key.value}
            id="key-entry"
            aria-describedby="key-entry-helper"
            onChange={onChangeKey}
            disabled={isEdition}
          />
        </FormGroup>
        <FormGroup
          label={<MoreInfoTooltip
            label="Value:"
            toolTip={
              'The value can contain simple values but also JSON ' +
              'that are automatically converted to and from Protostream.\n ' +
              'When writing JSON documents, a special field _type must be present.\n' +
              '{\n' +
              '   "_type": "Person",\n' +
              '   "name": "user1",\n' +
              '   "age": 32\n' +
              '}'
            }
          />}
          isRequired
          helperText={value.helperText}
          helperTextInvalid={value.invalidText}
          fieldId="value-entry"
          validated={value.validated}
        >
          <TextArea
            isRequired
            validated={value.validated}
            value={value.value}
            id="value-entry"
            aria-describedby="value-entry-helper"
            onChange={onChangeValue}
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
      </Form>
      <Expandable toggleText="Advanced options">
        <Form
          onSubmit={e => {
            e.preventDefault();
          }}
        >
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
              onClear={onClearFlagsSelection}
              selections={flags.selected}
              isExpanded={flags.expanded}
              placeholderText="Flags"
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
            disabled={isEdition}
          >
            <Select
              placeholderText="Select a key content type"
              variant={SelectVariant.typeahead}
              aria-label="Select Key Content Type"
              onToggle={onToggleKeyContentType}
              onSelect={onSelectKeyContentType}
              onClear={onClearKeyContentType}
              selections={keyContentType.selected}
              isExpanded={keyContentType.expanded}
              isDisabled={isEdition}
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
              onClear={onClearValueContentType}
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

export { CreateOrUpdateEntryForm };
