import React, { useState, useEffect } from 'react';
import {
    Form,
    FormGroup,
    TextVariants,
    Select,
    SelectOption,
    SelectVariant,
} from '@patternfly/react-core';
import { CacheFeature, EvictionType } from "@services/infinispanRefData";
import { useTranslation } from 'react-i18next';
import { MoreInfoTooltip } from '@app/Common/MoreInfoTooltip';
import BoundedCache from './Features/BoundedCache';

const ConfigurationFeature = (props: {
    cacheFeature: CacheFeatureStep,
    cacheFeatureModifier: (CacheFeatureStep) => void,
    handleIsFormValid: (isFormValid: boolean) => void
}) => {

    const { t } = useTranslation();
    const brandname = t('brandname.brandname');

    const [cacheFeatureSelected, setCacheFeatureSelected] = useState(props.cacheFeature.cacheFeatureSelected);

    //Bounded Cache
    const [boundedCache, setBoundedCache] = useState<BoundedCache>(props.cacheFeature.boundedCache);

    const [isOpenCacheFeature, setIsOpenCacheFeature] = useState(false);

    useEffect(() => {
        props.cacheFeatureModifier({
            cacheFeatureSelected: cacheFeatureSelected,
            boundedCache: boundedCache
        });
        if (cacheFeatureSelected.length < 1)
            props.handleIsFormValid(true);
        else if (boundedCache.evictionType === EvictionType.size)
            props.handleIsFormValid(parseInt(boundedCache.maxSize) >= 0)
        else if (boundedCache.evictionType === EvictionType.count)
            props.handleIsFormValid(parseInt(boundedCache.maxCount) >= 0)
        else
            props.handleIsFormValid(false);
    }, [cacheFeatureSelected, boundedCache]);

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

    const cacheFeatureOptions = () => {
        return Object.keys(CacheFeature).map((key) => (
            <SelectOption key={key} value={CacheFeature[key]} isDisabled={key !== 'BOUNDED'} />
        ));
    };

    return (
        <Form>
            <FormGroup fieldId='cache-feature'>
                <MoreInfoTooltip label={t('caches.create.configurations.feature.cache-feature-list', { brandname: brandname })} toolTip={t('caches.create.configurations.feature.cache-feature-list-tooltip')} textComponent={TextVariants.h2} />
                <Select
                    variant={SelectVariant.typeaheadMulti}
                    typeAheadAriaLabel={t('caches.create.configurations.feature.cache-feature-list-typeahead')}
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

            {cacheFeatureSelected.includes(CacheFeature.BOUNDED) && <BoundedCache boundedOptions={boundedCache} boundedOptionsModifier={setBoundedCache} handleIsFormValid={props.handleIsFormValid} />}
        </Form>
    );
};

export default ConfigurationFeature;
