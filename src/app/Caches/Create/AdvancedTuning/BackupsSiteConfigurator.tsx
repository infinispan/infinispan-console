import React, {useEffect, useState} from 'react';
import {
  FormGroup,
  Grid,
  GridItem,
  Radio,
  Select,
  SelectOption,
  SelectVariant,
  Switch,
  Text,
  TextContent,
  TextInput,
  TextVariants,
} from '@patternfly/react-core';
import {useTranslation} from 'react-i18next';
import {BackupSiteFailurePolicy, BackupSiteStateTransferMode, BackupSiteStrategy} from "@services/infinispanRefData";
import {PopoverHelp} from "@app/Common/PopoverHelp";

const BackupSiteConfigurator = (props: {
    backupSiteOptions: BackupSite[],
    backupSiteOptionsModifier: (BackupSite) => void,
    index: number,
    siteBasic: BackupSiteBasic,
}) => {

    const { t } = useTranslation();
    const brandname = t('brandname.brandname');

    const [failurePolicy, setFailurePolicy] = useState(props.backupSiteOptions[props.index]?.failurePolicy!);
    const [timeout, setTimeout] = useState(props.backupSiteOptions[props.index]?.timeout!);
    const [twoPhaseCommit, setTwoPhaseCommit] = useState(props.backupSiteOptions[props.index]?.twoPhaseCommit!);
    const [failurePolicyClass, setFailurePolicyClass] = useState(props.backupSiteOptions[props.index]?.failurePolicyClass!);

    const [afterFailures, setAfterFailures] = useState(props.backupSiteOptions![props.index]?.takeOffline?.afterFailures!);
    const [minWait, setMinWait] = useState(props.backupSiteOptions[props.index]?.takeOffline?.minWait!);

    const [chunckSize, setChunckSize] = useState(props.backupSiteOptions[props.index]?.stateTransfer?.chunckSize!);
    const [timeoutStateTransfer, setTimeoutStateTransfer] = useState(props.backupSiteOptions[props.index]?.stateTransfer?.timeout!);
    const [maxRetries, setMaxRetries] = useState(props.backupSiteOptions[props.index]?.stateTransfer?.maxRetries!);
    const [waitTime, setWaitTime] = useState(props.backupSiteOptions[props.index]?.stateTransfer?.waitTime!);
    const [mode, setMode] = useState(props.backupSiteOptions[props.index]?.stateTransfer?.mode!);

    const [isOpenFailurePolicy, setIsOpenFailurePolicy] = useState(false);

    useEffect(() => {
        const data = {
            failurePolicy: failurePolicy,
            timeout: timeout,
            twoPhaseCommit: twoPhaseCommit,
            failurePolicyClass: failurePolicyClass,
            takeOffline: {
                afterFailures: afterFailures,
                minWait: minWait,
            },
            stateTransfer: {
                chunckSize: chunckSize,
                timeout: timeoutStateTransfer,
                maxRetries: maxRetries,
                waitTime: waitTime,
                mode: mode,
            },
        }
        props.backupSiteOptionsModifier([
            ...props.backupSiteOptions.slice(0, props.index),
            data,
            ...props.backupSiteOptions.slice(props.index + 1)]);

    }, [failurePolicy, timeout, twoPhaseCommit, failurePolicyClass, afterFailures, minWait, chunckSize, timeoutStateTransfer, maxRetries, waitTime, mode]);

    const onSelectFailurePolicy = (event, selection, isPlaceholder) => {
        setFailurePolicy(selection);
        setIsOpenFailurePolicy(false);
    };

    const formTakeOffline = () => {
        return (
          <React.Fragment>
            <GridItem span={12}>
              <TextContent>
                <Text component={TextVariants.p}>
                  {t('caches.create.configurations.feature.take-offline')}
                </Text>
                <Text component={TextVariants.small}>
                  {t('caches.create.configurations.feature.take-offline-tooltip', { brandname: brandname })}
                </Text>
              </TextContent>
            </GridItem>
              <FormGroup fieldId="afterfailures"
                         label={t('caches.create.configurations.feature.after-failure')}
                         labelIcon={<PopoverHelp name="after-failure"
                                                 label={t('caches.create.configurations.feature.after-failure')}
                                                 content={t('caches.create.configurations.feature.after-failure-tooltip')}/>}
              >
                <TextInput placeholder='0' type='number' id='timeout' value={afterFailures} onChange={(e) => { isNaN(parseInt(e)) ? setAfterFailures(undefined!) : setAfterFailures(parseInt(e)) }} />
              </FormGroup>
              <FormGroup fieldId="minwait"
                         label={t('caches.create.configurations.feature.min-wait')}
                         labelIcon={<PopoverHelp name="minwait"
                                                 label={t('caches.create.configurations.feature.min-wait')}
                                                 content={t('caches.create.configurations.feature.min-wait-tooltip')} />}
              >

                <TextInput placeholder='0' type='number' id='minwait' value={minWait} onChange={(e) => { isNaN(parseInt(e)) ? setMinWait(undefined!) : setMinWait(parseInt(e)) }} />
              </FormGroup>
          </React.Fragment>
        )
    }

    const formStateTransfer = () => {
        return (
            <React.Fragment>
              <GridItem span={12}>
                <TextContent>
                  <Text component={TextVariants.p}>
                    {t('caches.create.configurations.feature.state-transfer')}
                  </Text>
                  <Text component={TextVariants.small}>
                    {t('caches.create.configurations.feature.state-transfer-tooltip', { brandname: brandname })}
                  </Text>
                </TextContent>
              </GridItem>
              <GridItem span={12}>
                <FormGroup isInline
                           fieldId='mode'
                           label={t('caches.create.configurations.feature.mode')}
                           labelIcon={<PopoverHelp name="mode"
                                                   label={t('caches.create.configurations.feature.mode')}
                                                   content={t('caches.create.configurations.feature.mode-tooltip', { brandname: brandname })} />}
                >
                  <Radio
                    name="mood-radio"
                    id="manual"
                    onChange={() => setMode(BackupSiteStateTransferMode.MANUAL)}
                    isChecked={mode as BackupSiteStateTransferMode == BackupSiteStateTransferMode.MANUAL}
                    label={t('caches.create.configurations.feature.mode-manual')}
                  />
                  <Radio
                    name="mood-radio"
                    id="auto"
                    onChange={() => setMode(BackupSiteStateTransferMode.AUTO)}
                    isChecked={mode as BackupSiteStateTransferMode == BackupSiteStateTransferMode.AUTO}
                    label={t('caches.create.configurations.feature.mode-auto')}
                  />
                </FormGroup>
              </GridItem>
              <GridItem span={3}>
                <FormGroup fieldId='chuncksize'
                           label={t('caches.create.configurations.feature.chunk-size')}
                           labelIcon={<PopoverHelp name="chuncksize"
                                                   label={t('caches.create.configurations.feature.chunk-size')}
                                                   content={t('caches.create.configurations.feature.chunk-size-tooltip')} />}
                >
                    <TextInput placeholder='512' type='number' id='chuncksize' value={chunckSize} onChange={(e) => { isNaN(parseInt(e)) ? setChunckSize(undefined!) : setChunckSize(parseInt(e)) }} />
                </FormGroup>
              </GridItem>
              <GridItem span={3}>
                <FormGroup fieldId='timeout-state-transfer'
                           label={t('caches.create.configurations.feature.timeout-state-transfer')}
                           labelIcon={<PopoverHelp name="timeout-state-transfer"
                                                   label={t('caches.create.configurations.feature.timeout-state-transfer')}
                                                   content={t('caches.create.configurations.feature.timeout-state-transfer-tooltip')} />}
                >

                    <TextInput placeholder='1200000' type='number' id='timeout' value={timeoutStateTransfer} onChange={(e) => { isNaN(parseInt(e)) ? setTimeoutStateTransfer(undefined!) : setTimeoutStateTransfer(parseInt(e)) }} />
                </FormGroup>
              </GridItem>
              <GridItem span={3}>
                <FormGroup fieldId='maxretries'
                           label={t('caches.create.configurations.feature.max-retries')}
                           labelIcon={<PopoverHelp name="maxretries"
                                                   label={t('caches.create.configurations.feature.max-retries')}
                                                   content={t('caches.create.configurations.feature.max-retries-tooltip')} />}
                >
                    <TextInput placeholder='30' type='number' id='maxretries' value={maxRetries} onChange={(e) => { isNaN(parseInt(e)) ? setMaxRetries(undefined!) : setMaxRetries(parseInt(e)) }} />
                </FormGroup>
              </GridItem>
              <GridItem span={3}>
                <FormGroup fieldId='wait-time'
                           label={t('caches.create.configurations.feature.wait-time')}
                           labelIcon={<PopoverHelp name="wait-time"
                                                   label={t('caches.create.configurations.feature.wait-time')}
                                                   content={t('caches.create.configurations.feature.wait-time-tooltip')} />}
                >
                    <TextInput placeholder='2000' type='number' id='waittime' value={waitTime} onChange={(e) => { isNaN(parseInt(e)) ? setWaitTime(undefined!) : setWaitTime(parseInt(e)) }} />
                </FormGroup>
              </GridItem>
            </React.Fragment>
        )
    }

    // Options for Failure Policy
    const failurePolicyOptions = () => {
        return Object.keys(BackupSiteFailurePolicy).map((key) => (
            <SelectOption key={key} value={BackupSiteFailurePolicy[key]} />
        ));
    };

    const displayTwoPhaseCommit = () => {
       if (props.siteBasic.siteStrategy !== BackupSiteStrategy.SYNC) {
         return ;
       }

      return (
        <GridItem span={12}>
          <FormGroup fieldId='twoPhaseCommit'>
            <Switch
              aria-label="twoPhaseCommit"
              id="twoPhaseCommit"
              isChecked={twoPhaseCommit === undefined ? false : twoPhaseCommit}
              onChange={() => setTwoPhaseCommit(!twoPhaseCommit)}
              label={t('caches.create.configurations.feature.two-phase-commit')}
            />
            <PopoverHelp  name={'two-phase-commit'}
                          label={t('caches.create.configurations.feature.two-phase-commit')}
                          content={t('caches.create.configurations.feature.two-phase-commit-tooltip')} />
          </FormGroup>
        </GridItem>
      );
    }

    return (
      <Grid hasGutter md={4}>
          {displayTwoPhaseCommit()}
          <FormGroup fieldId='failurePolicy'
                     label={t('caches.create.configurations.feature.failure-policy')}
                     labelIcon={<PopoverHelp name='failure-policy'
                                             label={t('caches.create.configurations.feature.failure-policy')}
                                             content={t('caches.create.configurations.feature.failure-policy-tooltip')} />}
          >

            <Select
              id="failurePolicy"
              variant={SelectVariant.single}
              onToggle={() => setIsOpenFailurePolicy(!isOpenFailurePolicy)}
              onSelect={onSelectFailurePolicy}
              isOpen={isOpenFailurePolicy}
              selections={failurePolicy}
              value={failurePolicy}
              aria-label="Failure Policy"
              aria-describedby="failurePolicy-helper"
            >
              {failurePolicyOptions()}
            </Select>
          </FormGroup>
          <FormGroup fieldId='timeout'
                     label={t('caches.create.configurations.feature.timeout')}
                     labelIcon={<PopoverHelp name="timeout"
                                             label={t('caches.create.configurations.feature.timeout')}
                                             content={t('caches.create.configurations.feature.timeout-tooltip')} />}
          >

            <TextInput placeholder='15000' type='number' id='timeout' value={timeout} onChange={(e) => { isNaN(parseInt(e)) ? setTimeout(undefined!) : setTimeout(parseInt(e)) }} />
          </FormGroup>
          <FormGroup fieldId='failurePolicyClass'
                     label={t('caches.create.configurations.feature.failure-policy-class')}
                     labelIcon={<PopoverHelp name="failurePolicyClass"
                                             label={t('caches.create.configurations.feature.failure-policy-class')}
                                             content={t('caches.create.configurations.feature.failure-policy-class-tooltip')} />}
          >
            <TextInput type='text' id='failurePolicyClass' value={failurePolicyClass} onChange={(e) => { e === "" ? setFailurePolicyClass(undefined!) : setFailurePolicyClass(e) }} />
          </FormGroup>
        {formTakeOffline()}
        {formStateTransfer()}
      </Grid>
    );
};

export default BackupSiteConfigurator;
