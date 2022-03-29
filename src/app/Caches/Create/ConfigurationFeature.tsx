import React, { useState, useEffect } from 'react';
import {
    Divider,
    Form,
    FormGroup,
    Text,
    TextContent,
    TextVariants,
    TextInput,
    Radio,
    Select,
    SelectOption,
    SelectVariant,
} from '@patternfly/react-core';
import { CacheFeature } from "@services/infinispanRefData";
import { useTranslation } from 'react-i18next';
import { MoreInfoTooltip } from '@app/Common/MoreInfoTooltip';

const ConfigurationFeature = (props: {
    cacheFeature: CacheFeatureStep,
    cacheFeatureModifier: (CacheFeatureStep) => void
}) => {

    const { t } = useTranslation();

    const [cacheFeatureSelected, setCacheFeatureSelected] = useState(props.cacheFeature.cacheFeatureSelected);

    //Bounded Cache
    const [indexedEntitites, setIndexedEntitites] = useState(props.cacheFeature.indexedEntitites);
    const [storageType, setStorageType] = useState(props.cacheFeature.storageType);

    const [isOpenCacheFeature, setIsOpenCacheFeature] = useState(false);

    useEffect(() => {
        props.cacheFeatureModifier({
            cacheFeatureSelected: cacheFeatureSelected,
            indexedEntitites: indexedEntitites,
            storageType: storageType,
        });
    }, [cacheFeatureSelected, indexedEntitites, storageType]);

    const onSelect = (event, selection) => {
        if (cacheFeatureSelected.includes(selection)) {
            setCacheFeatureSelected(cacheFeatureSelected.filter(item => item !== selection));
        } else {
            setCacheFeatureSelected([...cacheFeatureSelected, selection]);
        }
    };

    const clearSelection = () => {
        setCacheFeatureSelected([]);
        setIsOpenCacheFeature(false);
    };

    const handleIndexedEntities = (value) => {
        setIndexedEntitites(value);
    }

    const cacheFeatureOptions = () => {
        return Object.keys(CacheFeature).map((key) => (
            <SelectOption key={key} value={CacheFeature[key]} isDisabled={key !== 'BOUNDED'} />
        ));
    };

    const formCacheFeatureSelect = () => {
        return (
            <FormGroup fieldId='cache-feature'>
                <MoreInfoTooltip label={t('caches.create.configurations.feature.cache-feature-list')} toolTip={t('caches.create.configurations.feature.cache-feature-list-tooltip')} textComponent={TextVariants.h4} />
                <Select
                    variant={SelectVariant.typeaheadMulti}
                    typeAheadAriaLabel="Choose features"
                    onToggle={() => setIsOpenCacheFeature(!isOpenCacheFeature)}
                    onSelect={onSelect}
                    onClear={clearSelection}
                    selections={cacheFeatureSelected}
                    isOpen={isOpenCacheFeature}
                    aria-labelledby="cache-feature"
                    placeholderText={t('caches.create.configurations.feature.cache-feature-list-placeholder')}
                >
                    {cacheFeatureOptions()}
                </Select>
            </FormGroup>
        )
    }

    const formBoundedCache = () => {
        return (
            <React.Fragment>
                <Divider />
                <TextContent>
                    <Text component={TextVariants.h3}>Bounded</Text>
                </TextContent>

                <FormGroup
                    isInline
                    isRequired
                    fieldId="field-indexed-entities"
                    helperText={t('caches.create.configurations.feature.indexed-entries-helper')}
                >
                    <MoreInfoTooltip label={t('caches.create.configurations.feature.indexed-entries')} toolTip={t('caches.create.configurations.feature.indexed-entries-tooltip')} textComponent={TextVariants.h4} />
                    <TextInput value={indexedEntitites} type="text" onChange={handleIndexedEntities} aria-label="indexed-entities" />
                </FormGroup>

                <FormGroup
                    isInline
                    isRequired
                    fieldId="field-storage-type"
                >
                    <MoreInfoTooltip label={t('caches.create.configurations.feature.storage-type')} toolTip={t('caches.create.configurations.feature.storage-type-tooltip')} textComponent={TextVariants.h4} />
                    <Radio
                        name="radio"
                        id="storage-type-file"
                        onChange={() => setStorageType('file-system')}
                        isChecked={storageType === 'file-system'}
                        label={
                            <TextContent>
                                <Text component={TextVariants.h3}>{t('caches.create.configurations.feature.radio-file-system')}</Text>
                            </TextContent>
                        }
                    />
                    <Radio
                        name="radio"
                        id="storage-type-memory"
                        onChange={() => setStorageType('memory')}
                        isChecked={storageType === 'memory'}
                        label={
                            <TextContent>
                                <Text component={TextVariants.h3}>
                                    {t('caches.create.configurations.feature.radio-memory')}
                                </Text>
                            </TextContent>
                        }
                    />
                </FormGroup>
            </React.Fragment>
        )
    }

    return (
        <Form>
            <TextContent>
                <Text component={TextVariants.h1}>{t('caches.create.configurations.feature.page-title')}</Text>
            </TextContent>

            {formCacheFeatureSelect()}
            {cacheFeatureSelected.includes(CacheFeature.BOUNDED) && formBoundedCache()}
        </Form>
    );
};

export default ConfigurationFeature;
