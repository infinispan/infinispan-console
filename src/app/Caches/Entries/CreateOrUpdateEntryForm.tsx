import React, { useEffect, useState } from 'react';
import {
  Alert,
  AlertVariant,
  Button,
  ExpandableSection,
  Form,
  FormGroup,
  Modal,
  Select,
  SelectOption,
  SelectVariant,
  TextArea,
  TextInput,
} from '@patternfly/react-core';
import { SelectOptionObject } from '@patternfly/react-core/src/components/Select/SelectOption';
import { MoreInfoTooltip } from '@app/Common/MoreInfoTooltip';
import { useApiAlert } from '@app/utils/useApiAlert';
import { global_spacer_md } from '@patternfly/react-tokens';
import { ContentType, Flags } from '@services/restUtils';
import formUtils, { IField, ISelectField } from '@services/formUtils';
import { useReloadCache } from '@app/services/cachesHook';
import { useTranslation } from 'react-i18next';
import {ConsoleServices} from "@services/ConsoleServices";
import {CacheConfigUtils, EncodingType} from "@services/cacheConfigUtils";

const CreateOrUpdateEntryForm = (props: {
  cacheName: string;
  cacheEncoding: [string, string],
  keyToEdit: string;
  keyContentType: ContentType;
  isModalOpen: boolean;
  closeModal: () => void;
}) => {
  const { addAlert } = useApiAlert();
  const { reload } = useReloadCache();
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const keyInitialState: IField = {
    value: '',
    isValid: false,
    invalidText: t('caches.entries.add-entry-key-invalid'),
    helperText: t('caches.entries.add-entry-key-help'),
    validated: t('caches.entries.add-entry-key-validated'),
  };
  const valueInitialState: IField = {
    value: '',
    isValid: false,
    invalidText: t('caches.entries.add-entry-value-invalid'),
    helperText: t('caches.entries.add-entry-value-help'),
    validated: t('caches.entries.add-entry-value-validated'),
  };

  const keyContentTypeInitialState: ISelectField = {
    selected: ContentType.StringContentType as string,
    expanded: false,
    helperText: 'Select a key content type.',
  };

  const contentTypeInitialState: ISelectField = {
    selected: ContentType.StringContentType as string,
    expanded: false,
    helperText: t('caches.entries.add-entry-content-type-help'),
  };
  const maxIdleInitialState: IField = {
    value: '',
    isValid: true,
    invalidText: t('caches.entries.add-entry-maxidle-invalid'),
    helperText: t('caches.entries.add-entry-maxidle-help'),
    validated: t('caches.entries.add-entry-maxidle-validated'),
  };
  const timeToLiveInitialState: IField = {
    value: '',
    isValid: true,
    invalidText: t('caches.entries.add-entry-lifespan-invalid'),
    helperText: t('caches.entries.add-entry-lifespan-help'),
    validated: t('caches.entries.add-entry-lifespan-validated'),
  };
  const flagsInitialState: ISelectField = {
    selected: [],
    expanded: false,
    helperText: t('caches.entries.add-entry-flags-help'),
  };

  const [error, setError] = useState<string>('');
  const [isEdition, setIsEdition] = useState<boolean>(false);
  const [key, setKey] = useState<IField>(keyInitialState);
  const [keyContentType, setKeyContentType] = useState<ISelectField>(
    keyContentTypeInitialState
  );
  const [value, setValue] = useState<IField>(valueInitialState);
  const [valueContentType, setValueContentType] = useState<ISelectField>(
    contentTypeInitialState
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
      ConsoleServices.caches()
        .getEntry(props.cacheName, props.keyToEdit, props.keyContentType)
        .then((eitherResponse) => {
          if (eitherResponse.isRight()) {
            setKey((prevState) => {
              return { ...prevState, value: eitherResponse.value.key };
            });
            setValue((prevState) => {
              return { ...prevState, value: eitherResponse.value.value };
            });
            setKeyContentType((prevState) => {
              return {
                ...prevState,
                selected: props.keyContentType as string,
              };
            });
            setValueContentType((prevState) => {
              return {
                ...prevState,
                selected: eitherResponse.value.valueContentType as string,
              };
            });
            if (eitherResponse.value.maxIdle) {
              setMaxIdleField((prevState) => {
                return {
                  ...prevState,
                  value: eitherResponse.value.maxIdle as string,
                };
              });
            }
            if (eitherResponse.value.timeToLive) {
              setTimeToLiveField((prevState) => {
                return {
                  ...prevState,
                  value: eitherResponse.value.timeToLive as string,
                };
              });
            }
          } else {
            onClose();
            addAlert(eitherResponse.value);
          }
        });
    }
  }, [props.isModalOpen]);

  const contentTypeOptions = (encodingType: EncodingType) => {
    return CacheConfigUtils.getContentTypeOptions(encodingType).map((contentType) => (
      <SelectOption key={contentType as string} value={contentType} />
    ));
  };

  const flagsOptions = () => {
    return Object.keys(Flags).map((key) => (
      <SelectOption key={key} value={Flags[key]} />
    ));
  };

  const setExpanded = (
    expanded: boolean,
    stateDispatch: React.Dispatch<React.SetStateAction<ISelectField>>
  ) => {
    stateDispatch((prevState) => {
      return { ...prevState, expanded: expanded };
    });
  };

  const onSelectFlags = (event, selection) => {
    let prevSelectedFlags: SelectOptionObject[] = flags.selected as SelectOptionObject[];

    if (prevSelectedFlags.includes(selection)) {
      prevSelectedFlags = prevSelectedFlags.filter(
        (item) => item !== selection
      );
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
    stateDispatch((prevState) => {
      return { ...prevState, expanded: expanded, selected: selection };
    });
  };

  const onChangeKey = (value) => {
    formUtils.validateRequiredField(value, 'Key', setKey);
  };

  const onChangeValue = (value) => {
    formUtils.validateRequiredField(value, 'Value', setValue);
  };

  const onChangeMaxIdle = (value) => {
    formUtils.validateNotRequiredNumericField(
      value,
      'Max idle',
      setMaxIdleField
    );
  };

  const onChangeTimeToLive = (value) => {
    formUtils.validateNotRequiredNumericField(
      value,
      'Time to live',
      setTimeToLiveField
    );
  };

  const handleAddOrUpdateEntryButton = () => {
    let isValid = true;
    setError('');
    isValid =
      formUtils.validateRequiredField(key.value.trim(), 'Key', setKey) &&
      isValid;
    isValid =
      formUtils.validateRequiredField(value.value.trim(), 'Value', setValue) &&
      isValid;
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

    let selectedKeyContentType = keyContentType.selected as ContentType;
    let selectedValueContentType = valueContentType.selected as ContentType;

    if (isValid) {
      ConsoleServices.caches()
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
        .then((response) => {
          if (response.success) {
            addAlert(response);
            let activity: Activity = {
              cacheName: props.cacheName,
              entryKey: key.value,
              keyContentType: selectedKeyContentType,
              action: isEdition ? 'Edit' : 'Add',
              date: new Date(),
            };
            reload();
          } else {
            setError(response.message);
          }
        });
    }
  };

  const onClose = () => {
    props.closeModal();
    setError('');
    setKey(keyInitialState);
    setValue(valueInitialState);
    setKeyContentType(keyContentTypeInitialState);
    setValueContentType(contentTypeInitialState);
    setFlags(flagsInitialState);
    setMaxIdleField(maxIdleInitialState);
    setTimeToLiveField(timeToLiveInitialState);
  };

  const keyContentTypeFormGroup = () => {
    return (
      <FormGroup
      label={t('caches.entries.add-entry-form-key-type-label')}
      fieldId="key-content-type-helper"
      helperText={keyContentType.helperText}
      placeholder={t('caches.entries.add-entry-form-key-type')}
      disabled={isEdition}
    >
      <Select
        placeholderText={t(
          'caches.entries.add-entry-form-key-type-select'
        )}
        variant={SelectVariant.typeahead}
        aria-label={t(
          'caches.entries.add-entry-form-key-type-select-label'
        )}
        onToggle={(isExpanded) =>
          setExpanded(isExpanded, setKeyContentType)
        }
        onSelect={(event, selection) =>
          setSelection(selection, false, setKeyContentType)
        }
        onClear={() => setKeyContentType(keyContentTypeInitialState)}
        selections={keyContentType.selected}
        isOpen={keyContentType.expanded}
        isDisabled={isEdition}
      >
        {contentTypeOptions(props.cacheEncoding[0] as EncodingType)}
      </Select>
    </FormGroup>
    );
  }

  const cacheNameFormGroup = () => {
    return (
      <FormGroup
      label={t('caches.entries.add-entry-form-cache-name')}
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
    );
  }

  const keyFormGroup = () => {
    return (
      <FormGroup
      label={
        <MoreInfoTooltip
          label={t('caches.entries.add-entry-form-key')}
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
    );
  }

  const valueFormGroup = () => {
    return (
      <FormGroup
      label={
        <MoreInfoTooltip
          label={t('caches.entries.add-entry-form-value')}
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
        />
      }
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
    );
  }

  const lifespanFormGroup = () => {
    return (
      <FormGroup
      label={
        <MoreInfoTooltip
          label={t('caches.entries.add-entry-form-lifespan')}
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
    );
  }

  const maxIdleFormGroup = () => {
    return (
      <FormGroup
      label={
        <MoreInfoTooltip
          label={t('caches.entries.add-entry-form-maxidle')}
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
    );
  }

  const valueContentTypeFormGroup = () => {
    return (
      <FormGroup
      label={t('caches.entries.add-entry-form-value-type-label')}
      helperTextInvalid={t(
        'caches.entries.add-entry-form-value-type-invalid'
      )}
      fieldId="value-content-type-helper"
      helperText={valueContentType.helperText}
    >
      <Select
        placeholderText={t(
          'caches.entries.add-entry-form-value-type-select'
        )}
        variant={SelectVariant.typeahead}
        aria-label={t(
          'caches.entries.add-entry-form-value-type-select-label'
        )}
        onToggle={(isExpanded) =>
          setExpanded(isExpanded, setValueContentType)
        }
        onSelect={(event, selection) =>
          setSelection(selection, false, setValueContentType)
        }
        onClear={() => setValueContentType(contentTypeInitialState)}
        selections={valueContentType.selected}
        isOpen={valueContentType.expanded}
      >
        {contentTypeOptions(props.cacheEncoding[1] as EncodingType)}
      </Select>
    </FormGroup>
    );
  }

  const flagsFormGroup = () => {
    return (
      <FormGroup
      label="Flags:"
      fieldId="flags-helper"
      helperText="The flags used to add the entry. See 'org.infinispan.context.Flag' class for more information."
    >
      <Select
        variant={SelectVariant.typeaheadMulti}
        aria-label="Select Flags"
        onToggle={(isExpanded) => setExpanded(isExpanded, setFlags)}
        onSelect={onSelectFlags}
        onClear={() => setFlags(flagsInitialState)}
        selections={flags.selected}
        isOpen={flags.expanded}
        placeholderText="Flags"
        maxHeight={150}
      >
        {flagsOptions()}
      </Select>
    </FormGroup>
    );
  }

  return (
    <Modal
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={isEdition ? 'Edit entry' : 'Add new entry'}
      onClose={() => onClose()}
      aria-label={isEdition ? 'Edit entry form' : 'Add new entry form'}
      actions={[
        <Button key="putEntryButton" onClick={handleAddOrUpdateEntryButton}>
          {isEdition ? 'Edit' : 'Add'}
        </Button>,
        <Button key="cancel" variant="link" onClick={onClose}>
          {t('caches.entries.modal-button-cancel')}
        </Button>,
      ]}
    >
      <Form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        style={{marginBottom: global_spacer_md.value}}
      >
        {error != '' && (
          <Alert variant={AlertVariant.danger} isInline title={error}/>
        )}

        {cacheNameFormGroup()}
        {keyContentTypeFormGroup()}
        {keyFormGroup()}
        {valueContentTypeFormGroup()}
        {valueFormGroup()}
        {lifespanFormGroup()}
        {maxIdleFormGroup()}
      </Form>
      <ExpandableSection
        toggleText={t('caches.entries.add-entry-form-options')}
      >
        <Form
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          {flagsFormGroup()}
        </Form>
      </ExpandableSection>
    </Modal>
  );
};

export { CreateOrUpdateEntryForm };
