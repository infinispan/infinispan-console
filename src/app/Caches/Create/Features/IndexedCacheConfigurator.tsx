import React, {useEffect, useState} from 'react';
import {Button, FormGroup, InputGroup, Label, LabelGroup, Radio, TextInput,} from '@patternfly/react-core';
import {global_spacer_sm} from '@patternfly/react-tokens';
import {IndexedStorage} from "@services/infinispanRefData";
import {useTranslation} from 'react-i18next';
import {useCreateCache} from "@app/services/createCacheHook";
import {PopoverHelp} from "@app/Common/PopoverHelp";
import {FeatureCard} from "@app/Caches/Create/Features/FeatureCard";

const IndexedCacheConfigurator = () => {
  const { configuration, setConfiguration } = useCreateCache();
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  const [indexedStorage, setIndexedStorage] = useState<'filesystem' | 'local_heap'>(configuration.feature.indexedCache.indexedStorage);
  const [indexedEntities, setIndexedEntities] = useState<string[]>(configuration.feature.indexedCache.indexedEntities);
  const [entityInput, setEntityInput] = useState<string>('');
  const [validEntity, setValidEntity] = useState<'success' | 'error' | 'default'>('default');

  useEffect(() => {
    if (indexedEntities.length == 0) {
      setValidEntity('error');
    }

    setConfiguration((prevState) => {
      return {
        ...prevState,
        feature : {
          ...prevState.feature,
          indexedCache: {
            indexedStorage: indexedStorage,
            indexedEntities: indexedEntities,
            valid: indexingFeatureValidation()
          }
        }
      };
    });
  }, [indexedStorage, indexedEntities]);

  const indexingFeatureValidation = () : boolean => {
      return indexedEntities.length > 0;
  }

  const deleteChip = (chipToDelete: string) => {
    const newChips = indexedEntities.filter(chip => !Object.is(chip, chipToDelete));
    setIndexedEntities(newChips);
  };

  const addChip = (newChipText: string) => {
    setIndexedEntities([...indexedEntities, `${newChipText}`]);
    setEntityInput('');
  };

  const helperAddEntity = () => {
    if (entityInput.length) {
      if (!indexedEntities.includes(entityInput)) {
        addChip(entityInput);
        setValidEntity('success')
      }
    }
  }

  return (
    <FeatureCard title="caches.create.configurations.feature.indexed"
                 description="caches.create.configurations.feature.indexed-tooltip">
      <FormGroup
        label={t('caches.create.configurations.feature.index-storage')}
        labelIcon={<PopoverHelp name={'indexed-storage'}
                                label={t('caches.create.configurations.feature.index-storage')}
                                content={t('caches.create.configurations.feature.index-storage-tooltip', { brandname: brandname })}/>}
        fieldId='indexed-storage'
        isInline
      >
        <Radio
          name="radio-storage"
          id="persistent"
          onChange={() => setIndexedStorage(IndexedStorage.persistent)}
          isChecked={indexedStorage === IndexedStorage.persistent}
          label={t('caches.create.configurations.feature.index-storage-persistent')}
        />
        <Radio
          name="radio-storage"
          id="volatile"
          onChange={() => setIndexedStorage(IndexedStorage.volatile)}
          isChecked={indexedStorage === IndexedStorage.volatile}
          label={t('caches.create.configurations.feature.index-storage-volatile')}
        />
      </FormGroup>
      <FormGroup
                 isRequired
                 label={t('caches.create.configurations.feature.index-storage-entity')}
                 labelIcon={<PopoverHelp name={'index-storage-entity'}
                                         label={t('caches.create.configurations.feature.index-storage-entity')}
                                         content={t('caches.create.configurations.feature.index-storage-entity-tooltip', {brandname: brandname})}/>}
                 fieldId='indexed-entities'
                 validated={validEntity}
                 helperTextInvalid={t('caches.create.configurations.feature.index-storage-entity-helper')}>
        <InputGroup>
          <TextInput data-cy="indexEntityInput"
                     value={entityInput}
                     type="text"
                     validated={validEntity}
                     onChange={setEntityInput} />
          <Button id="add-entity" variant="control" onClick={helperAddEntity}>
            {t('caches.create.configurations.feature.index-storage-add-btn')}
          </Button>
        </InputGroup>
      </FormGroup>
      <LabelGroup>
        {indexedEntities.map(currentChip => (
          <Label data-cy={currentChip}
                 color="blue"
                 closeBtnAriaLabel="Remove entity"
                 onEditComplete={(text) => {
                   setIndexedEntities(indexedEntities.map(chip => chip === currentChip ? text : chip));
                 }}
                 isEditable
                 style={{ marginRight: global_spacer_sm.value }}
                 key={currentChip} onClose={() => deleteChip(currentChip)}>
            {currentChip}
          </Label>
        ))}
      </LabelGroup>
    </FeatureCard>
  );
};

export default IndexedCacheConfigurator;
