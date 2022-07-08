import React, {useEffect, useState} from 'react';
import {
  FormFieldGroupExpandable,
  FormFieldGroupHeader,
  FormGroup,
  FormSection,
  Grid,
  GridItem,
  HelperText,
  HelperTextItem,
  Switch,
  TextInput,
} from '@patternfly/react-core';
import {CacheFeature} from "@services/infinispanRefData";
import {useTranslation} from 'react-i18next';
import {useCreateCache} from "@app/services/createCacheHook";
import {PopoverHelp} from "@app/Common/PopoverHelp";

const IndexedConfigurationTuning = () => {
  const { configuration, setConfiguration } = useCreateCache();
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  //Index Reader
  const [refreshInterval, setRefreshInterval] = useState<number>(configuration.advanced.indexReader!);

  //Index Writer
  const [commitInterval, setCommitInterval] = useState<number>(configuration.advanced.indexWriter.commitInterval!);
  const [lowLevelTrace, setLowLevelTrace] = useState<boolean>(configuration.advanced.indexWriter.lowLevelTrace!);
  const [maxBufferedEntries, setMaxBufferedEntries] = useState<number>(configuration.advanced.indexWriter.maxBufferedEntries!);
  const [queueCount, setQueueCount] = useState<number>(configuration.advanced.indexWriter.queueCount!);
  const [queueSize, setQueueSize] = useState<number>(configuration.advanced.indexWriter.queueSize!);
  const [ramBufferSize, setRamBufferSize] = useState<number>(configuration.advanced.indexWriter.ramBufferSize!);
  const [threadPoolSize, setThreadPoolSize] = useState<number>(configuration.advanced.indexWriter.threadPoolSize!);

  //Index Merge
  const [calibrateByDeletes, setCalibrateByDeletes] = useState<boolean>(configuration.advanced.indexMerge.calibrateByDeletes!);
  const [factor, setFactor] = useState<number>(configuration.advanced.indexMerge.factor!);
  const [maxEntries, setMaxEntries] = useState<number>(configuration.advanced.indexMerge.maxEntries!);
  const [minSize, setMinSize] = useState<number>(configuration.advanced.indexMerge.minSize!);
  const [maxSize, setMaxSize] = useState<number>(configuration.advanced.indexMerge.maxSize!);
  const [maxForcedSize, setMaxForcedSize] = useState<number>(configuration.advanced.indexMerge.maxForcedSize!);

  useEffect(() => {
    setConfiguration((prevState) => {
      return {
        ...prevState,
        advanced : {
          ...prevState,
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
          valid: true
        }
      };
    });

  }, [refreshInterval, commitInterval, lowLevelTrace, maxBufferedEntries, queueCount, queueSize, ramBufferSize, threadPoolSize, calibrateByDeletes, factor, maxEntries, minSize, maxSize, maxForcedSize]);


  if (!configuration.feature.cacheFeatureSelected.includes(CacheFeature.INDEXED)) {
    return (
      <div/>
    );
  }

  const formIndexReader = () => {
    return (
      <FormFieldGroupExpandable
        header={
          <FormFieldGroupHeader
            titleText={{ text: t('caches.create.configurations.advanced-options.index-reader'),
              id: 'index-reader-titleText-id' }}
          />}
      >
        <FormGroup fieldId='index-reader'
                   label={t('caches.create.configurations.advanced-options.refresh-interval')}
                   labelIcon={<PopoverHelp name="refresh-interval"
                                           label={t('caches.create.configurations.advanced-options.refresh-interval')}
                                           content={t('caches.create.configurations.advanced-options.refresh-interval-tooltip')} />}
        >
          <TextInput size={150} placeholder='0' value={refreshInterval} type="number" onChange={(val) => { isNaN(parseInt(val)) ? setRefreshInterval(undefined!) : setRefreshInterval(parseInt(val)) }} aria-label="refresh-interval" />
        </FormGroup>
      </FormFieldGroupExpandable>
    )
  }

  const formIndexWriter = () => {
    return (
      <FormFieldGroupExpandable
        header={
          <FormFieldGroupHeader
            titleText={{ text: t('caches.create.configurations.advanced-options.index-writer'),
              id: 'index-writer-titleText-id' }}
          />}
      >
        <Grid md={4} hasGutter>
          <GridItem span={12}>
            <FormGroup fieldId='low-level-trace'>
              <Switch
                aria-label="low-level-trace"
                id="low-level-trace"
                isChecked={lowLevelTrace === undefined ? false : lowLevelTrace}
                onChange={() => setLowLevelTrace(!lowLevelTrace)}
                label={t('caches.create.configurations.advanced-options.low-level-trace')}
              />
              <PopoverHelp name="low-level-trace"
                           label={t('caches.create.configurations.advanced-options.low-level-trace')}
                           content={t('caches.create.configurations.advanced-options.low-level-trace-tooltip')}  />
            </FormGroup>
          </GridItem>
          <FormGroup
            fieldId="commit-interval"
            label={t('caches.create.configurations.advanced-options.commit-interval')}
            labelIcon={<PopoverHelp name="commit-interval"
                                    label={t('caches.create.configurations.advanced-options.commit-interval')}
                                    content={t('caches.create.configurations.advanced-options.commit-interval-tooltip')}  />}
          >
            <TextInput placeholder='1000' value={commitInterval} type="number" onChange={(val) => { isNaN(parseInt(val)) ? setCommitInterval(undefined!) : setCommitInterval(parseInt(val)) }} aria-label="commit-interval" />
          </FormGroup>
          <FormGroup
            fieldId="ram-buffer-size"
            label={t('caches.create.configurations.advanced-options.ram-buffer-size')}
            labelIcon={<PopoverHelp name="ram-buffer-size"
                                    label={t('caches.create.configurations.advanced-options.ram-buffer-size')}
                                    content={t('caches.create.configurations.advanced-options.ram-buffer-size-tooltip')}  />}
          >
            <TextInput placeholder='32' value={ramBufferSize} type="number" onChange={(val) => { isNaN(parseInt(val)) ? setRamBufferSize(undefined!) : setRamBufferSize(parseInt(val)) }} aria-label="ram-buffer-size" />
          </FormGroup>
          <FormGroup
            fieldId="max-buffered-entries"
            label={t('caches.create.configurations.advanced-options.max-buffered-entries')}
            labelIcon={<PopoverHelp name="max-buffered-entries"
                                    label={t('caches.create.configurations.advanced-options.max-buffered-entries')}
                                    content={t('caches.create.configurations.advanced-options.max-buffered-entries-tooltip')}  />}
          >
            <TextInput placeholder='32' value={maxBufferedEntries} type="number" onChange={(val) => { isNaN(parseInt(val)) ? setMaxBufferedEntries(undefined!) : setMaxBufferedEntries(parseInt(val)) }} aria-label="max-buffered-entries" />
          </FormGroup>
          <FormGroup
            fieldId="thread-pool-size"
            label={t('caches.create.configurations.advanced-options.thread-pool-size')}
            labelIcon={<PopoverHelp name="thread-pool-size"
                                    label={t('caches.create.configurations.advanced-options.thread-pool-size')}
                                    content={t('caches.create.configurations.advanced-options.thread-pool-size-tooltip')}  />}
          >
            <TextInput placeholder='1' value={threadPoolSize} type="number" onChange={(val) => { isNaN(parseInt(val)) ? setThreadPoolSize(undefined!) : setThreadPoolSize(parseInt(val)) }} aria-label="thread-pool-size" />
          </FormGroup>
          <FormGroup
            fieldId="queue-count"
            label={t('caches.create.configurations.advanced-options.queue-count')}
            labelIcon={<PopoverHelp name="queue-count"
                                    label={t('caches.create.configurations.advanced-options.queue-count')}
                                    content={t('caches.create.configurations.advanced-options.queue-count-tooltip')}  />}
          >
            <TextInput placeholder='1' value={queueCount} type="number" onChange={(val) => { isNaN(parseInt(val)) ? setQueueCount(undefined!) : setQueueCount(parseInt(val)) }} aria-label="queue-count" />
          </FormGroup>
          <FormGroup
            fieldId="queue-size"
            label={t('caches.create.configurations.advanced-options.queue-size')}
            labelIcon={<PopoverHelp name="queue-size"
                                    label={t('caches.create.configurations.advanced-options.queue-size')}
                                    content={t('caches.create.configurations.advanced-options.queue-size-tooltip')}  />}
          >
            <TextInput placeholder='1000' value={queueSize} type="number" onChange={(val) => { isNaN(parseInt(val)) ? setQueueSize(undefined!) : setQueueSize(parseInt(val)) }} aria-label="queue-size" />
          </FormGroup>
        </Grid>
      </FormFieldGroupExpandable>
    )
  }

  const formIndexMerge = () => {
    return (
      <FormFieldGroupExpandable
        header={
          <FormFieldGroupHeader
            titleText={{ text: t('caches.create.configurations.advanced-options.index-merge'),
              id: 'index-merge-titleText-id' }}
          />}
      >
        <Grid md={4} hasGutter>
          <GridItem span={12}>
            <FormGroup fieldId="calibrate-by-deletes">
              <Switch
                aria-label="calibrate-by-deletes"
                id="calibrate-by-deletes"
                isChecked={calibrateByDeletes === undefined ? false : calibrateByDeletes}
                onChange={() => setCalibrateByDeletes(!calibrateByDeletes)}
                label={t('caches.create.configurations.advanced-options.calibrate-by-deletes')}
              />
              <PopoverHelp name="calibrate-by-deletes"
                           label={t('caches.create.configurations.advanced-options.calibrate-by-deletes')}
                           content={t('caches.create.configurations.advanced-options.calibrate-by-deletes-tooltip')}  />
            </FormGroup>
          </GridItem>
          <FormGroup
            fieldId="factor"
            label={t('caches.create.configurations.advanced-options.factor')}
            labelIcon={<PopoverHelp name="factor"
                                    label={t('caches.create.configurations.advanced-options.factor')}
                                    content={t('caches.create.configurations.advanced-options.factor-tooltip')}  />}
          >
            <TextInput value={factor} type="number" onChange={(val) => { isNaN(parseInt(val)) ? setFactor(undefined!) : setFactor(parseInt(val)) }} aria-label="factor" />
          </FormGroup>
          <FormGroup
            fieldId="max-entries"
            label={t('caches.create.configurations.advanced-options.max-entries')}
            labelIcon={<PopoverHelp name="max-entries"
                                    label={t('caches.create.configurations.advanced-options.max-entries')}
                                    content={t('caches.create.configurations.advanced-options.max-entries-tooltip')}  />}
          >
            <TextInput value={maxEntries} type="number" onChange={(val) => { isNaN(parseInt(val)) ? setMaxEntries(undefined!) : setMaxEntries(parseInt(val)) }} aria-label="max-entries" />
          </FormGroup>
          <FormGroup
            fieldId="min-size"
            label={t('caches.create.configurations.advanced-options.min-size')}
            labelIcon={<PopoverHelp name="min-size"
                                    label={t('caches.create.configurations.advanced-options.min-size')}
                                    content={t('caches.create.configurations.advanced-options.min-size-tooltip')}  />}
          >
            <TextInput value={minSize} type="number" onChange={(val) => { isNaN(parseInt(val)) ? setMinSize(undefined!) : setMinSize(parseInt(val)) }} aria-label="min-size" />
          </FormGroup>
          <FormGroup
            fieldId="max-size"
            label={t('caches.create.configurations.advanced-options.max-size')}
            labelIcon={<PopoverHelp name="max-size"
                                    label={t('caches.create.configurations.advanced-options.max-size')}
                                    content={t('caches.create.configurations.advanced-options.max-size-tooltip')}  />}
          >
            <TextInput value={maxSize} type="number" onChange={(val) => { isNaN(parseInt(val)) ? setMaxSize(undefined!) : setMaxSize(parseInt(val)) }} aria-label="max-size" />
          </FormGroup>
          <FormGroup
            fieldId="max-forced-size"
            label={t('caches.create.configurations.advanced-options.max-forced-size')}
            labelIcon={<PopoverHelp name="max-forced-size"
                                    label={t('caches.create.configurations.advanced-options.max-forced-size')}
                                    content={t('caches.create.configurations.advanced-options.max-forced-size-tooltip')}  />}
          >
            <TextInput value={maxForcedSize} type="number" onChange={(val) => { isNaN(parseInt(val)) ? setMaxForcedSize(undefined!) : setMaxForcedSize(parseInt(val)) }} aria-label="max-forced-size" />
          </FormGroup>
        </Grid>
      </FormFieldGroupExpandable>
    )
  }

  return (
    <FormSection title={t('caches.create.configurations.advanced-options.index-tuning')}>
      <HelperText>
        <HelperTextItem>
          {t('caches.create.configurations.advanced-options.index-tuning-tooltip', { brandname: brandname })}
        </HelperTextItem>
      </HelperText>
      {formIndexReader()}
      {formIndexWriter()}
      {formIndexMerge()}
    </FormSection>
  );
};

export default IndexedConfigurationTuning;
