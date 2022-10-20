import React, { useEffect, useState } from 'react';
import {
  FormGroup,
  Grid,
  GridItem,
  InputGroup,
  Radio,
  Select,
  SelectOption,
  SelectVariant,
  TextInput
} from '@patternfly/react-core';
import { EvictionStrategy, EvictionType, MaxSizeUnit } from '@services/infinispanRefData';
import { useTranslation } from 'react-i18next';
import { FeatureCard } from '@app/Caches/Create/Features/FeatureCard';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import { useCreateCache } from '@app/services/createCacheHook';

const BoundedCacheConfigurator = () => {
  const { t } = useTranslation();
  const { configuration, setConfiguration } = useCreateCache();
  const brandname = t('brandname.brandname');

  //Bounded Cache
  const [evictionType, setEvictionType] = useState<'size' | 'count'>(configuration.feature.boundedCache.evictionType);
  const [maxSize, setMaxSize] = useState<string>(configuration.feature.boundedCache.maxSize.toString());
  const [maxCount, setMaxCount] = useState<string>(configuration.feature.boundedCache.maxCount.toString());
  const [evictionStrategy, setEvictionStrategy] = useState<string>(configuration.feature.boundedCache.evictionStrategy);

  const [isOpenEvictionStrategy, setIsOpenEvictionStrategy] = useState(false);
  const [isOpenMaxSizeUnit, setIsOpenMaxSizeUnit] = useState(false);

  // Helper states for the maxSize input
  const [maxSizeUnit, setMaxSizeUnit] = useState<MaxSizeUnit>(MaxSizeUnit.MB);

  const boundedFeatureValidation = (): boolean => {
    if (evictionType === EvictionType.size) {
      return parseInt(maxSize) > 0;
    } else {
      return parseInt(maxCount) > 0;
    }
  };

  useEffect(() => {
    setConfiguration((prevState) => {
      return {
        ...prevState,
        feature: {
          ...prevState.feature,
          boundedCache: {
            evictionType: evictionType,
            maxSize: evictionType === 'size' ? parseInt(maxSize) : 0,
            maxCount: evictionType === 'count' ? parseInt(maxCount) : 0,
            evictionStrategy: evictionStrategy,
            maxSizeUnit: maxSizeUnit.toString(),
            valid: boundedFeatureValidation()
          }
        }
      };
    });
  }, [evictionType, maxSize, maxCount, evictionStrategy, maxSizeUnit]);

  const onSelectEvictionStrategy = (event, selection, isPlaceholder) => {
    setEvictionStrategy(selection);
    setIsOpenEvictionStrategy(false);
  };

  const onSelectMaxCountUnit = (event, selection, isPlaceholder) => {
    setMaxSizeUnit(selection);
    setIsOpenMaxSizeUnit(false);
  };

  // Options for Eviction Strategy
  const evictionStrategyOptions = () => {
    return Object.keys(EvictionStrategy).map((key) => (
      <SelectOption id={key} key={key} value={EvictionStrategy[key]} />
    ));
  };

  // Options for Max Size Unit
  const unitOptions = () => {
    return Object.keys(MaxSizeUnit).map((key) => <SelectOption id={key} key={key} value={MaxSizeUnit[key]} />);
  };

  const validateBoundedValue = (testedEvictionType: 'count' | 'size'): 'success' | 'default' | 'error' => {
    if (evictionType !== testedEvictionType) {
      return 'default';
    }
    const test = evictionType === 'count' ? maxCount : maxSize;
    if (/^\d+$/.test(test)) {
      if (parseInt(test, 10) > 0) {
        return 'success';
      } else {
        return 'error';
      }
    }
    return 'error';
  };

  return (
    <FeatureCard
      title={'caches.create.configurations.feature.bounded'}
      description={'caches.create.configurations.feature.bounded-tooltip'}
    >
      <Grid hasGutter md={6}>
        <GridItem span={12}>
          <FormGroup isInline isRequired fieldId="radio-size-count">
            <Radio
              name="radio-size-count"
              id="size"
              onChange={() => setEvictionType(EvictionType.size)}
              isChecked={evictionType === EvictionType.size}
              label={t('caches.create.configurations.feature.radio-max-size')}
            />
            <Radio
              name="radio-size-count"
              id="count"
              onChange={() => setEvictionType(EvictionType.count)}
              isChecked={evictionType === EvictionType.count}
              label={t('caches.create.configurations.feature.radio-max-count')}
            />
          </FormGroup>
        </GridItem>
        {evictionType === 'size' && (
          <FormGroup
            label={t('caches.create.configurations.feature.max-size')}
            labelIcon={
              <PopoverHelp
                name={'max-size'}
                label={t('caches.create.configurations.feature.max-size')}
                content={t('caches.create.configurations.feature.max-size-tooltip', { brandname: brandname })}
              />
            }
            isRequired
            fieldId="max-size"
            type="number"
            validated={validateBoundedValue('size')}
            helperTextInvalid={t('caches.create.configurations.feature.max-size-helper-invalid')}
          >
            <InputGroup>
              <TextInput
                data-cy="memorySizeInput"
                validated={validateBoundedValue('size')}
                min={0}
                value={maxSize}
                type="number"
                onChange={(v) => setMaxSize(v)}
                aria-label="max-size-number-input"
              />
              <Select
                variant={SelectVariant.single}
                aria-label="max-size-unit-input"
                onToggle={() => setIsOpenMaxSizeUnit(!isOpenMaxSizeUnit)}
                onSelect={onSelectMaxCountUnit}
                selections={maxSizeUnit}
                isOpen={isOpenMaxSizeUnit}
                aria-labelledby="toggle-id-max-size-unit"
                width={'20%'}
                toggleId="memorySizeUnit"
              >
                {unitOptions()}
              </Select>
            </InputGroup>
          </FormGroup>
        )}
        {evictionType === 'count' && (
          <FormGroup
            isRequired
            fieldId="max-count"
            type="number"
            validated={validateBoundedValue('count')}
            helperTextInvalid={t('caches.create.configurations.feature.max-count-helper-invalid')}
            label={t('caches.create.configurations.feature.max-count')}
            labelIcon={
              <PopoverHelp
                name="max-count"
                label={t('caches.create.configurations.feature.max-count')}
                content={t('caches.create.configurations.feature.max-count-tooltip', { brandname: brandname })}
              />
            }
          >
            <TextInput
              data-cy="memorySizeMaxCount"
              validated={validateBoundedValue('count')}
              min={0}
              value={maxCount}
              type="number"
              onChange={(v) => setMaxCount(v)}
              aria-label="max-count-input"
            />
          </FormGroup>
        )}
        <FormGroup
          fieldId="form-eviction-strategy"
          label={t('caches.create.configurations.feature.eviction-strategy')}
          isRequired
          labelIcon={
            <PopoverHelp
              name="eviction-strategy"
              label={t('caches.create.configurations.feature.eviction-strategy')}
              content={t('caches.create.configurations.feature.eviction-strategy-tooltip', { brandname: brandname })}
            />
          }
        >
          <Select
            variant={SelectVariant.single}
            aria-label="eviction-strategy-select"
            onToggle={() => setIsOpenEvictionStrategy(!isOpenEvictionStrategy)}
            onSelect={onSelectEvictionStrategy}
            selections={evictionStrategy}
            isOpen={isOpenEvictionStrategy}
            aria-labelledby="toggle-id-eviction-strategy"
            toggleId="evictionStrategy"
          >
            {evictionStrategyOptions()}
          </Select>
        </FormGroup>
      </Grid>
    </FeatureCard>
  );
};

export default BoundedCacheConfigurator;
