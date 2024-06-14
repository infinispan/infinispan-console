import React, { useEffect, useState } from 'react';
import { Alert, Form, FormAlert, FormGroup, FormSection } from '@patternfly/react-core';
import { CacheFeature, CacheMode } from '@services/infinispanRefData';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import BoundedCacheConfigurator from '@app/Caches/Create/Features/BoundedCacheConfigurator';
import IndexedCacheConfigurator from '@app/Caches/Create/Features/IndexedCacheConfigurator';
import SecuredCacheConfigurator from '@app/Caches/Create/Features/SecuredCacheConfigurator';
import BackupsCacheConfigurator from '@app/Caches/Create/Features/BackupsCacheConfigurator';
import TransactionalCacheConfigurator from '@app/Caches/Create/Features/TransactionalCacheConfigurator';
import PersistentCacheConfigurator from '@app/Caches/Create/Features/PersistentCacheConfigurator';
import { useCreateCache } from '@app/services/createCacheHook';
import { useConnectedUser } from '@app/services/userManagementHook';
import { validFeatures } from '@app/utils/featuresValidation';
import { useFetchProtobufTypes } from '@app/services/protobufHook';
import { ConsoleACL } from '@services/securityService';
import { SelectMultiWithChips } from '@app/Common/SelectMultiWithChips';
import { selectOptionProps } from '@utils/selectOptionPropsCreator';

const FeaturesSelector = () => {
  const { t } = useTranslation();
  const { notSecured, connectedUser } = useConnectedUser();
  const { protobufTypes } = useFetchProtobufTypes();
  const { configuration, setConfiguration, addFeature, removeFeature } = useCreateCache();

  const brandname = t('brandname.brandname');

  const [loading, setLoading] = useState(true);
  const [isBackups, setIsBackups] = useState(false);

  useEffect(() => {
    if (loading) {
      // Check if backups cache is enabled
      ConsoleServices.dataContainer()
        .getDefaultCacheManager()
        .then((r) => {
          if (r.isRight()) {
            setIsBackups(r.value.backups_enabled);
          }
        })
        .then(() => setLoading(false));
    }
  }, [loading]);

  const onSelectFeature = (selection) => {
    if (configuration.feature.cacheFeatureSelected.includes(selection)) {
      removeFeature(selection);
    } else {
      addFeature(selection);
    }
  };

  const onClearFeatureSelection = () => {
    setConfiguration((prevState) => {
      return {
        ...prevState,
        feature: {
          ...prevState.feature,
          cacheFeatureSelected: []
        }
      };
    });
  };

  const displayAlert = () => {
    if (validFeatures(configuration)) {
      return '';
    }
    return (
      <FormAlert>
        <Alert
          variant="warning"
          title={t('caches.create.configurations.feature.alert-error')}
          aria-live="polite"
          isPlain
          isInline
        />
      </FormAlert>
    );
  };

  const isSecuredCacheCreationEnabled = () => {
    return !notSecured && ConsoleServices.security().hasConsoleACL(ConsoleACL.ADMIN, connectedUser);
  };

  return (
    <Form
      isWidthLimited
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <FormSection title={t('caches.create.configurations.feature.cache-feature-list', { brandname: brandname })}>
        <FormGroup fieldId="cache-feature">
          <SelectMultiWithChips
            id="featuresSelect"
            placeholder={t('caches.create.configurations.feature.cache-feature-list-placeholder')}
            options={selectOptionProps(CacheFeature)}
            onSelect={onSelectFeature}
            onClear={onClearFeatureSelection}
            closeOnSelect={true}
            selection={configuration.feature.cacheFeatureSelected}
          />
        </FormGroup>
      </FormSection>
      {displayAlert()}
      {configuration.feature.cacheFeatureSelected.includes(CacheFeature.BOUNDED) && <BoundedCacheConfigurator />}
      {configuration.feature.cacheFeatureSelected.includes(CacheFeature.INDEXED) && (
        <IndexedCacheConfigurator isEnabled={protobufTypes.length > 0} />
      )}
      {configuration.feature.cacheFeatureSelected.includes(CacheFeature.SECURED) && (
        <SecuredCacheConfigurator isEnabled={isSecuredCacheCreationEnabled()} />
      )}
      {configuration.feature.cacheFeatureSelected.includes(CacheFeature.BACKUPS) && (
        <BackupsCacheConfigurator isEnabled={isBackups} />
      )}
      {configuration.feature.cacheFeatureSelected.includes(CacheFeature.TRANSACTIONAL) && (
        <TransactionalCacheConfigurator isEnabled={configuration.basic.mode === CacheMode.SYNC} />
      )}
      {configuration.feature.cacheFeatureSelected.includes(CacheFeature.PERSISTENCE) && <PersistentCacheConfigurator />}
    </Form>
  );
};

export default FeaturesSelector;
