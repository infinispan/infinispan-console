import React, { useEffect, useState } from 'react';
import {
  Alert,
  AlertVariant,
  Button,
  ExpandableSection,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Modal,
  Spinner,
  TextArea,
  TextInput
} from '@patternfly/react-core';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core/deprecated';
import { useApiAlert } from '@app/utils/useApiAlert';
import { global_spacer_md } from '@patternfly/react-tokens';
import formUtils, { IField, ISelectField } from '@services/formUtils';
import { useCacheDetail } from '@app/services/cachesHook';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import { CacheConfigUtils } from '@services/cacheConfigUtils';
import { ContentType, EncodingType, InfinispanFlags } from '@services/infinispanRefData';
import { ProtobufDataUtils } from '@services/protobufDataUtils';
import { AddCircleOIcon, PencilAltIcon } from '@patternfly/react-icons';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

const CreateOrUpdateEntryForm = (props: {
  cacheName: string;
  cacheEncoding: CacheEncoding;
  keyToEdit: string;
  keyContentType: ContentType;
  isModalOpen: boolean;
  closeModal: () => void;
}) => {
  const { addAlert } = useApiAlert();
  const { reload } = useCacheDetail();
  const { t } = useTranslation();

  const keyInitialState: IField = {
    value: '',
    isValid: false,
    invalidText: t('caches.entries.add-entry-key-invalid'),
    helperText: t('caches.entries.add-entry-key-help'),
    validated: t('caches.entries.add-entry-key-validated')
  };
  const valueInitialState: IField = {
    value: '',
    isValid: false,
    invalidText: t('caches.entries.add-entry-value-invalid'),
    helperText: t('caches.entries.add-entry-value-help'),
    validated: t('caches.entries.add-entry-value-validated')
  };

  const keyContentTypeInitialState: ISelectField = {
    selected: CacheConfigUtils.getContentTypeOptions(props.cacheEncoding.key as EncodingType)[0],
    expanded: false,
    helperText: 'Select a key content type.'
  };

  const contentTypeInitialState: ISelectField = {
    // add protobuf custom type by default in the values
    selected: CacheConfigUtils.getContentTypeOptions(props.cacheEncoding.value as EncodingType)[0],
    expanded: false,
    helperText: t('caches.entries.add-entry-content-type-help')
  };
  const maxIdleInitialState: IField = {
    value: '',
    isValid: true,
    invalidText: t('caches.entries.add-entry-maxidle-invalid'),
    helperText: t('caches.entries.add-entry-maxidle-help'),
    validated: t('caches.entries.add-entry-maxidle-validated')
  };
  const timeToLiveInitialState: IField = {
    value: '',
    isValid: true,
    invalidText: t('caches.entries.add-entry-lifespan-invalid'),
    helperText: t('caches.entries.add-entry-lifespan-help'),
    validated: t('caches.entries.add-entry-lifespan-validated')
  };
  const flagsInitialState: ISelectField = {
    selected: [],
    expanded: false,
    helperText: t('caches.entries.add-entry-flags-help')
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [key, setKey] = useState<IField>(keyInitialState);
  const [keyContentType, setKeyContentType] = useState<ISelectField>(keyContentTypeInitialState);
  const [value, setValue] = useState<IField>(valueInitialState);
  const [valueContentType, setValueContentType] = useState<ISelectField>(contentTypeInitialState);
  const [maxIdleField, setMaxIdleField] = useState<IField>(maxIdleInitialState);
  const [timeToLiveField, setTimeToLiveField] = useState<IField>(timeToLiveInitialState);
  const [flags, setFlags] = useState<ISelectField>(flagsInitialState);
  const [isEdition, setIsEdition] = useState<boolean>(props.keyToEdit != '');

  useEffect(() => {
    if (!props.isModalOpen) {
      setIsEdition(false);
      return;
    }

    if (props.keyToEdit != '') {
      setIsEdition(true);
      if (
        (props.cacheEncoding.key as EncodingType) == EncodingType.Java ||
        (props.cacheEncoding.key as EncodingType) == EncodingType.JBoss
      ) {
        tryGetEntry(props.keyContentType, true)
          .then((r) => {
            if (r && !Number.isNaN(props.keyToEdit)) {
              return tryGetEntry(ContentType.IntegerContentType, true);
            }
            return false;
          })
          .then((r) => {
            if (r) {
              return tryGetEntry(ContentType.LongContentType, true);
            }
            return false;
          })
          .then((r) => {
            if (r) {
              return tryGetEntry(ContentType.FloatContentType, true);
            }
            return false;
          })
          .then((r) => {
            if (r) {
              return tryGetEntry(ContentType.DoubleContentType, false);
            }
            return false;
          })
          .finally(() => setLoading(false));
      } else {
        tryGetEntry(props.keyContentType, false).finally(() => setLoading(false));
      }
    } else {
      setLoading(false);
    }
  }, [props.isModalOpen]);

  const tryGetEntry = (keyContentType: ContentType, retry: boolean): Promise<boolean> => {
    return ConsoleServices.caches()
      .getEntry(props.cacheName, props.cacheEncoding, props.keyToEdit, keyContentType)
      .then((eitherResponse) => {
        if (eitherResponse.isRight()) {
          if (eitherResponse.value.length == 0) {
            if (retry) {
              return true;
            }
            setError(`The key ${props.keyToEdit} was not found.`);
            setIsEdition(false);
            return false;
          }

          const entry = eitherResponse.value[0];

          setKey((prevState) => {
            return { ...prevState, value: entry.key };
          });
          setValue((prevState) => {
            return { ...prevState, value: entry.value };
          });
          setKeyContentType((prevState) => {
            return {
              ...prevState,
              selected: keyContentType as string
            };
          });
          setValueContentType((prevState) => {
            return {
              ...prevState,
              selected: entry.valueContentType as string
            };
          });
          if (entry.maxIdle) {
            setMaxIdleField((prevState) => {
              return {
                ...prevState,
                value: entry.maxIdle as string
              };
            });
          }
          if (entry.timeToLive) {
            setTimeToLiveField((prevState) => {
              return {
                ...prevState,
                value: entry.timeToLive as string
              };
            });
          }
        } else {
          if (retry) {
            // ignore error if retry
            return true;
          }

          onClose();
          addAlert(eitherResponse.value);
        }
        return false;
      });
  };

  const contentTypeOptions = (encodingType: EncodingType) => {
    return CacheConfigUtils.getContentTypeOptions(encodingType).map((contentType) => (
      <SelectOption id={contentType as string} key={contentType as string} value={contentType} />
    ));
  };

  const flagsOptions = () => {
    return Object.keys(InfinispanFlags).map((key) => <SelectOption id={key} key={key} value={InfinispanFlags[key]} />);
  };

  const setExpanded = (expanded: boolean, stateDispatch: React.Dispatch<React.SetStateAction<ISelectField>>) => {
    stateDispatch((prevState) => {
      return { ...prevState, expanded: expanded };
    });
  };

  const onSelectFlags = (event, selection) => {
    let prevSelectedFlags = flags.selected as string[];

    if (prevSelectedFlags.includes(selection)) {
      prevSelectedFlags = prevSelectedFlags.filter((item) => item !== selection);
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

  const onChangeKey = (key) => {
    formUtils.validateRequiredField(key, 'Key', setKey);
  };

  const onBlurKey = () => {
    // if we detect a custom type in onBlur change the content type to custom type
    if (
      (props.cacheEncoding.key as EncodingType) == EncodingType.Protobuf &&
      ProtobufDataUtils.isCustomType(key.value)
    ) {
      setKeyContentType((prevState) => {
        return {
          ...prevState,
          selected: ContentType.customType as string
        };
      });
    }
  };

  const onChangeValue = (value) => {
    formUtils.validateRequiredField(value, 'Value', setValue);
  };

  const onBlurValue = () => {
    // if we detect a custom type in onBlur change the content type to custom type
    if (
      (props.cacheEncoding.value as EncodingType) == EncodingType.Protobuf &&
      ProtobufDataUtils.isCustomType(value.value)
    ) {
      setValueContentType((prevState) => {
        return {
          ...prevState,
          selected: ContentType.customType as string
        };
      });
    }
  };

  const onChangeMaxIdle = (maxIdle) => {
    formUtils.validateNotRequiredNumericField(maxIdle, 'Max idle', setMaxIdleField);
  };

  const onChangeTimeToLive = (timeToLive) => {
    formUtils.validateNotRequiredNumericField(timeToLive, 'Time to live', setTimeToLiveField);
  };

  const handleAddOrUpdateEntryButton = () => {
    let isValid = true;
    setError('');
    isValid = formUtils.validateRequiredField(key.value.trim(), 'Key', setKey) && isValid;
    isValid = formUtils.validateRequiredField(value.value.trim(), 'Value', setValue) && isValid;
    isValid =
      formUtils.validateNotRequiredNumericField(maxIdleField.value.trim(), 'Max idle', setMaxIdleField) && isValid;
    isValid =
      formUtils.validateNotRequiredNumericField(timeToLiveField.value.trim(), 'Time to live', setTimeToLiveField) &&
      isValid;

    const selectedKeyContentType = keyContentType.selected as ContentType;
    const selectedValueContentType = valueContentType.selected as ContentType;

    if (isValid) {
      ConsoleServices.caches()
        .createOrUpdateEntry(
          props.cacheName,
          props.cacheEncoding,
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
            reload();
            onClose();
          } else {
            setError(response.message);
          }
        });
    }
  };

  const onClose = () => {
    props.closeModal();
    setLoading(true);
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
    const helper = (
      <PopoverHelp
        name="keyContentType"
        label={t('caches.entries.add-entry-form-key-type-label')}
        content={
          props.cacheEncoding.key == EncodingType.Protobuf
            ? "Choose 'Custom Type' to specify keys with custom `_type` json value type."
            : ''
        }
      />
    );

    return (
      <FormGroup
        label={t('caches.entries.add-entry-form-key-type-label')}
        labelIcon={props.cacheEncoding.key == EncodingType.Protobuf ? helper : undefined}
        fieldId="key-content-type-helper"
        placeholder={t('caches.entries.add-entry-form-key-type')}
        disabled={isEdition}
        isRequired
      >
        <Select
          maxHeight={200}
          placeholderText={t('caches.entries.add-entry-form-key-type-select')}
          variant={SelectVariant.typeahead}
          aria-label={t('caches.entries.add-entry-form-key-type-select-label')}
          onToggle={(_event, isExpanded) => setExpanded(isExpanded, setKeyContentType)}
          onSelect={(event, selection) => setSelection(selection, false, setKeyContentType)}
          onClear={() => setKeyContentType(keyContentTypeInitialState)}
          selections={keyContentType.selected}
          isOpen={keyContentType.expanded}
          isDisabled={isEdition}
          toggleId="keyContentType"
        >
          {contentTypeOptions(props.cacheEncoding.key as EncodingType)}
        </Select>
        <FormHelperText>
          <HelperText>
            <HelperTextItem>{keyContentType.helperText}</HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>
    );
  };

  const cacheNameFormGroup = () => {
    return (
      <FormGroup label={t('caches.entries.add-entry-form-cache-name')} isRequired fieldId="cache-name" disabled={true}>
        <TextInput isDisabled value={props.cacheName} id="cacheName" aria-describedby="cache-name-helper" />
      </FormGroup>
    );
  };

  const keyFormGroup = () => {
    const helper = (
      <PopoverHelp
        name="key"
        label={t('caches.entries.add-entry-form-key')}
        content={
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
    );

    return (
      <FormGroup
        label={t('caches.entries.add-entry-form-key')}
        labelIcon={props.cacheEncoding.key == EncodingType.Protobuf ? helper : undefined}
        isRequired
        fieldId="key-entry"
        disabled={isEdition}
      >
        <TextArea
          isRequired
          validated={key.validated}
          value={key.value}
          id="key-entry"
          aria-describedby="key-entry-helper"
          onChange={(_event, key) => onChangeKey(key)}
          onBlur={onBlurKey}
          isDisabled={isEdition}
        />
        <FormHelperText>
          <HelperText>
            <HelperTextItem
              variant={key.validated}
              {...(key.validated === 'error' && { icon: <ExclamationCircleIcon /> })}
            >
              {key.validated === 'error' ? key.invalidText : key.helperText}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>
    );
  };

  const valueFormGroup = () => {
    const helper = (
      <PopoverHelp
        name="value"
        label={t('caches.entries.add-entry-form-value')}
        content={
          'The value can contain simple values but also JSON ' +
          'that are automatically converted to and from Protostream.\n ' +
          'When writing JSON documents, a special field _type must be present.\n' +
          '{\n' +
          '   "_type": "org.infinispan.Person",\n' +
          '   "name": "user1",\n' +
          '   "age": 32\n' +
          '}'
        }
      />
    );

    return (
      <FormGroup
        label={t('caches.entries.add-entry-form-value')}
        labelIcon={props.cacheEncoding.value == EncodingType.Protobuf ? helper : undefined}
        isRequired
        fieldId="value-entry"
      >
        <TextArea
          isRequired
          validated={value.validated}
          value={value.value}
          id="value-entry"
          aria-describedby="value-entry-helper"
          onChange={(_event, value) => onChangeValue(value)}
          onBlur={onBlurValue}
        />
        <FormHelperText>
          <HelperText>
            <HelperTextItem
              variant={value.validated}
              {...(value.validated === 'error' && { icon: <ExclamationCircleIcon /> })}
            >
              {value.validated === 'error' ? value.invalidText : value.helperText}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>
    );
  };

  const lifespanFormGroup = () => {
    return (
      <FormGroup
        label={t('caches.entries.add-entry-form-lifespan')}
        labelIcon={
          <PopoverHelp
            name="lifespan"
            label={t('caches.entries.add-entry-form-lifespan')}
            content={
              'Sets the number of seconds before ' +
              'the entry is automatically deleted. If you do not set this parameter, ' +
              'Infinispan uses the default value from the configuration. ' +
              'If you set a negative value, the entry is never deleted.\n' +
              '\n'
            }
          />
        }
        type="number"
        fieldId="timeToLive"
      >
        <TextInput
          validated={timeToLiveField.validated}
          value={timeToLiveField.value}
          id="timeToLive"
          aria-describedby="timeToLive-helper"
          onChange={(_event, timeToLive) => onChangeTimeToLive(timeToLive)}
        />
        <FormHelperText>
          <HelperText>
            <HelperTextItem
              variant={timeToLiveField.validated}
              {...(timeToLiveField.validated === 'error' && { icon: <ExclamationCircleIcon /> })}
            >
              {timeToLiveField.validated === 'error' ? timeToLiveField.invalidText : timeToLiveField.helperText}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>
    );
  };

  const maxIdleFormGroup = () => {
    return (
      <FormGroup
        label={t('caches.entries.add-entry-form-maxidle')}
        labelIcon={
          <PopoverHelp
            name="maxidle"
            label={t('caches.entries.add-entry-form-maxidle')}
            content={
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
        fieldId="maxIdle"
      >
        <TextInput
          validated={maxIdleField.validated}
          value={maxIdleField.value}
          id="maxIdle"
          aria-describedby="maxIdle-helper"
          onChange={(_event, maxIdle) => onChangeMaxIdle(maxIdle)}
        />
        <FormHelperText>
          <HelperText>
            <HelperTextItem
              variant={maxIdleField.validated}
              {...(maxIdleField.validated === 'error' && { icon: <ExclamationCircleIcon /> })}
            >
              {maxIdleField.validated === 'error' ? maxIdleField.invalidText : maxIdleField.helperText}
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>
    );
  };

  const valueContentTypeFormGroup = () => {
    const helper = (
      <PopoverHelp
        name="valueContentType"
        label={t('caches.entries.add-entry-form-value-type-label')}
        content={"Choose 'Custom Type' to specify values with custom `_type` json value type."}
      />
    );
    return (
      <FormGroup
        label={t('caches.entries.add-entry-form-value-type-label')}
        labelIcon={props.cacheEncoding.value == EncodingType.Protobuf ? helper : undefined}
        fieldId="value-content-type-helper"
        isRequired
      >
        <Select
          maxHeight={200}
          placeholderText={t('caches.entries.add-entry-form-value-type-select')}
          variant={SelectVariant.typeahead}
          aria-label={t('caches.entries.add-entry-form-value-type-select-label')}
          onToggle={(_event, isExpanded) => setExpanded(isExpanded, setValueContentType)}
          onSelect={(event, selection) => setSelection(selection, false, setValueContentType)}
          onClear={() => setValueContentType(contentTypeInitialState)}
          selections={valueContentType.selected}
          isOpen={valueContentType.expanded}
          toggleId="valueContentType"
        >
          {contentTypeOptions(props.cacheEncoding.value as EncodingType)}
        </Select>
        <FormHelperText>
          <HelperText>
            <HelperTextItem>{valueContentType.helperText}</HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>
    );
  };

  const flagsFormGroup = () => {
    const helper = (
      <PopoverHelp
        name="flags"
        label={t('caches.entries.add-entry-form-flags')}
        content={'Apply flags to alter the default behavior adding or updating an entry.'}
      />
    );
    return (
      <FormGroup label={t('caches.entries.add-entry-form-flags')} labelIcon={helper} fieldId="flags-helper">
        <Select
          variant={SelectVariant.typeaheadMulti}
          aria-label={t('caches.entries.add-entry-form-flags-label')}
          onToggle={(_event, isExpanded) => setExpanded(isExpanded, setFlags)}
          onSelect={onSelectFlags}
          onClear={() => setFlags(flagsInitialState)}
          selections={flags.selected}
          isOpen={flags.expanded}
          placeholderText={t('caches.entries.add-entry-form-flags-label')}
          maxHeight={150}
          toggleId="ispnFlags"
        >
          {flagsOptions()}
        </Select>
        <FormHelperText>
          <HelperText>
            <HelperTextItem>{t('caches.entries.add-entry-form-flags-help')}</HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>
    );
  };

  return (
    <Modal
      titleIconVariant={isEdition ? PencilAltIcon : AddCircleOIcon}
      className="pf-m-redhat-font"
      width={'50%'}
      isOpen={props.isModalOpen}
      title={isEdition ? 'Edit entry' : 'Add new entry'}
      onClose={onClose}
      aria-label={isEdition ? 'Edit entry form' : 'Add new entry form'}
      actions={[
        <Button data-cy="addButton" key="putEntryButton" onClick={handleAddOrUpdateEntryButton}>
          {isEdition ? 'Edit' : 'Add'}
        </Button>,
        <Button data-cy="cancelButton" key="cancel" variant="link" onClick={onClose}>
          {t('caches.entries.modal-button-cancel')}
        </Button>
      ]}
    >
      {loading ? <Spinner size={'sm'} /> : ''}
      <Form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        style={{ marginBottom: global_spacer_md.value }}
      >
        {error != '' && <Alert variant={AlertVariant.danger} isInline title={error} />}

        {cacheNameFormGroup()}
        {keyContentTypeFormGroup()}
        {keyFormGroup()}
        {valueContentTypeFormGroup()}
        {valueFormGroup()}
        {lifespanFormGroup()}
        {maxIdleFormGroup()}
      </Form>
      <ExpandableSection toggleText={t('caches.entries.add-entry-form-options')}>
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
