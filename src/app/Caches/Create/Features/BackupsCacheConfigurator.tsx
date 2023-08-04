import React, { useEffect, useState } from 'react';
import { FormGroup, HelperText, HelperTextItem, Radio, Spinner, Switch, TextInput } from '@patternfly/react-core';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core/deprecated';
import { useTranslation } from 'react-i18next';
import { BackupSiteStrategy, CacheFeature } from '@services/infinispanRefData';
import { ConsoleServices } from '@services/ConsoleServices';
import { useCreateCache } from '@app/services/createCacheHook';
import { FeatureCard } from '@app/Caches/Create/Features/FeatureCard';
import { PopoverHelp } from '@app/Common/PopoverHelp';
import { InfoIcon } from '@patternfly/react-icons';
import { FeatureAlert } from '@app/Caches/Create/Features/FeatureAlert';

const BackupsCacheConfigurator = (props: { isEnabled: boolean }) => {
  const { configuration, setConfiguration } = useCreateCache();
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const [enableBackupFor, setEnableBackupFor] = useState(configuration.feature.backupsCache.backupFor.enabled);
  const [remoteCache, setRemoteCache] = useState(configuration.feature.backupsCache.backupFor.remoteCache!);
  const [remoteSite, setRemoteSite] = useState(configuration.feature.backupsCache.backupFor.remoteSite!);

  const [availableSites, setAvailableSites] = useState<string[]>([]);
  const [sites, setSites] = useState<BackupSiteBasic[]>(configuration.feature.backupsCache.sites!);
  const [localSite, setLocalSite] = useState('');

  const [loadingBackups, setLoadingBackups] = useState<boolean>(true);
  const [isOpenSites, setIsOpenSites] = useState(false);

  const validateBackupsForField = (value): 'success' | 'error' => {
    if (!configuration.feature.backupsCache.backupFor.enabled) {
      return 'success';
    }

    if (configuration.feature.backupsCache.backupFor.enabled && value != '') {
      return 'success';
    }

    return 'error';
  };
  const [isOpenRemoteSite, setIsOpenRemoteSite] = useState(false);

  useEffect(() => {
    setConfiguration((prevState) => {
      return {
        ...prevState,
        feature: {
          ...prevState.feature,
          backupsCache: {
            sites: sites,
            backupFor: {
              enabled: enableBackupFor,
              remoteCache: remoteCache,
              remoteSite: remoteSite
            },
            valid: backupsFeatureValidation()
          }
        }
      };
    });
  }, [sites, remoteCache, remoteSite, enableBackupFor]);

  const backupsFeatureValidation = (): boolean => {
    if (!props.isEnabled) {
      return false;
    }

    if (enableBackupFor) {
      return (
        sites.length > 0 &&
        validateBackupsForField(remoteCache) === 'success' &&
        validateBackupsForField(remoteSite) === 'success'
      );
    }

    return sites.length > 0;
  };

  useEffect(() => {
    if (loadingBackups) {
      // Fetch available sites
      ConsoleServices.dataContainer()
        .getDefaultCacheManager()
        .then((r) => {
          if (r.isRight()) {
            const cm = r.value;
            const localSiteName = cm.local_site ? cm.local_site : '';
            const siteView = cm.sites_view.filter((s) => s !== localSiteName);
            setLocalSite(localSiteName);
            setAvailableSites(siteView);
          }
        })
        .then(() => setLoadingBackups(false));
    }
  }, [loadingBackups]);

  const helperAddSite = (event, selection) => {
    if (!sites.some((s) => s.siteName === selection)) {
      setSites([...sites, { siteName: selection }]);
    } else {
      setSites(sites.filter((item) => item.siteName !== selection));
    }
    setIsOpenSites(false);
  };

  const sitesOptions = () => {
    return availableSites.map((role) => <SelectOption key={role} value={role} />);
  };

  const clearSelection = () => {
    setSites([]);
    setIsOpenSites(false);
  };

  const onSelectRemoteSite = (event, selection) => {
    setRemoteSite(selection);
    setIsOpenRemoteSite(false);
  };

  const formBackupSites = () => {
    return (
      <FormGroup
        fieldId="backup-sites"
        isRequired
        isInline
        label={t('caches.create.configurations.feature.backups-site')}
        labelIcon={
          <PopoverHelp
            name="backup-sites"
            label={t('caches.create.configurations.feature.backups-site')}
            content={t('caches.create.configurations.feature.backups-site-tooltip', { brandname: brandname })}
          />
        }
      >
        <Select
          isCreatable={true}
          variant={SelectVariant.typeaheadMulti}
          aria-label={t('caches.create.configurations.feature.select-sites')}
          chipGroupProps={{ numChips: 4, expandedText: 'Hide', collapsedText: 'Show ${remaining}' }}
          onToggle={() => setIsOpenSites(!isOpenSites)}
          onSelect={helperAddSite}
          onClear={clearSelection}
          selections={sites.some((s) => s.siteName !== undefined) ? sites.map((s) => s.siteName) : []}
          isOpen={isOpenSites}
          validated={sites.length == 0 ? 'error' : 'success'}
          placeholderText={t('caches.create.configurations.feature.select-sites')}
          noResultsFoundText={t('caches.create.configurations.feature.select-sites-not-found')}
        >
          {sitesOptions()}
        </Select>
      </FormGroup>
    );
  };

  const backupsStrategy = () => {
    if (!sites || sites.length == 0) {
      return;
    }

    return (
      <React.Fragment>
        <HelperText>
          <HelperTextItem icon={<InfoIcon />}>{t('caches.create.configurations.feature.strategy')}</HelperTextItem>
          <HelperTextItem>
            {t('caches.create.configurations.feature.strategy-tooltip', { brandname: brandname })}
          </HelperTextItem>
        </HelperText>
        {sites.map((site, index) => {
          site.siteStrategy = site.siteStrategy || 'ASYNC';
          return (
            <FormGroup key={'strategy-' + site} fieldId={'strategy-' + site} isInline label={site.siteName}>
              <Radio
                name={index.toString()}
                id={`async-${index}`}
                onChange={() => {
                  (site.siteStrategy = BackupSiteStrategy.ASYNC),
                    setSites(sites.map((chip) => (chip.siteName === site.siteName ? site : chip)));
                }}
                isChecked={site.siteStrategy === 'ASYNC'}
                label={t('caches.create.configurations.feature.strategy-async')}
              />
              <Radio
                name={index.toString()}
                id={`sync-${index}`}
                onChange={() => {
                  (site.siteStrategy = BackupSiteStrategy.SYNC),
                    setSites(sites.map((chip) => (chip.siteName === site.siteName ? site : chip)));
                }}
                isChecked={site.siteStrategy === 'SYNC'}
                label={t('caches.create.configurations.feature.strategy-sync')}
              />
            </FormGroup>
          );
        })}
      </React.Fragment>
    );
  };

  const formBackupFor = () => {
    if (!enableBackupFor) {
      return;
    }

    return (
      <React.Fragment>
        <FormGroup
          fieldId="remote-cache"
          isInline
          isRequired
          label={t('caches.create.configurations.feature.remote-cache')}
          labelIcon={
            <PopoverHelp
              name="remote-cache"
              label={t('caches.create.configurations.feature.remote-cache')}
              content={t('caches.create.configurations.feature.remote-cache-tooltip', { brandname: brandname })}
            />
          }
        >
          <TextInput
            validated={validateBackupsForField(remoteCache)}
            value={remoteCache}
            onChange={(_event, val) => {
              const trimmedVal = val.trim();
              setRemoteCache(trimmedVal);
              validateBackupsForField(trimmedVal);
            }}
            aria-label="remote-cache-input"
          />
        </FormGroup>
        <FormGroup
          fieldId="remote-site"
          isInline
          isRequired
          labelIcon={
            <PopoverHelp
              name="remote-site"
              label={t('caches.create.configurations.feature.remote-site')}
              content={t('caches.create.configurations.feature.remote-site-tooltip')}
            />
          }
        >
          <Select
            validated={validateBackupsForField(remoteSite)}
            variant={SelectVariant.single}
            aria-label="remote-site-select"
            onToggle={() => setIsOpenRemoteSite(!isOpenRemoteSite)}
            onSelect={onSelectRemoteSite}
            selections={remoteSite}
            isOpen={isOpenRemoteSite}
            aria-labelledby="toggle-id-remote-site"
            placeholderText="Select remote site"
          >
            {sitesOptions()}
          </Select>
        </FormGroup>
      </React.Fragment>
    );
  };

  if (!props.isEnabled) {
    return <FeatureAlert feature={CacheFeature.BACKUPS} />;
  }

  if (loadingBackups) {
    return <Spinner size={'md'} />;
  }

  return (
    <FeatureCard computedTitle={t('caches.create.configurations.feature.backups', { local_site_name: localSite })}>
      {formBackupSites()}
      {backupsStrategy()}
      <FormGroup fieldId="enable-backupfor">
        <Switch
          aria-label="backupfor"
          id="backupfor"
          isChecked={enableBackupFor}
          onChange={() => setEnableBackupFor(!enableBackupFor)}
          labelOff={t('caches.create.configurations.feature.backup-for')}
          label={t('caches.create.configurations.feature.backup-for')}
        />
        <PopoverHelp
          name="backupfor"
          label={t('caches.create.configurations.feature.backup-for')}
          content={t('caches.create.configurations.feature.backup-for-tooltip', { brandname: brandname })}
        />
      </FormGroup>
      {formBackupFor()}
    </FeatureCard>
  );
};

export default BackupsCacheConfigurator;
