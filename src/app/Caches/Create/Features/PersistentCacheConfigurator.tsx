import React, { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Flex,
  FlexItem,
  FormGroup,
  HelperText,
  HelperTextItem,
  Hint,
  HintBody,
  HintFooter,
  Select,
  SelectOption,
  SelectVariant,
  Switch,
  Text,
  TextContent,
  TextInput,
  TextVariants
} from '@patternfly/react-core';
import { CodeEditor, Language } from '@patternfly/react-code-editor';
import { useTranslation } from 'react-i18next';
import { PersistentCacheStorage, PersistentStorageConfig } from '@services/infinispanRefData';
import { kebabCase } from '@app/utils/convertStringCase';
import { useCreateCache } from '@app/services/createCacheHook';
import { FeatureCard } from '@app/Caches/Create/Features/FeatureCard';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import { global_spacer_md } from '@patternfly/react-tokens';

const PersistentCacheConfigurator = () => {
  const { configuration, setConfiguration } = useCreateCache();
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const [passivation, setPassivation] = useState(configuration.feature.persistentCache.passivation);
  const [connectionAttempts, setConnectionAttempts] = useState(
    configuration.feature.persistentCache.connectionAttempts
  );
  const [connectionInterval, setConnectionInterval] = useState(
    configuration.feature.persistentCache.connectionInterval
  );
  const [availabilityInterval, setAvailabilityInterval] = useState(
    configuration.feature.persistentCache.availabilityInterval
  );

  const [storage, setStorage] = useState(configuration.feature.persistentCache.storage as PersistentCacheStorage);
  const [config, setConfig] = useState(configuration.feature.persistentCache.config);
  const [valid, setValid] = useState(configuration.feature.persistentCache.valid);
  const [isOpenStorages, setIsOpenStorages] = useState(false);

  useEffect(() => {
    setConfiguration((prevState) => {
      return {
        ...prevState,
        feature: {
          ...prevState.feature,
          persistentCache: {
            passivation: passivation,
            connectionAttempts: connectionAttempts,
            connectionInterval: connectionInterval,
            availabilityInterval: availabilityInterval,
            storage: storage,
            config: config,
            valid: persistentFeatureValidation()
          }
        }
      };
    });
  }, [passivation, connectionAttempts, connectionInterval, availabilityInterval, storage, config, valid]);

  const persistentFeatureValidation = (): boolean => {
    return valid;
  };

  const onSelectStorage = (event, selection) => {
    setStorage(selection);
    let initConfig = PersistentStorageConfig.get(PersistentCacheStorage[selection as PersistentCacheStorage]);
    setConfig(initConfig ? initConfig : '');
    setIsOpenStorages(false);
    setValid(true);
  };

  const persistentStorageOptions = () => {
    return Object.keys(PersistentCacheStorage).map((key) => (
      <SelectOption id={key} key={key} value={key}>
        {PersistentCacheStorage[key]}
      </SelectOption>
    ));
  };

  const changeAndValidate = (value: string) => {
    setConfig(value);
    try {
      JSON.parse(value);
      setValid(true);
    } catch (e) {
      setValid(false);
    }
  };

  const displayValidationError = () => {
    if (valid) {
      return '';
    }

    return (
      <HelperText>
        <HelperTextItem variant="warning" hasIcon>
          {t('caches.create.configurations.feature.persistent-error', { brandname: brandname })}
        </HelperTextItem>
      </HelperText>
    );
  };

  const displayEditor = () => {
    if (!storage) {
      return '';
    }

    const storageJARS = [PersistentCacheStorage.JDBCStore, PersistentCacheStorage.Custom];

    return (
      <React.Fragment>
        <Hint>
          <HintBody>{t('caches.create.configurations.feature.persistent-hint')}</HintBody>
          <HintFooter>
            <Button variant="link" isInline onClick={() => window.open(t('brandname.persistence-docs-link'), '_blank')}>
              {t('caches.create.configurations.feature.persistent-hint-link')}
            </Button>
          </HintFooter>
        </Hint>
        <FormGroup fieldId="storage-configuration" isRequired>
          <TextContent>
            <Text component={TextVariants.h3}>{PersistentCacheStorage[storage]}</Text>
            <Text component={TextVariants.p}>
              {t('caches.create.configurations.feature.' + kebabCase(storage) + '-description', {
                brandname: brandname
              })}
            </Text>
          </TextContent>

          {storageJARS.includes(PersistentCacheStorage[storage]) && (
            <Alert
              style={{ margin: global_spacer_md.value + ' 0' }}
              variant="warning"
              title={t('caches.create.configurations.feature.persistent-storage-jar-warning', {
                persistentStorage: PersistentCacheStorage[storage]
              })}
            />
          )}

          <CodeEditor
            isLineNumbersVisible
            isLanguageLabelVisible
            code={config}
            onChange={changeAndValidate}
            language={Language.json}
            height={'sizeToFit'}
          />
          {displayValidationError()}
        </FormGroup>
      </React.Fragment>
    );
  };

  return (
    <FeatureCard
      title="caches.create.configurations.feature.persistent"
      description="caches.create.configurations.feature.persistent-description"
    >
      <FormGroup fieldId="passivation">
        <Switch
          aria-label="passivation"
          data-cy="passivationSwitch"
          id="passivation"
          isChecked={passivation === undefined ? false : passivation}
          onChange={() => setPassivation(!passivation)}
          label={t('caches.create.configurations.feature.passivation')}
        />
        <PopoverHelp
          name={'passivation'}
          label={t('caches.create.configurations.feature.passivation')}
          content={t('caches.create.configurations.feature.passivation-tooltip', { brandname: brandname })}
        />
      </FormGroup>
      <Flex>
        <FlexItem grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>
          <FormGroup
            isInline
            fieldId="connection-attempts"
            label={t('caches.create.configurations.feature.connection-attempts')}
            labelIcon={
              <PopoverHelp
                name={'connection-attempts'}
                label={t('caches.create.configurations.feature.connection-attempts')}
                content={t('caches.create.configurations.feature.connection-attempts-tooltip', {
                  brandname: brandname
                })}
              />
            }
          >
            <TextInput
              data-cy="connectionAttempts"
              placeholder="10"
              value={connectionAttempts}
              type="number"
              onChange={(val) => {
                isNaN(parseInt(val)) ? setConnectionAttempts(undefined!) : setConnectionAttempts(parseInt(val));
              }}
              aria-label="connection-attempts"
            />
          </FormGroup>
        </FlexItem>
        <FlexItem grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>
          <FormGroup
            isInline
            fieldId="connection-interval"
            label={t('caches.create.configurations.feature.connection-interval')}
            labelIcon={
              <PopoverHelp
                name={'connection-interval'}
                label={t('caches.create.configurations.feature.connection-interval')}
                content={t('caches.create.configurations.feature.connection-interval-tooltip', {
                  brandname: brandname
                })}
              />
            }
          >
            <TextInput
              data-cy="connectionInterval"
              placeholder="50"
              value={connectionInterval}
              type="number"
              onChange={(val) => {
                isNaN(parseInt(val)) ? setConnectionInterval(undefined!) : setConnectionInterval(parseInt(val));
              }}
              aria-label="connection-interval"
            />
          </FormGroup>
        </FlexItem>
        <FlexItem grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>
          <FormGroup
            isInline
            fieldId="availability-interval"
            label={t('caches.create.configurations.feature.availability-interval')}
            labelIcon={
              <PopoverHelp
                name={'availability-interval'}
                label={t('caches.create.configurations.feature.availability-interval')}
                content={t('caches.create.configurations.feature.availability-interval-tooltip', {
                  brandname: brandname
                })}
              />
            }
          >
            <TextInput
              data-cy="availabilityInterval"
              placeholder="1000"
              value={availabilityInterval}
              type="number"
              onChange={(val) => {
                isNaN(parseInt(val)) ? setAvailabilityInterval(undefined!) : setAvailabilityInterval(parseInt(val));
              }}
              aria-label="availability-interval"
            />
          </FormGroup>
        </FlexItem>
      </Flex>
      <FormGroup
        fieldId="storages"
        isRequired
        validated={storage.toString() !== '' ? 'success' : 'error'}
        label={t('caches.create.configurations.feature.storages')}
        labelIcon={
          <PopoverHelp
            name={'storages'}
            label={t('caches.create.configurations.feature.storages')}
            content={t('caches.create.configurations.feature.storages-tooltip', { brandname: brandname })}
          />
        }
      >
        <Select
          variant={SelectVariant.single}
          typeAheadAriaLabel="persistent-storage"
          onToggle={() => setIsOpenStorages(!isOpenStorages)}
          onSelect={onSelectStorage}
          selections={storage}
          isOpen={isOpenStorages}
          aria-labelledby="persistent-storage"
          placeholderText={t('caches.create.configurations.feature.storage-placeholder')}
          validated={storage.toString() !== '' ? 'success' : 'error'}
          toggleId="persistentStorage"
        >
          {persistentStorageOptions()}
        </Select>
      </FormGroup>
      {displayEditor()}
    </FeatureCard>
  );
};

export default PersistentCacheConfigurator;
