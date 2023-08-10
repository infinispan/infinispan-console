import React, { useEffect, useState } from 'react';
import {
  Form,
  FormGroup,
  FormSection,
  Grid,
  GridItem,
  HelperText,
  HelperTextItem,
  Switch,
  TextInput
} from '@patternfly/react-core';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core/deprecated';
import { CacheFeature, StorageType } from '@services/infinispanRefData';
import { useTranslation } from 'react-i18next';
import TransactionalConfigurationTuning from '@app/Caches/Create/AdvancedTuning/TransactionalConfigurationTuning';
import { useCreateCache } from '@app/services/createCacheHook';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import IndexedConfigurationTuning from '@app/Caches/Create/AdvancedTuning/IndexedConfigurationTuning';
import BackupsCofigurationTuning from '@app/Caches/Create/AdvancedTuning/BackupsCofigurationTuning';

const AdvancedOptionsConfigurator = () => {
  const { t } = useTranslation();
  const { configuration, setConfiguration } = useCreateCache();
  const brandname = t('brandname.brandname');

  const [storage, setStorage] = useState<StorageType | undefined>(configuration.advanced.storage as StorageType);
  const [concurrencyLevel, setConcurrencyLevel] = useState<number | undefined>(configuration.advanced.concurrencyLevel);
  const [lockAcquisitionTimeout, setLockAcquisitionTimeout] = useState<number | undefined>(
    configuration.advanced.lockAcquisitionTimeout
  );
  const [striping, setStriping] = useState<boolean>(configuration.advanced.striping!);
  const [isOpenStorage, setIsOpenStorage] = useState(false);

  useEffect(() => {
    setConfiguration((prevState) => {
      return {
        ...prevState,
        advanced: {
          ...prevState.advanced,
          storage: storage,
          concurrencyLevel: concurrencyLevel,
          lockAcquisitionTimeout: lockAcquisitionTimeout,
          striping: striping,
          valid: true
        }
      };
    });
  }, [storage, concurrencyLevel, lockAcquisitionTimeout, striping]);

  const handleConcurrencyLevel = (value) => {
    setConcurrencyLevel(value);
  };

  const handleLockAcquisitionTimeout = (value) => {
    setLockAcquisitionTimeout(value);
  };

  const onSelectStorage = (event, selection, isPlaceholder) => {
    setStorage(selection);
    setIsOpenStorage(false);
  };

  // Options for Storage
  const storageOptions = () => {
    return Object.keys(StorageType).map((key) => <SelectOption id={key} key={key} value={StorageType[key]} />);
  };

  const formMemory = () => {
    return (
      <FormGroup
        isInline
        fieldId="field-storage"
        label={t('caches.create.configurations.advanced-options.storage-title')}
        labelIcon={
          <PopoverHelp
            name="storage"
            label={t('caches.create.configurations.advanced-options.storage-title')}
            content={t('caches.create.configurations.advanced-options.storage-tooltip')}
          />
        }
      >
        <Select
          variant={SelectVariant.single}
          aria-label="storage-select"
          onToggle={() => setIsOpenStorage(!isOpenStorage)}
          onSelect={onSelectStorage}
          selections={storage}
          isOpen={isOpenStorage}
          aria-labelledby="toggle-id-storage"
          placeholderText={StorageType.HEAP}
          toggleId="storageSelector"
          width={200}
        >
          {storageOptions()}
        </Select>
      </FormGroup>
    );
  };

  const formLocking = () => {
    return (
      <FormSection title={t('caches.create.configurations.advanced-options.locking-title')}>
        <HelperText>
          <HelperTextItem>{t('caches.create.configurations.advanced-options.locking-tooltip')}</HelperTextItem>
        </HelperText>
        <Grid hasGutter md={4}>
          <FormGroup
            isInline
            fieldId="field-concurrency-level"
            label={t('caches.create.configurations.advanced-options.concurrency-level-title')}
            labelIcon={
              <PopoverHelp
                name="concurrency-level"
                label={t('caches.create.configurations.advanced-options.concurrency-level-title')}
                content={t('caches.create.configurations.advanced-options.concurrency-level-tooltip')}
              />
            }
          >
            <TextInput
              placeholder="32"
              value={concurrencyLevel}
              type="number"
              onChange={(_event, value) => handleConcurrencyLevel(value)}
              aria-label="concurrency-level-input"
              data-cy="concurencyLevel"
            />
          </FormGroup>
          <FormGroup
            isInline
            fieldId="field-lock-acquisition-timeout"
            label={t('caches.create.configurations.advanced-options.lock-acquisition-timeout-title')}
            labelIcon={
              <PopoverHelp
                name="lock-acquisition-timeout"
                label={t('caches.create.configurations.advanced-options.lock-acquisition-timeout-title')}
                content={t('caches.create.configurations.advanced-options.lock-acquisition-timeout-tooltip')}
              />
            }
          >
            <TextInput
              placeholder="10"
              value={lockAcquisitionTimeout}
              type="number"
              onChange={(_event, value) => handleLockAcquisitionTimeout(value)}
              aria-label="lock-acquisition-timeout-input"
              data-cy="lockTimeout"
            />
          </FormGroup>
          <GridItem span={12}>
            <FormGroup fieldId="field-striping">
              <Switch
                aria-label="striping"
                data-cy="stripingSwitch"
                id="striping"
                isChecked={striping === undefined ? false : striping}
                onChange={() => setStriping(!striping)}
                label={t('caches.create.configurations.advanced-options.striping')}
              />
              <PopoverHelp
                name={'striping'}
                label={t('caches.create.configurations.advanced-options.striping')}
                content={t('caches.create.configurations.advanced-options.striping-tooltip')}
              />
            </FormGroup>
          </GridItem>
        </Grid>
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
      {formMemory()}
      {formLocking()}
      <IndexedConfigurationTuning />
      <BackupsCofigurationTuning />
      <TransactionalConfigurationTuning />
    </Form>
  );
};

export default AdvancedOptionsConfigurator;
