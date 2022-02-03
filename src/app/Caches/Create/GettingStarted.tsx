import React, { useState, useEffect } from 'react';

import {
  Form,
  FormGroup,
  Text,
  TextContent,
  TextInput,
  TextVariants,
  Radio,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

const GettingStarted: React.FunctionComponent<any> = ({
  formValue,
  isFormValid,
  onFormChange,
  areAllStepsValid,
}) => {
  const { t } = useTranslation();
  const [cacheName, setCacheName] = useState(formValue.cacheName || '');
  const [validName, setValidName] = useState<'success' | 'error' | 'default'>(
    'default'
  );
  const [createType, setCreateType] = useState<'configure' | 'edit'>(
    formValue.createType || ''
  );

  const handleChangeName = (name) => {
    if (name.length > 0) {
      setCacheName(name);
      setValidName('success');
    }
  };

  useEffect(() => {
    if (cacheName && validName === 'success' && createType) {
      onFormChange(true, {
        cacheName: cacheName,
        createType: createType,
      });
    } else {
      onFormChange(false, {});
    }
  }, [cacheName, createType]);

  const formCacheName = () => {
    return (
      <React.Fragment>
        <FormGroup
          label={t('caches.create.cache-name')}
          isRequired
          fieldId="cache-name"
          helperText={t('caches.create.cache-name-help')}
          validated={validName}
          helperTextInvalid={t('caches.create.cache-name-help-invalid')}
        >
          <TextInput
            isRequired
            type="text"
            id="cache-name"
            name="cache-name"
            aria-describedby="cache-name-helper"
            value={cacheName}
            onChange={handleChangeName}
            validated={validName}
          />
        </FormGroup>
      </React.Fragment>
    );
  };

  const formConfigCache = () => {
    return (
      <React.Fragment>
        <FormGroup
          isInline
          isRequired
          fieldId="create-type"
          // helperText={t('caches.create.cache-name-help')}
          // validated={validName}
          // helperTextInvalid={t('caches.create.cache-name-help-invalid')}
        >
          <Radio
            name="radio"
            id="configure"
            isDisabled
            onChange={() => setCreateType('configure')}
            isChecked={createType === 'configure'}
            label={
              <TextContent>
                <Text component={TextVariants.h3}>Configure a new cache</Text>
              </TextContent>
            }
            description="Description of Configure a new cache"
          />
          <Radio
            name="radio"
            id="edit"
            onChange={() => setCreateType('edit')}
            isChecked={createType === 'edit'}
            label={
              <TextContent>
                <Text component={TextVariants.h3}>
                  Use editor to config a cache
                </Text>
              </TextContent>
            }
            description="Description of Use editor to config a cache"
          />
        </FormGroup>
      </React.Fragment>
    );
  };

  return (
    <React.Fragment>
      <Form>
        <TextContent>
          <Text component={TextVariants.h1}>Getting Started</Text>
        </TextContent>

        <TextContent>
          <Text component={TextVariants.h3}>1. Give a name to your cache</Text>
        </TextContent>

        {formCacheName()}

        <TextContent>
          <Text component={TextVariants.h3}>2. What do you want to do?</Text>
        </TextContent>

        {formConfigCache()}
      </Form>
    </React.Fragment>
  );
};

export default GettingStarted;
