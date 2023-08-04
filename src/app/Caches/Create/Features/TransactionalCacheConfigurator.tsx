import React, { useEffect, useState } from 'react';
import { FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
   Radio } from '@patternfly/react-core';
import { CacheFeature, Locking, TransactionalMode } from '@services/infinispanRefData';
import { useTranslation } from 'react-i18next';
import { useCreateCache } from '@app/services/createCacheHook';
import { FeatureCard } from '@app/Caches/Create/Features/FeatureCard';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import { FeatureAlert } from '@app/Caches/Create/Features/FeatureAlert';

const TransactionalCacheConfigurator = (props: { isEnabled: boolean }) => {
  const { configuration, setConfiguration, removeFeature } = useCreateCache();
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const [mode, setMode] = useState(configuration.feature.transactionalCache.mode);
  const [locking, setLocking] = useState(configuration.feature.transactionalCache.locking);

  useEffect(() => {
    setConfiguration((prevState) => {
      return {
        ...prevState,
        feature: {
          ...prevState.feature,
          transactionalCache: {
            mode: mode,
            locking: locking,
            valid: transactionalFeatureValidation()
          }
        }
      };
    });
  }, [mode, locking]);

  const transactionalFeatureValidation = (): boolean => {
    return props.isEnabled;
  };

  if (!props.isEnabled) {
    return <FeatureAlert feature={CacheFeature.TRANSACTIONAL} />;
  }

  return (
    <FeatureCard
      title="caches.create.configurations.feature.transactional"
      description="caches.create.configurations.feature.transactional-description"
    >
      <FormGroup
        fieldId="form-transaction-mode"
        label={t('caches.create.configurations.feature.transactional-mode')}
      >
        <FormHelperText>
          <HelperText>
            <HelperTextItem >
              {t('caches.create.configurations.feature.transactional-mode-tooltip', { brandname: brandname })}
            </HelperTextItem>
          </HelperText>
          </FormHelperText>
        <Radio
          name="radio-transactional-mode"
          id="non_xa"
          onChange={() => setMode(TransactionalMode.NON_XA)}
          isChecked={(mode as TransactionalMode) == TransactionalMode.NON_XA}
          label={
            <PopoverHelp
              name={'non-durable-xa'}
              text={t('caches.create.configurations.feature.non-xa')}
              label={t('caches.create.configurations.feature.non-xa')}
              content={t('caches.create.configurations.feature.non-xa-tooltip', { brandname: brandname })}
            />
          }
        />
        <Radio
          name="radio-transactional-mode"
          id="non_durable_xa"
          onChange={() => setMode(TransactionalMode.NON_DURABLE_XA)}
          isChecked={(mode as TransactionalMode) == TransactionalMode.NON_DURABLE_XA}
          label={
            <PopoverHelp
              name={'non-durable-xa'}
              text={t('caches.create.configurations.feature.non-durable-xa')}
              label={t('caches.create.configurations.feature.non-durable-xa')}
              content={t('caches.create.configurations.feature.non-durable-xa-tooltip', { brandname: brandname })}
            />
          }
        />
        <Radio
          name="radio-transactional-mode"
          id="full_xa"
          onChange={() => setMode(TransactionalMode.FULL_XA)}
          isChecked={(mode as TransactionalMode) == TransactionalMode.FULL_XA}
          label={
            <PopoverHelp
              name={'full-xa'}
              text={t('caches.create.configurations.feature.full-xa')}
              label={t('caches.create.configurations.feature.full-xa')}
              content={t('caches.create.configurations.feature.full-xa-tooltip', { brandname: brandname })}
            />
          }
        />
      </FormGroup>
      <FormGroup
        fieldId="locking"
        label={t('caches.create.configurations.feature.locking-mode')}
              >
        <FormHelperText>
          <HelperText>
            <HelperTextItem >
              {t('caches.create.configurations.feature.locking-mode-tooltip', { brandname: brandname })}
            </HelperTextItem>
          </HelperText>
          </FormHelperText>
        <Radio
          name="radio-locking"
          id="optimistic"
          onChange={() => setLocking(Locking.OPTIMISTIC)}
          isChecked={(locking as Locking) == Locking.OPTIMISTIC}
          label={
            <PopoverHelp
              name={'optimistic'}
              text={t('caches.create.configurations.feature.locking-mode-optimistic')}
              label={t('caches.create.configurations.feature.locking-mode-optimistic')}
              content={t('caches.create.configurations.feature.locking-mode-optimistic-tooltip', {
                brandname: brandname
              })}
            />
          }
        />
        <Radio
          name="radio-locking"
          id="pessimistic"
          onChange={() => setLocking(Locking.PESSIMISTIC)}
          isChecked={(locking as Locking) == Locking.PESSIMISTIC}
          label={
            <PopoverHelp
              name={'pesimistic'}
              text={t('caches.create.configurations.feature.locking-mode-pessimistic')}
              label={t('caches.create.configurations.feature.locking-mode-pessimistic')}
              content={t('caches.create.configurations.feature.locking-mode-pessimistic-tooltip', {
                brandname: brandname
              })}
            />
          }
        />
      </FormGroup>
    </FeatureCard>
  );
};

export default TransactionalCacheConfigurator;
