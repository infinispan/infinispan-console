/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Divider,
    ExpandableSection,
    Flex,
    FlexItem,
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
    showIndexTuning: boolean,
}) => {
    const { t } = useTranslation();
    const brandname = t('brandname.brandname');

    const [storage, setStorage] = useState<StorageType | undefined>(props.advancedOptions.storage as StorageType);
    const [concurrencyLevel, setConcurrencyLevel] = useState<number | undefined>(props.advancedOptions.concurrencyLevel);
    const [isolationLevel, setIsolationLevel] = useState<IsolationLevel | undefined>(props.advancedOptions.isolationLevel as IsolationLevel);
    const [lockAcquisitionTimeout, setLockAcquisitionTimeout] = useState<number | undefined>(props.advancedOptions.lockAcquisitionTimeout);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const [striping, setStriping] = useState<boolean>(props.advancedOptions.striping!);

    //Index Reader
    const [refreshInterval, setRefreshInterval] = useState<number>(props.advancedOptions.indexReader!);

    //Index Writer
    const [commitInterval, setCommitInterval] = useState<number>(props.advancedOptions.indexWriter.commitInterval!);
    const [lowLevelTrace, setLowLevelTrace] = useState<boolean>(props.advancedOptions.indexWriter.lowLevelTrace!);
    const [maxBufferedEntries, setMaxBufferedEntries] = useState<number>(props.advancedOptions.indexWriter.maxBufferedEntries!);
    const [queueCount, setQueueCount] = useState<number>(props.advancedOptions.indexWriter.queueCount!);
    const [queueSize, setQueueSize] = useState<number>(props.advancedOptions.indexWriter.queueSize!);
    const [ramBufferSize, setRamBufferSize] = useState<number>(props.advancedOptions.indexWriter.ramBufferSize!);
    const [threadPoolSize, setThreadPoolSize] = useState<number>(props.advancedOptions.indexWriter.threadPoolSize!);

    //Index Merge
    const [calibrateByDeletes, setCalibrateByDeletes] = useState<boolean>(props.advancedOptions.indexMerge.calibrateByDeletes);
    const [factor, setFactor] = useState<number>(props.advancedOptions.indexMerge.factor!);
    const [maxEntries, setMaxEntries] = useState<number>(props.advancedOptions.indexMerge.maxEntries!);
    const [minSize, setMinSize] = useState<number>(props.advancedOptions.indexMerge.minSize!);
    const [maxSize, setMaxSize] = useState<number>(props.advancedOptions.indexMerge.maxSize!);
    const [maxForcedSize, setMaxForcedSize] = useState<number>(props.advancedOptions.indexMerge.maxForcedSize!);

    const [isOpenIndexReader, setIsOpenIndexReader] = useState(props.advancedOptions.isOpenIndexReader);
    const [isOpenIndexWriter, setIsOpenIndexWriter] = useState(props.advancedOptions.isOpenIndexWriter);
    const [isOpenIndexMerge, setIsOpenIndexMerge] = useState(props.advancedOptions.isOpenIndexMerge);

    const [isOpenIsolationLevel, setIsOpenIsolationLevel] = useState(false);
    const [disabledStriping, setDisabledStriping] = useState(props.advancedOptions.disabledStriping);

    useEffect(() => {
        props.advancedOptionsModifier({
            storage: storage,
            concurrencyLevel: concurrencyLevel,
            isolationLevel: isolationLevel,
            lockAcquisitionTimeout: lockAcquisitionTimeout,
            striping: striping,
            indexReader: refreshInterval,
            indexWriter: {
                commitInterval: commitInterval,
                lowLevelTrace: lowLevelTrace,
                maxBufferedEntries: maxBufferedEntries,
                queueCount: queueCount,
                queueSize: queueSize,
                ramBufferSize: ramBufferSize,
                threadPoolSize: threadPoolSize,
            },
            indexMerge: {
                calibrateByDeletes: calibrateByDeletes,
                factor: factor,
                maxEntries: maxEntries,
                minSize: minSize,
                maxSize: maxSize,
                maxForcedSize: maxForcedSize,
            },
            isOpenIndexReader: isOpenIndexReader,
            isOpenIndexWriter: isOpenIndexWriter,
            isOpenIndexMerge: isOpenIndexMerge,
            disabledStriping: disabledStriping,
        });
    }, [storage, concurrencyLevel, isolationLevel, lockAcquisitionTimeout, striping, refreshInterval, commitInterval, lowLevelTrace, maxBufferedEntries, queueCount, queueSize, ramBufferSize, threadPoolSize, calibrateByDeletes, factor, maxEntries, minSize, maxSize, maxForcedSize, isOpenIndexReader, isOpenIndexWriter, isOpenIndexMerge, disabledStriping]);

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
            <Card>
                <CardHeader>
                    <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.storage-title')} toolTip={t('caches.create.configurations.advanced-options.storage-tooltip')} textComponent={TextVariants.h2} />
                </CardHeader>
                <CardBody>
                    <FormGroup
                        isInline
                        isRequired
                        fieldId="field-storage"
                    >
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
                </CardBody>
            </Card>
        );
    }

    // Options for Isolation Level
    const isolationLevelOptions = () => {
        return Object.keys(IsolationLevel).map((key) => (
            <SelectOption key={key} value={IsolationLevel[key]} />
        ));
    };

    const formLocking = () => {
        return (
            <Card>
                <CardHeader>
                    <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.locking-title')} toolTip={t('caches.create.configurations.advanced-options.locking-tooltip')} textComponent={TextVariants.h2} />
                </CardHeader>
                <CardBody>
                    <FormGroup
                        isInline
                        isRequired
                        fieldId="field-concurrency-level"
                    >
                        <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.concurrency-level-title')} toolTip={t('caches.create.configurations.advanced-options.concurrency-level-tooltip')} textComponent={TextVariants.h3} />
                        <TextInput placeholder='32' value={concurrencyLevel} type="number" onChange={handleConcurrencyLevel} aria-label="concurrency-level-input" />
                    </FormGroup>
                </CardBody>
                <CardBody>
                    <FormGroup
                        isInline
                        isRequired
                        fieldId="field-isolation-level"
                    >
                        <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.isolation-level-title')} toolTip={t('caches.create.configurations.advanced-options.isolation-level-tooltip')} textComponent={TextVariants.h3} />
                        <Select
                            variant={SelectVariant.single}
                            aria-label="isolation-level-select"
                            onToggle={onToggleIsolationLevel}
                            onSelect={onSelectIsolationLevel}
                            selections={isolationLevel}
                            isOpen={isOpenIsolationLevel}
                            aria-labelledby="toggle-id-isolation-level"
                            placeholderText='Select isolation level'
                        >
                            {isolationLevelOptions()}
                        </Select>
                    </FormGroup>
                </CardBody>
                <CardBody>

                    <FormGroup
                        isInline
                        isRequired
                        fieldId="field-lock-acquisition-timeout"
                    >
                        <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.lock-acquisition-timeout-title')} toolTip={t('caches.create.configurations.advanced-options.lock-acquisition-timeout-tooltip')} textComponent={TextVariants.h3} />
                        <TextInput placeholder='10' value={lockAcquisitionTimeout} type="number" onChange={handleLockAcquisitionTimeout} aria-label="lock-acquisition-timeout-input" />
                    </FormGroup>
                </CardBody>
                <CardBody>

                    <FormGroup
                        isInline
                        fieldId="field-striping"
                        onClick={() => setDisabledStriping(false)}
                    >
                        <Switch
                            aria-label="striping"
                            id="striping"
                            isChecked={striping}
                            onChange={() => setStriping(!striping)}
                            isDisabled={disabledStriping}
                            isReversed
                        />
                        <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.striping')} toolTip={t('caches.create.configurations.advanced-options.striping-tooltip')} textComponent={TextVariants.h3} />
                    </FormGroup>
                </CardBody>
            </Card>
        );
    }

    const formIndexReader = () => {
        return (

            <FormGroup fieldId='index-reader'>
                <ExpandableSection
                    toggleText={t('caches.create.configurations.advanced-options.index-reader')}
                    onToggle={() => setIsOpenIndexReader(!isOpenIndexReader)}
                    isExpanded={isOpenIndexReader}
                >
                    <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.refresh-interval')} toolTip={t('caches.create.configurations.advanced-options.refresh-interval-tooltip')} textComponent={TextVariants.h3} />
                    <TextInput placeholder='0' value={refreshInterval} type="number" onChange={(val) => { isNaN(parseInt(val)) ? setRefreshInterval(undefined!) : setRefreshInterval(parseInt(val)) }} aria-label="refresh-interval" />
                </ExpandableSection>
            </FormGroup>
        )
    }

    const formIndexWriter = () => {
        return (
            <ExpandableSection
                toggleText={t('caches.create.configurations.advanced-options.index-writer')}
                onToggle={() => setIsOpenIndexWriter(!isOpenIndexWriter)}
                isExpanded={isOpenIndexWriter}
            >
                <Form onSubmit={(e) => {
                    e.preventDefault();
                }}>
                    <FormGroup
                        isInline
                        fieldId='low-level-trace'
                    >
                        <Switch
                            aria-label="low-level-trace"
                            id="low-level-trace"
                            isChecked={lowLevelTrace}
                            onChange={() => setLowLevelTrace(!lowLevelTrace)}
                        />
                        <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.low-level-trace')} toolTip={t('caches.create.configurations.advanced-options.low-level-trace-tooltip')} textComponent={TextVariants.h3} />
                    </FormGroup>

                    <Flex>
                        <FlexItem grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>
                            <FormGroup
                                isInline
                                fieldId='commit-interval'
                            >
                                <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.commit-interval')} toolTip={t('caches.create.configurations.advanced-options.commit-interval-tooltip')} textComponent={TextVariants.h3} />
                                <TextInput placeholder='1000' value={commitInterval} type="number" onChange={(val) => { isNaN(parseInt(val)) ? setCommitInterval(undefined!) : setCommitInterval(parseInt(val)) }} aria-label="commit-interval" />
                            </FormGroup>
                        </FlexItem>
                        <FlexItem grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>
                            <FormGroup
                                isInline
                                fieldId='ram-buffer-size'
                            >
                                <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.ram-buffer-size')} toolTip={t('caches.create.configurations.advanced-options.ram-buffer-size-tooltip')} textComponent={TextVariants.h3} />
                                <TextInput placeholder='32' value={ramBufferSize} type="number" onChange={(val) => { isNaN(parseInt(val)) ? setRamBufferSize(undefined!) : setRamBufferSize(parseInt(val)) }} aria-label="ram-buffer-size" />
                            </FormGroup>
                        </FlexItem>
                        <FlexItem grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>
                            <FormGroup
                                isInline
                                fieldId='max-buffered-entries'
                            >
                                <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.max-buffered-entries')} toolTip={t('caches.create.configurations.advanced-options.max-buffered-entries-tooltip')} textComponent={TextVariants.h3} />
                                <TextInput placeholder='32' value={maxBufferedEntries} type="number" onChange={(val) => { isNaN(parseInt(val)) ? setMaxBufferedEntries(undefined!) : setMaxBufferedEntries(parseInt(val)) }} aria-label="max-buffered-entries" />
                            </FormGroup>
                        </FlexItem>
                        <FlexItem grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>
                            <FormGroup
                                isInline
                                fieldId='thread-pool-size'
                            >
                                <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.thread-pool-size')} toolTip={t('caches.create.configurations.advanced-options.thread-pool-size-tooltip')} textComponent={TextVariants.h3} />
                                <TextInput placeholder='1' value={threadPoolSize} type="number" onChange={(val) => { isNaN(parseInt(val)) ? setThreadPoolSize(undefined!) : setThreadPoolSize(parseInt(val)) }} aria-label="thread-pool-size" />
                            </FormGroup>
                        </FlexItem>
                        <FlexItem grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>
                            <FormGroup
                                isInline
                                fieldId='queue-count'
                            >
                                <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.queue-count')} toolTip={t('caches.create.configurations.advanced-options.queue-count-tooltip')} textComponent={TextVariants.h3} />
                                <TextInput placeholder='1' value={queueCount} type="number" onChange={(val) => { isNaN(parseInt(val)) ? setQueueCount(undefined!) : setQueueCount(parseInt(val)) }} aria-label="queue-count" />
                            </FormGroup>
                        </FlexItem>
                        <FlexItem grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>
                            <FormGroup
                                isInline
                                fieldId='queue-size'
                            >
                                <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.queue-size')} toolTip={t('caches.create.configurations.advanced-options.queue-size-tooltip')} textComponent={TextVariants.h3} />
                                <TextInput placeholder='1000' value={queueSize} type="number" onChange={(val) => { isNaN(parseInt(val)) ? setQueueSize(undefined!) : setQueueSize(parseInt(val)) }} aria-label="queue-size" />
                            </FormGroup>
                        </FlexItem>

                    </Flex>
                </Form>
            </ExpandableSection>
        )
    }

    const formIndexMerge = () => {
        return (
            <ExpandableSection
                toggleText={t('caches.create.configurations.advanced-options.index-merge')}
                onToggle={() => setIsOpenIndexMerge(!isOpenIndexMerge)}
                isExpanded={isOpenIndexMerge}
            >
                <Form onSubmit={(e) => {
                    e.preventDefault();
                }}>
                    <FormGroup
                        isInline
                        fieldId='calibrate-by-deletes'
                    >
                        <Switch
                            aria-label="calibrate-by-deletes"
                            id="calibrate-by-deletes"
                            isChecked={calibrateByDeletes}
                            onChange={() => setCalibrateByDeletes(!calibrateByDeletes)}
                        />
                        <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.calibrate-by-deletes')} toolTip={t('caches.create.configurations.advanced-options.calibrate-by-deletes-tooltip')} textComponent={TextVariants.h3} />
                    </FormGroup>

                    <Flex>
                        <FlexItem grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>
                            <FormGroup
                                isInline
                                fieldId='factor'
                            >
                                <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.factor')} toolTip={t('caches.create.configurations.advanced-options.factor-tooltip')} textComponent={TextVariants.h3} />
                                <TextInput value={factor} type="number" onChange={(val) => { isNaN(parseInt(val)) ? setFactor(undefined!) : setFactor(parseInt(val)) }} aria-label="factor" />
                            </FormGroup>
                        </FlexItem>
                        <FlexItem grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>
                            <FormGroup
                                isInline
                                fieldId='max-entries'
                            >
                                <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.max-entries')} toolTip={t('caches.create.configurations.advanced-options.max-entries-tooltip')} textComponent={TextVariants.h3} />
                                <TextInput value={maxEntries} type="number" onChange={(val) => { isNaN(parseInt(val)) ? setMaxEntries(undefined!) : setMaxEntries(parseInt(val)) }} aria-label="max-entries" />
                            </FormGroup>
                        </FlexItem>
                        <FlexItem grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>
                            <FormGroup
                                isInline
                                fieldId='min-size'
                            >
                                <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.min-size')} toolTip={t('caches.create.configurations.advanced-options.min-size-tooltip')} textComponent={TextVariants.h3} />
                                <TextInput value={minSize} type="number" onChange={(val) => { isNaN(parseInt(val)) ? setMinSize(undefined!) : setMinSize(parseInt(val)) }} aria-label="min-size" />
                            </FormGroup>
                        </FlexItem>
                        <FlexItem grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>
                            <FormGroup
                                isInline
                                fieldId='max-size'
                            >
                                <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.max-size')} toolTip={t('caches.create.configurations.advanced-options.max-size-tooltip')} textComponent={TextVariants.h3} />
                                <TextInput value={maxSize} type="number" onChange={(val) => { isNaN(parseInt(val)) ? setMaxSize(undefined!) : setMaxSize(parseInt(val)) }} aria-label="max-size" />
                            </FormGroup>
                        </FlexItem>
                        <FlexItem grow={{ default: 'grow' }} style={{ maxWidth: '25rem' }}>
                            <FormGroup
                                isInline
                                fieldId='max-forced-size'
                            >
                                <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.max-forced-size')} toolTip={t('caches.create.configurations.advanced-options.max-forced-size-tooltip')} textComponent={TextVariants.h3} />
                                <TextInput value={maxForcedSize} type="number" onChange={(val) => { isNaN(parseInt(val)) ? setMaxForcedSize(undefined!) : setMaxForcedSize(parseInt(val)) }} aria-label="max-forced-size" />
                            </FormGroup>
                        </FlexItem>
                    </Flex>
                </Form>
            </ExpandableSection>
        )
    }

    const formIndexTuning = () => {
        return (
            <React.Fragment>
                <Card>
                    <CardHeader>
                        <MoreInfoTooltip label={t('caches.create.configurations.advanced-options.index-tuning')} toolTip={t('caches.create.configurations.advanced-options.index-tuning-tooltip', { brandname: brandname })} textComponent={TextVariants.h2} />
                    </CardHeader>
                    <CardBody>
                        {formIndexReader()}
                    </CardBody>
                    <CardBody>
                        {formIndexWriter()}
                    </CardBody>
                    <CardBody>
                        {formIndexMerge()}
                    </CardBody>

                </Card>

            </React.Fragment>
        );
    }

    return (
        <Form onSubmit={(e) => {
            e.preventDefault();
        }}>
            {formMemory()}
            {formLocking()}
            {props.showIndexTuning && formIndexTuning()}
        </Form>
    );
};

export default AdvancedOptions;
