import React, { useState, useEffect } from 'react';
import {
    Divider,
    Form,
    FormGroup,
    Radio,
    Select,
    SelectOption,
    SelectVariant,
    Switch,
    Text,
    TextContent,
    TextVariants,
    TextInput
} from '@patternfly/react-core';
import { IsolationLevel, StorageType } from "@services/infinispanRefData";
import { useTranslation } from 'react-i18next';
import { MoreInfoTooltip } from '@app/Common/MoreInfoTooltip';

const AdvancedOptions = (props: {
    advancedOptions: AdvancedConfigurationStep,
    advancedOptionsModifier: (AdvancedConfigurationStep) => void,
}) => {
    const { t } = useTranslation();

    const [storage, setStorage] = useState<StorageType>(props.advancedOptions.storage as StorageType);
    const [concurrencyLevel, setConcurrencyLevel] = useState<number>(props.advancedOptions.concurrencyLevel || 0);
    const [isolationLevel, setIsolationLevel] = useState<IsolationLevel>(props.advancedOptions.isolationLevel as IsolationLevel);
    const [lockAcquisitionTimeout, setLockAcquisitionTimeout] = useState<number>(props.advancedOptions.lockAcquisitionTimeout || 0);
    const [striping, setStriping] = useState<boolean>(props.advancedOptions.striping || true);

    const [isOpenIsolationLevel, setIsOpenIsolationLevel] = useState(false);

    useEffect(() => {
        props.advancedOptionsModifier({
            storage: storage,
            concurrencyLevel: concurrencyLevel,
            isolationLevel: isolationLevel,
            lockAcquisitionTimeout: lockAcquisitionTimeout,
            striping: striping,
        });
    }, [storage, concurrencyLevel, isolationLevel, lockAcquisitionTimeout, striping]);

    const onToggleIsolationLevel = () => {
        setIsOpenIsolationLevel(!isOpenIsolationLevel);
    };

    const onSelectIsolationLevel = (event, selection, isPlaceholder) => {
        setIsolationLevel(selection);
        setIsOpenIsolationLevel(false);
    };

    const handleConcurrencyLevel = (value) => {
        setConcurrencyLevel(value);
    }

    const handleLockAcquisitionTimeout = (value) => {
        setLockAcquisitionTimeout(value);
    }

    const formMemory = () => {
        return (
            <React.Fragment>
                <TextContent>
                    <Text component={TextVariants.h3}>{t('caches.create.configurations.advanced-options.page-title')}</Text>
                </TextContent>
                <TextContent>
                    <Text component={TextVariants.p}>{t('caches.create.configurations.advanced-options.page-subtitle')}</Text>
                </TextContent>
                <FormGroup
                    isInline
                    isRequired
                    fieldId="field-storage"
                >
                    <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.storage-title')} toolTip={t('caches.create.configurations.advanced-options.storage-tooltip')} textComponent={TextVariants.h4} />
                    <Radio
                        name="radio"
                        id="heap"
                        onChange={() => setStorage(StorageType.HEAP)}
                        isChecked={storage as StorageType == StorageType.HEAP}
                        label={
                            <TextContent>
                                <Text component={TextVariants.h3}>
                                    {t('caches.create.configurations.advanced-options.radio-heap')}
                                </Text>
                            </TextContent>
                        }
                    />
                    <Radio
                        name="radio"
                        id="off_heap"
                        onChange={() => setStorage(StorageType.OFF_HEAP)}
                        isChecked={storage as StorageType == StorageType.OFF_HEAP}
                        label={
                            <TextContent>
                                <Text component={TextVariants.h3}>
                                    {t('caches.create.configurations.advanced-options.radio-off-heap')}
                                </Text>
                            </TextContent>
                        }
                    />
                </FormGroup>
            </React.Fragment>
        );
    }

    // Options for Isolation Level
    const isolationLevelOptions = () => {
        return Object.keys(IsolationLevel).map((key) => (
            <SelectOption key={key} value={key} />
        ));
    };

    const formLocking = () => {
        return (
            <React.Fragment>
                <TextContent>
                    <Text component={TextVariants.h3}>{t('caches.create.configurations.advanced-options.locking-title')}</Text>
                </TextContent>
                <TextContent>
                    <Text component={TextVariants.p}>{t('caches.create.configurations.advanced-options.locking-subtitle')}</Text>
                </TextContent>
                <FormGroup
                    isInline
                    isRequired
                    fieldId="field-concurrency-level"
                >
                    <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.concurrency-level-title')} toolTip={t('caches.create.configurations.advanced-options.concurrency-level-tooltip')} textComponent={TextVariants.h4} />
                    <TextInput value={concurrencyLevel} type="number" onChange={handleConcurrencyLevel} aria-label="concurrency-level-input" />
                </FormGroup>
                <FormGroup
                    isInline
                    isRequired
                    fieldId="field-isolation-level"
                >
                    <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.isolation-level-title')} toolTip={t('caches.create.configurations.advanced-options.isolation-level-tooltip')} textComponent={TextVariants.h4} />
                    <Select
                        variant={SelectVariant.single}
                        aria-label="isolation-level-select"
                        onToggle={onToggleIsolationLevel}
                        onSelect={onSelectIsolationLevel}
                        selections={isolationLevel}
                        isOpen={isOpenIsolationLevel}
                        aria-labelledby="toggle-id-isolation-level"
                    >
                        {isolationLevelOptions()}
                    </Select>
                </FormGroup>
                <FormGroup
                    isInline
                    isRequired
                    fieldId="field-lock-acquisition-timeout"
                >
                    <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.lock-acquisition-timeout-title')} toolTip={t('caches.create.configurations.advanced-options.lock-acquisition-timeout-tooltip')} textComponent={TextVariants.h4} />
                    <TextInput value={lockAcquisitionTimeout} type="number" onChange={handleLockAcquisitionTimeout} aria-label="lock-acquisition-timeout-input" />
                </FormGroup>
                <FormGroup
                    isInline
                    fieldId="field-striping"
                >
                    <Switch
                        aria-label="striping"
                        id="striping"
                        isChecked={striping}
                        onChange={() => setStriping(!striping)}
                        isReversed
                    />
                    <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.striping')} toolTip={t('caches.create.configurations.advanced-options.striping-tooltip')} textComponent={TextVariants.h4} />
                </FormGroup>
            </React.Fragment>
        );
    }

    return (
        <Form>
            {formMemory()}
            <Divider />
            {formLocking()}
        </Form>
    );
};

export default AdvancedOptions;
