import React, { useCallback, useEffect, useState } from 'react';
import {
  ActionList,
  ActionListGroup,
  ActionListItem,
  Button,
  Checkbox,
  Content,
  Form,
  FormGroup,
  Modal,
  ModalBody,
  ModalHeader,
  Switch,
  TextInput,
  useWizardContext,
  Wizard,
  WizardFooterWrapper,
  WizardStep
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import { useApiAlert } from '@app/utils/useApiAlert';
import { useConnectedUser } from '@app/hooks/userManagementHook';

const STEP_SOURCE = 'step-source';
const STEP_CACHES = 'step-caches';
const STEP_REVIEW = 'step-review';

const RollingUpgradeWizard = (props: { isOpen: boolean; onClose: () => void; onComplete: () => void }) => {
  const { t } = useTranslation();
  const { addAlert } = useApiAlert();
  const { notSecured } = useConnectedUser();

  const [host, setHost] = useState('');
  const [port, setPort] = useState(11222);
  const [secured, setSecured] = useState(!notSecured);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password');
  const [realm, setRealm] = useState('default');

  const [availableCaches, setAvailableCaches] = useState<string[]>([]);
  const [selectedCaches, setSelectedCaches] = useState<string[]>([]);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (props.isOpen) {
      ConsoleServices.dataContainer()
        .getCaches()
        .then((either) => {
          if (either.isRight()) {
            const cacheNames: string[] = (either.value as CacheInfo[]).map((c) => c.name);
            setAvailableCaches(cacheNames);
            setSelectedCaches([...cacheNames]);
          }
        });
    }
  }, [props.isOpen]);

  const toggleCache = (cacheName: string) => {
    setSelectedCaches((prev) =>
      prev.includes(cacheName) ? prev.filter((c) => c !== cacheName) : [...prev, cacheName]
    );
  };

  const toggleAll = (checked: boolean) => {
    setSelectedCaches(checked ? [...availableCaches] : []);
  };

  const isSourceValid = host.trim().length > 0 && port > 0;
  const hasCachesSelected = selectedCaches.length > 0;

  const handleConnect = useCallback(async () => {
    setConnecting(true);
    const config: RemoteStoreConfig = {
      host: host.trim(),
      port,
      secured,
      username: secured ? username : undefined,
      password: secured ? password : undefined,
      realm: secured ? realm : undefined
    };

    let successCount = 0;
    let failCount = 0;

    for (const cacheName of selectedCaches) {
      const result = await ConsoleServices.rollingUpgrade().addSourceConnection(cacheName, config);
      if (result.success) {
        successCount++;
      } else {
        failCount++;
        addAlert(result);
      }
    }

    setConnecting(false);

    if (successCount > 0) {
      addAlert({
        message: t('rolling-upgrades.wizard.connect-success', {
          count: successCount
        }),
        success: true
      } as ActionResponse);
    }
    if (failCount > 0) {
      addAlert({
        message: t('rolling-upgrades.wizard.connect-error'),
        success: false
      } as ActionResponse);
    }

    props.onComplete();
  }, [host, port, secured, username, password, selectedCaches, addAlert, t, props]);

  if (!props.isOpen) return null;

  const CustomFooter = () => {
    const { activeStep, goToNextStep, goToPrevStep } = useWizardContext();

    const isReview = activeStep.id === STEP_REVIEW;
    const isSource = activeStep.id === STEP_SOURCE;

    const nextDisabled =
      (isSource && host.trim().length === 0) || (activeStep.id === STEP_CACHES && selectedCaches.length === 0);

    return (
      <WizardFooterWrapper>
        <ActionList>
          <ActionListGroup>
            {!isSource && (
              <ActionListItem>
                <Button variant="secondary" onClick={goToPrevStep} isDisabled={connecting}>
                  {t('common.actions.back')}
                </Button>
              </ActionListItem>
            )}
            <ActionListItem>
              {isReview ? (
                <Button variant="primary" onClick={handleConnect} isLoading={connecting} isDisabled={connecting}>
                  {t('rolling-upgrades.actions.connect')}
                </Button>
              ) : (
                <Button variant="primary" onClick={goToNextStep} isDisabled={nextDisabled}>
                  Next
                </Button>
              )}
            </ActionListItem>
            <ActionListItem>
              <Button variant="link" onClick={props.onClose} isDisabled={connecting}>
                {t('common.actions.cancel')}
              </Button>
            </ActionListItem>
          </ActionListGroup>
        </ActionList>
      </WizardFooterWrapper>
    );
  };

  return (
    <Modal
      variant="large"
      isOpen={props.isOpen}
      onClose={props.onClose}
      aria-label={t('rolling-upgrades.wizard.title')}
    >
      <ModalHeader title={t('rolling-upgrades.wizard.title')} />
      <ModalBody>
        <Wizard>
          <WizardStep id={STEP_SOURCE} name={t('rolling-upgrades.wizard.step-source')} footer={<CustomFooter />}>
            <Form>
              <FormGroup label={t('rolling-upgrades.wizard.host-label')} isRequired fieldId="source-host">
                <TextInput id="source-host" value={host} onChange={(_event, val) => setHost(val)} isRequired />
              </FormGroup>
              <FormGroup label={t('rolling-upgrades.wizard.port-label')} isRequired fieldId="source-port">
                <TextInput
                  id="source-port"
                  type="number"
                  value={port}
                  onChange={(_event, val) => setPort(parseInt(val, 10) || 0)}
                  isRequired
                />
              </FormGroup>
              {!notSecured && (
                <>
                  <Switch
                    id="use-security"
                    label={t('rolling-upgrades.wizard.use-security')}
                    isChecked={secured}
                    onChange={(_event, val) => setSecured(val)}
                  />
                  {secured && (
                    <>
                      <FormGroup label={t('rolling-upgrades.wizard.username-label')} fieldId="source-username">
                        <TextInput id="source-username" value={username} onChange={(_event, val) => setUsername(val)} />
                      </FormGroup>
                      <FormGroup label={t('rolling-upgrades.wizard.password-label')} fieldId="source-password">
                        <TextInput
                          id="source-password"
                          type="password"
                          value={password}
                          onChange={(_event, val) => setPassword(val)}
                        />
                      </FormGroup>
                      <FormGroup label={t('rolling-upgrades.wizard.realm-label')} fieldId="source-realm">
                        <TextInput id="source-realm" value={realm} onChange={(_event, val) => setRealm(val)} />
                      </FormGroup>
                    </>
                  )}
                </>
              )}
            </Form>
          </WizardStep>
          <WizardStep id={STEP_CACHES} name={t('rolling-upgrades.wizard.step-caches')} footer={<CustomFooter />}>
            <Checkbox
              id="select-all"
              label={t('rolling-upgrades.wizard.select-all')}
              isChecked={selectedCaches.length === availableCaches.length}
              onChange={(_event, checked) => toggleAll(checked)}
            />
            {availableCaches.map((cacheName) => (
              <Checkbox
                key={cacheName}
                id={`cache-${cacheName}`}
                label={cacheName}
                isChecked={selectedCaches.includes(cacheName)}
                onChange={() => toggleCache(cacheName)}
              />
            ))}
          </WizardStep>
          <WizardStep id={STEP_REVIEW} name={t('rolling-upgrades.wizard.step-review')} footer={<CustomFooter />}>
            <Content>
              <Content component="dl">
                <Content component="dt">{t('rolling-upgrades.wizard.review-source')}</Content>
                <Content component="dd">
                  {host}:{port}
                </Content>
                <Content component="dt">{t('rolling-upgrades.wizard.review-caches')}</Content>
                <Content component="dd">
                  {selectedCaches.join(', ')} ({selectedCaches.length})
                </Content>
                <Content component="dt">{t('rolling-upgrades.wizard.review-security')}</Content>
                <Content component="dd">
                  {secured
                    ? t('rolling-upgrades.wizard.review-security-enabled')
                    : t('rolling-upgrades.wizard.review-security-none')}
                </Content>
              </Content>
              <Content component="p">{t('rolling-upgrades.wizard.review-description')}</Content>
            </Content>
          </WizardStep>
        </Wizard>
      </ModalBody>
    </Modal>
  );
};

export { RollingUpgradeWizard };
