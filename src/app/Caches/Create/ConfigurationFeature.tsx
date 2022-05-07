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
import { ConsoleServices } from '@services/ConsoleServices';
import BoundedCache from './Features/BoundedCache';
import IndexedCache from './Features/IndexedCache';
import SecuredCache from './Features/SecuredCache';

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

    //Indexed Cache
    const [indexedCache, setIndexedCache] = useState<IndexedCache>(props.cacheFeature.indexedCache);

    //Secured Cache
    const [securedCache, setSecuredCache] = useState<SecuredCache>(props.cacheFeature.securedCache);
    const [isSecure, setIsSecure] = useState(false);

    const [loading, setLoading] = useState(true);

    const [isOpenCacheFeature, setIsOpenCacheFeature] = useState(false);

    useEffect(() => {
        if (loading) {
            // Check if secured cache is enabled
            ConsoleServices.security()
                .getSecurityRoles()
                .then((r) => {
                    if (r.isRight()) {
                        r.value === [] ? setIsSecure(false) : setIsSecure(true);
                    }
                }).then(() => setLoading(false));
        }
    }, [loading]);

    useEffect(() => {
        props.cacheFeatureModifier({
            cacheFeatureSelected: cacheFeatureSelected,
            boundedCache: boundedCache,
            indexedCache: indexedCache,
            securedCache: securedCache
        });
        if (cacheFeatureSelected.length < 1)
            props.handleIsFormValid(true);
        else if (cacheFeatureSelected.includes(CacheFeature.BOUNDED) || cacheFeatureSelected.includes(CacheFeature.INDEXED)) {
            if (boundedCache.evictionType === EvictionType.size)
                props.handleIsFormValid(parseInt(boundedCache.maxSize) >= 0)
            else if (boundedCache.evictionType === EvictionType.count)
                props.handleIsFormValid(parseInt(boundedCache.maxCount) >= 0)
            if (indexedCache.indexedEntities.length > 0)
                props.handleIsFormValid(true);
        }
        else if (cacheFeatureSelected.includes(CacheFeature.SECURED)) {
            securedCache.roles.length > 0 ? props.handleIsFormValid(true) : props.handleIsFormValid(false);
        }
        else
            props.handleIsFormValid(false);
    }, [cacheFeatureSelected, boundedCache, indexedCache, securedCache]);

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
        const availableOptions = ['BOUNDED', 'INDEXED', isSecure && 'SECURED'];
        return Object.keys(CacheFeature).map((key) => (
            <SelectOption key={key} value={CacheFeature[key]} isDisabled={!availableOptions.includes(key)} />
        ));
    };

    return (
        <Form onSubmit={(e) => {
            e.preventDefault();
        }}>
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
            {cacheFeatureSelected.includes(CacheFeature.INDEXED) && <IndexedCache indexedOptions={indexedCache} indexedOptionsModifier={setIndexedCache} />}
            {cacheFeatureSelected.includes(CacheFeature.SECURED) && <SecuredCache securedOptions={securedCache} securedOptionsModifier={setSecuredCache} />}
            {console.log("securedCache.roles.length", securedCache.roles.length)}
        </Form>
    );
};

export default ConfigurationFeature;
