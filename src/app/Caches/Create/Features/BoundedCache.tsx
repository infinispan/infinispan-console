import React, { useState, useEffect } from 'react';
import {
    Divider,
    FormGroup,
    Grid,
    GridItem,
    InputGroup,
    Text,
    TextContent,
    TextVariants,
    TextInput,
    Radio,
    Select,
    SelectOption,
    SelectVariant,
} from '@patternfly/react-core';
import { MaxSizeUnit, EvictionStrategy, EvictionType } from "@services/infinispanRefData";
import { useTranslation } from 'react-i18next';
import { MoreInfoTooltip } from '@app/Common/MoreInfoTooltip';

const BoundedCache = (props: {
    boundedOptions,
    boundedOptionsModifier,
    handleIsFormValid: (isFormValid: boolean) => void
}) => {

    const { t } = useTranslation();
    const brandname = t('brandname.brandname');

    //Bounded Cache
    const [evictionType, setEvictionType] = useState<'size' | 'count'>(props.boundedOptions.evictionType);
    const [maxSize, setMaxSize] = useState<string | undefined>(props.boundedOptions.maxSize);
    const [maxCount, setMaxCount] = useState<string | undefined>(props.boundedOptions.maxCount);
    const [evictionStrategy, setEvictionStrategy] = useState<string>(props.boundedOptions.evictionStrategy);

    const [isOpenEvictionStrategy, setIsOpenEvictionStrategy] = useState(false);
    const [isOpenMaxSizeUnit, setIsOpenMaxSizeUnit] = useState(false);

    // Helper states for the maxSize input
    const [maxSizeNumber, setMaxSizeNumber] = useState<string>();
    const [maxSizeUnit, setMaxSizeUnit] = useState<MaxSizeUnit>(MaxSizeUnit.MB);

    useEffect(() => {
        if (maxSize) {
            // Splitting the maxSize string into number and unit
            const [num, unit] = maxSize.match(/\D+|\d+/g);
            setMaxSizeNumber(num);
            setMaxSizeUnit(MaxSizeUnit[unit]);
        }
        else {
            setMaxSizeNumber(undefined);
        }
    }, [])

    useEffect(() => {
        // Update maxSize string
        if (maxSizeNumber) {
            setMaxSize(maxSizeNumber + maxSizeUnit);
        }
        // Update maxSize number and count if string is null
        if (maxSizeNumber === '') {
            setMaxSize(undefined);
            setMaxSizeNumber(undefined);
        }
        if (maxCount === '') setMaxCount(undefined);
    }, [maxSizeNumber, maxSizeUnit, maxCount])

    useEffect(() => {
        // Update when evictionType changed
        if (evictionType === EvictionType.count) {
            setMaxSize(undefined);
            setMaxSizeNumber(undefined);
        }
        else if (evictionType === EvictionType.size) {
            setMaxCount(undefined);
        }
    }, [evictionType])

    useEffect(() => {
        props.boundedOptionsModifier({
            evictionType: evictionType,
            maxSize: maxSize,
            maxCount: maxCount,
            evictionStrategy: evictionStrategy
        });
    }, [evictionType, maxSize, maxCount, evictionStrategy])

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
            <SelectOption key={key} value={EvictionStrategy[key]} />
        ));
    };

    // Options for Max Size Unit
    const unitOptions = () => {
        return Object.keys(MaxSizeUnit).map((key) => (
            <SelectOption key={key} value={MaxSizeUnit[key]} />
        ));
    }

    return (
        <React.Fragment>
            <Divider />
            <TextContent>
                <MoreInfoTooltip label={t('caches.create.configurations.feature.bounded')} toolTip={t('caches.create.configurations.feature.bounded-tooltip', { brandname: brandname })} textComponent={TextVariants.h2} />
            </TextContent>

            <FormGroup
                isInline
                isRequired
                fieldId="radio-size-count"
            >
                <Radio
                    name="radio-size-count"
                    id="size"
                    onChange={() => setEvictionType(EvictionType.size)}
                    isChecked={evictionType === EvictionType.size}
                    label={
                        <TextContent>
                            <Text component={TextVariants.h4}>{t('caches.create.configurations.feature.radio-max-size')}</Text>
                        </TextContent>
                    }
                />
                <Radio
                    name="radio-size-count"
                    id="count"
                    onChange={() => setEvictionType(EvictionType.count)}
                    isChecked={evictionType === EvictionType.count}
                    label={
                        <TextContent>
                            <Text component={TextVariants.h4}>{t('caches.create.configurations.feature.radio-max-count')}</Text>
                        </TextContent>
                    }
                />
            </FormGroup>

            {evictionType === 'size' &&
                <FormGroup
                    isRequired
                    fieldId="max-size"
                    validated={!maxSize || (maxSizeNumber && parseInt(maxSizeNumber) >= 0) ? 'default' : 'error'}
                    helperTextInvalid={t('caches.create.configurations.feature.max-size-helper-invalid')}
                >
                    <MoreInfoTooltip label={t('caches.create.configurations.feature.max-size')} toolTip={t('caches.create.configurations.feature.max-size-tooltip', { brandname: brandname })} textComponent={TextVariants.h3} />
                    <InputGroup>
                        <Grid>
                            <GridItem span={8}>
                                <TextInput min={0} value={maxSizeNumber} type="number" onChange={(value) => setMaxSizeNumber(value)} aria-label="max-size-number-input" />
                            </GridItem>
                            <GridItem span={4}>
                                <Select
                                    variant={SelectVariant.single}
                                    aria-label="max-size-unit-input"
                                    onToggle={() => setIsOpenMaxSizeUnit(!isOpenMaxSizeUnit)}
                                    onSelect={onSelectMaxCountUnit}
                                    selections={maxSizeUnit}
                                    isOpen={isOpenMaxSizeUnit}
                                    aria-labelledby="toggle-id-max-size-unit"
                                >
                                    {unitOptions()}
                                </Select>
                            </GridItem>
                        </Grid>
                    </InputGroup>
                </FormGroup>
            }

            {evictionType === 'count' &&
                <FormGroup
                    isRequired
                    fieldId="max-count"
                    validated={!maxCount || (maxCount && parseInt(maxCount) >= 0) ? 'default' : 'error'}
                    helperTextInvalid={t('caches.create.configurations.feature.max-count-helper-invalid')}
                >
                    <MoreInfoTooltip label={t('caches.create.configurations.feature.max-count')} toolTip={t('caches.create.configurations.feature.max-count-tooltip', { brandname: brandname })} textComponent={TextVariants.h3} />
                    <TextInput min={0} value={maxCount} type="number" onChange={(value) => setMaxCount(value)} aria-label="max-count-input" />
                </FormGroup>
            }

            <FormGroup fieldId='form-eviction-strategy'>
                <MoreInfoTooltip label={t('caches.create.configurations.feature.eviction-strategy')} toolTip={t('caches.create.configurations.feature.eviction-strategy-tooltip', { brandname: brandname })} textComponent={TextVariants.h3} />
                <Select
                    variant={SelectVariant.single}
                    aria-label="eviction-strategy-select"
                    onToggle={() => setIsOpenEvictionStrategy(!isOpenEvictionStrategy)}
                    onSelect={onSelectEvictionStrategy}
                    selections={evictionStrategy}
                    isOpen={isOpenEvictionStrategy}
                    aria-labelledby="toggle-id-eviction-strategy"
                >
                    {evictionStrategyOptions()}
                </Select>
            </FormGroup>
        </React.Fragment>
    );
};

export default BoundedCache;
