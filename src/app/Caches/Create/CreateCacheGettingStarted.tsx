import React, { useEffect, useState } from 'react';

import {
  Form,
  FormGroup,
  FormSection,
  FormHelperText,
  HelperText,
  HelperTextItem,
  Radio,
  TextInput
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import { ExclamationCircleIcon } from '@patternfly/react-icons';
import { useCreateCache } from '@app/services/createCacheHook';

const CreateCacheGettingStarted = (props: { create: boolean }) => {
  const { configuration, setConfiguration } = useCreateCache();
  const { t } = useTranslation();
  const [cacheName, setCacheName] = useState(configuration.start.cacheName);
  const [validName, setValidName] = useState<'success' | 'error' | 'default'>(
    configuration.start.valid ? 'success' : 'default'
  );
  const [createType, setCreateType] = useState<'configure' | 'edit'>(configuration.start.createType);
  const id = props.create ? 'create' : 'setup';

  const handleChangeName = (name) => {
    // Check if name is not null or empty
    if (name.length > 0) {
      setValidName('default');
    } else {
      setValidName('error');
    }
    setCacheName(name);
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
        <FormGroup label={t('caches.create.getting-started.cache-name-label')} isRequired fieldId="cache-name">
          <TextInput
            isRequired
            type="text"
            id="cache-name"
            name="cache-name"
            aria-describedby="cache-name-helper"
            value={cacheName}
            onChange={(_event, name) => handleChangeName(name)}
            validated={validName}
          />
          <FormHelperText>
            <HelperText>
              <HelperTextItem variant={validName} {...(validName === 'error' && { icon: <ExclamationCircleIcon /> })}>
                {validName === 'error'
                  ? t('caches.create.getting-started.cache-name-label-invalid')
                  : t('caches.create.getting-started.cache-name-label-help')}
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
        </FormGroup>
      </FormSection>
    );
  };

  const formConfigCache = () => {
    return (
      <FormSection title={t(`caches.${id}.getting-started.cache-${id}-title`)} titleElement="h2">
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
