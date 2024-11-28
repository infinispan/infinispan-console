import React, { useEffect, useState } from 'react';
import {
  FormFieldGroupExpandable,
  FormFieldGroupHeader,
  FormGroup,
  FormSection,
  Grid,
  HelperText,
  HelperTextItem,
  TextInput
} from '@patternfly/react-core';
import { CacheFeature } from '@services/infinispanRefData';
import { useTranslation } from 'react-i18next';
import { useCreateCache } from '@app/services/createCacheHook';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import BackupSiteConfigurator from '@app/Caches/Create/AdvancedTuning/BackupsSiteConfigurator';

const BackupsConfigurationTuning = () => {
  const { configuration, setConfiguration } = useCreateCache();
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const [backupSiteData, setBackupSiteData] = useState<BackupSite[]>(
    configuration.advanced.backupSiteData || Array(configuration.feature.backupsCache?.sites.length).fill({})
  );
  const [mergePolicy, setMergePolicy] = useState(configuration.advanced.backupSetting?.mergePolicy);
  const [maxCleanupDelay, setMaxCleanupDelay] = useState(configuration.advanced.backupSetting?.maxCleanupDelay);
  const [tombstoneMapSize, setTombstoneMapSize] = useState(configuration.advanced.backupSetting?.tombstoneMapSize);

  useEffect(() => {
    setConfiguration((prevState) => {
      return {
        ...prevState,
        advanced: {
          ...prevState.advanced,
          backupSetting: {
            mergePolicy: mergePolicy,
            maxCleanupDelay: maxCleanupDelay,
            tombstoneMapSize: tombstoneMapSize
          },
          backupSiteData: backupSiteData,
          valid: true
        }
      };
    });
  }, [backupSiteData, mergePolicy, maxCleanupDelay, tombstoneMapSize]);

  if (!configuration.feature.cacheFeatureSelected.includes(CacheFeature.BACKUPS)) {
    return <div />;
  }

  const formBackupsSetting = () => {
    return (
      <Grid hasGutter md={4}>
        <FormGroup
          fieldId="merge-policy"
          label={t('caches.create.configurations.feature.merge-policy')}
          labelIcon={
            <PopoverHelp
              name="merge-policy"
              label={t('caches.create.configurations.feature.merge-policy')}
              content={t('caches.create.configurations.feature.merge-policy-tooltip', { brandname: brandname })}
            />
          }
        >
          <TextInput
            placeholder="DEFAULT"
            value={mergePolicy}
            onChange={(_event, val) => {
              val === '' ? setMergePolicy(undefined!) : setMergePolicy(val);
            }}
            aria-label="merge-policy-input"
            data-cy="merge-policy-input"
          />
        </FormGroup>

        <FormGroup
          fieldId="max-cleanup-delay"
          label={t('caches.create.configurations.feature.max-cleanup-delay')}
          labelIcon={
            <PopoverHelp
              name="cleanup-delay"
              label={t('caches.create.configurations.feature.max-cleanup-delay')}
              content={t('caches.create.configurations.feature.max-cleanup-delay-tooltip')}
            />
          }
        >
          <TextInput
            placeholder="30000"
            type="number"
            value={maxCleanupDelay}
            onChange={(_event, val) => {
              isNaN(parseInt(val)) ? setMaxCleanupDelay(undefined!) : setMaxCleanupDelay(parseInt(val));
            }}
            aria-label="max-cleanup-delay-input"
            data-cy="maxCleanupDelay"
          />
        </FormGroup>

        <FormGroup
          fieldId="tombstone-map-size"
          label={t('caches.create.configurations.feature.tombstone-map-site')}
          labelIcon={
            <PopoverHelp
              name="tombstone-map-size"
              label={t('caches.create.configurations.feature.tombstone-map-site')}
              content={t('caches.create.configurations.feature.tombstone-map-site-tooltip', { brandname: brandname })}
            />
          }
        >
          <TextInput
            placeholder="512000"
            type="number"
            value={tombstoneMapSize}
            onChange={(_event, val) => {
              isNaN(parseInt(val)) ? setTombstoneMapSize(undefined!) : setTombstoneMapSize(parseInt(val));
            }}
            aria-label="tombstone-map-size-input"
            data-cy="tombstone-map-size-input"
          />
        </FormGroup>
      </Grid>
    );
  };

  return (
    <FormSection title={t('caches.create.configurations.advanced-options.backups-tuning')}>
      <HelperText>
        <HelperTextItem>
          {t('caches.create.configurations.advanced-options.backups-tuning-tooltip', { brandname: brandname })}
        </HelperTextItem>
      </HelperText>
      {formBackupsSetting()}
      {configuration.feature.backupsCache &&
        configuration.feature.backupsCache.sites.map((site, index) => {
          return (
            <FormFieldGroupExpandable
              id={site.siteName + '-expand-button'}
              key={site.siteName + '-expand'}
              header={<FormFieldGroupHeader titleText={{ text: site.siteName, id: site.siteName + '-titleText-id' }} />}
            >
              <BackupSiteConfigurator
                backupSiteOptions={backupSiteData}
                backupSiteOptionsModifier={setBackupSiteData}
                index={index}
                siteBasic={site}
              />
            </FormFieldGroupExpandable>
          );
        })}
    </FormSection>
  );
};

export default BackupsConfigurationTuning;
