import React, { useEffect, useState } from 'react';
import {
  Alert,
  Form,
  FormAlert,
  FormGroup,
  FormSection,
  Select,
  SelectOption,
  SelectVariant,
} from '@patternfly/react-core';
import { CacheFeature, CacheMode } from "@services/infinispanRefData";
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import BoundedCacheConfigurator from '@app/Caches/Create/Features/BoundedCacheConfigurator';
import IndexedCacheConfigurator from '@app/Caches/Create/Features/IndexedCacheConfigurator';
import SecuredCacheConfigurator from '@app/Caches/Create/Features/SecuredCacheConfigurator';
import BackupsCacheConfigurator from '@app/Caches/Create/Features/BackupsCacheConfigurator';
import TransactionalCacheConfigurator from '@app/Caches/Create/Features/TransactionalCacheConfigurator';
import PersistentCacheConfigurator from '@app/Caches/Create/Features/PersistentCacheConfigurator';
import { useCreateCache } from "@app/services/createCacheHook";
import { useConnectedUser } from "@app/services/userManagementHook";
import { validFeatures } from "@app/utils/featuresValidation";
import { useFetchProtobufSchemas } from '@app/services/protobufHook';

const FeaturesSelector = () => {
  const { t } = useTranslation();
  const { notSecured } = useConnectedUser();
  const { schemas } = useFetchProtobufSchemas();
  const { configuration, setConfiguration, addFeature, removeFeature } = useCreateCache();

  const brandname = t('brandname.brandname');

  const [loadingBackups, setLoadingBackups] = useState(true);
  const [isBackups, setIsBackups] = useState(false);
  const [isOpenCacheFeature, setIsOpenCacheFeature] = useState(false);

  useEffect(() => {
    if (loadingBackups) {
      // Check if backups cache is enabled
      ConsoleServices.dataContainer().getDefaultCacheManager()
        .then((r) => {
          if (r.isRight()) {
            setIsBackups(r.value.backups_enabled);
          }
        }).then(() => setLoadingBackups(false));
    }
  }, [loadingBackups]);

  const onSelectFeature = (event, selection) => {
    if (configuration.feature.cacheFeatureSelected.includes(selection)) {
      removeFeature(selection);
    } else {
      addFeature(selection);
    }
    setIsOpenCacheFeature(false);
  };

  const onClearFeatureSelection = () => {
    setConfiguration((prevState) => {
      return {
        ...prevState,
        feature: {
          ...prevState.feature,
          cacheFeatureSelected: [],
        }
      };
    });
    setIsOpenCacheFeature(false);
  };

  const cacheFeatureOptions = () => {
    return Object.keys(CacheFeature).map((key) => (
      <SelectOption id={key} key={key} value={CacheFeature[key]} />
    ));
  };

  const displayAlert = () => {
    if (validFeatures(configuration)) {
      return '';
    }
    return (
      <FormAlert>
        <Alert variant="warning"
          title={t('caches.create.configurations.feature.alert-error')}
          aria-live="polite"
          isPlain
          isInline />
      </FormAlert>
    );
  }

  return (
    <Form isWidthLimited onSubmit={(e) => {
      e.preventDefault();
    }}>
      <FormSection title={t('caches.create.configurations.feature.cache-feature-list', { brandname: brandname })}>
        <FormGroup fieldId='cache-feature'>
          <Select
            variant={SelectVariant.typeaheadMulti}
            typeAheadAriaLabel={t('caches.create.configurations.feature.cache-feature-list-typeahead')}
            onToggle={() => setIsOpenCacheFeature(!isOpenCacheFeature)}
            onSelect={onSelectFeature}
            onClear={onClearFeatureSelection}
            selections={configuration.feature.cacheFeatureSelected}
            isOpen={isOpenCacheFeature}
            aria-labelledby="cache-feature"
            placeholderText={t('caches.create.configurations.feature.cache-feature-list-placeholder')}
            toggleId="featuresSelect"
            chipGroupProps={{ numChips: 6 }}
          >
            {cacheFeatureOptions()}
          </Select>
        </FormGroup>
      </FormSection>
      {displayAlert()}
      {configuration.feature.cacheFeatureSelected.includes(CacheFeature.BOUNDED) && <BoundedCacheConfigurator />}
      {configuration.feature.cacheFeatureSelected.includes(CacheFeature.INDEXED) && <IndexedCacheConfigurator isEnabled={schemas.length > 0} />}
      {configuration.feature.cacheFeatureSelected.includes(CacheFeature.SECURED) && <SecuredCacheConfigurator isEnabled={!notSecured} />}
      {configuration.feature.cacheFeatureSelected.includes(CacheFeature.BACKUPS) && <BackupsCacheConfigurator isEnabled={isBackups} />}
      {configuration.feature.cacheFeatureSelected.includes(CacheFeature.TRANSACTIONAL) && <TransactionalCacheConfigurator isEnabled={configuration.basic.mode === CacheMode.SYNC} />}
      {configuration.feature.cacheFeatureSelected.includes(CacheFeature.PERSISTENCE) && <PersistentCacheConfigurator />}
    </Form>
  );
};

export default FeaturesSelector;
