import React, { useEffect, useState } from 'react';

import { Form, FormGroup, FormSection, Radio, TextInput } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { useCreateCache } from '@app/services/createCacheHook';

const CreateCacheGettingStarted = () => {
  let { configuration, setConfiguration } = useCreateCache();
  const { t } = useTranslation();
  const [cacheName, setCacheName] = useState(configuration.start.cacheName);
  const [validName, setValidName] = useState<'success' | 'error' | 'default'>(
    configuration.start.valid ? 'success' : 'default'
  );
  const [createType, setCreateType] = useState<'configure' | 'edit'>(configuration.start.createType);

  const handleChangeName = (name) => {
    let trimmedName = name.trim();

    // Check if name is not null or empty
    if (trimmedName.length > 0) {
      setValidName('default');
    } else {
      setValidName('error');
    }
    setCacheName(trimmedName);
  };

  useEffect(() => {
    if (cacheName === '') {
      setValidName('default');
      return;
    }

    ConsoleServices.caches()
      .cacheExists(cacheName)
      .then((response) => {
        if (response.success) {
          // the cache already exists
          setValidName('error');
        } else {
          setValidName('success');
        }
      })
      .catch((ex) => setValidName('error'));
  }, [cacheName]);

  useEffect(() => {
    setConfiguration((prevState) => {
      return {
        ...prevState,
        start: {
          cacheName: cacheName,
          createType: createType,
          valid: validName === 'success'
        }
      };
    });
  }, [cacheName, createType, validName]);

  const formCacheName = () => {
    return (
      <FormSection title={t('caches.create.getting-started.cache-name-title')} titleElement="h2">
        <FormGroup
          label={t('caches.create.getting-started.cache-name-label')}
          isRequired
          fieldId="cache-name"
          validated={validName}
          helperTextInvalid={t('caches.create.getting-started.cache-name-label-invalid')}
          helperText={t('caches.create.getting-started.cache-name-label-help')}
          helperTextInvalidIcon={<ExclamationCircleIcon />}
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
      </FormSection>
    );
  };

  const formConfigCache = () => {
    return (
      <FormSection title={t('caches.create.getting-started.cache-create-title')} titleElement="h2">
        <FormGroup isInline isRequired fieldId="create-type">
          <Radio
            name="radio"
            id="configure"
            onChange={() => setCreateType('configure')}
            isChecked={createType === 'configure'}
            label={t('caches.create.getting-started.cache-create-builder')}
            description={t('caches.create.getting-started.cache-create-builder-help')}
          />
          <Radio
            name="radio"
            id="edit"
            onChange={() => setCreateType('edit')}
            isChecked={createType === 'edit'}
            label={t('caches.create.getting-started.cache-create-add')}
            description={t('caches.create.getting-started.cache-create-add-help')}
          />
        </FormGroup>
      </FormSection>
    );
  };

  return (
    <Form
      isWidthLimited
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      {formCacheName()}
      {formConfigCache()}
    </Form>
  );
};

export default CreateCacheGettingStarted;
