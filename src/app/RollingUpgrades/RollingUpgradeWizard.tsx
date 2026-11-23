import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActionList,
  ActionListGroup,
  ActionListItem,
  Button,
  Content,
  Form,
  FormGroup,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Pagination,
  SearchInput,
  Switch,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarItemVariant,
  useWizardContext,
  Wizard,
  WizardFooterWrapper,
  WizardStep
} from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import { useApiAlert } from '@app/utils/useApiAlert';
import { useConnectedUser } from '@app/hooks/userManagementHook';
import { onSearch } from '@app/utils/searchFilter';
import displayUtils from '@services/displayUtils';
import { InfinispanComponentStatus } from '@app/Common/InfinispanComponentStatus';

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

  const [availableCaches, setAvailableCaches] = useState<CacheInfo[]>([]);
  const [selectedCacheNames, setSelectedCacheNames] = useState<string[]>([]);
  const [connecting, setConnecting] = useState(false);

  const [cacheSearchValue, setCacheSearchValue] = useState('');
  const [cachePagination, setCachePagination] = useState({ page: 1, perPage: 10 });

  useEffect(() => {
    if (props.isOpen) {
      setHost('');
      setPort(11222);
      setSecured(!notSecured);
      setUsername('admin');
      setPassword('password');
      setRealm('default');
      setCacheSearchValue('');
      setCachePagination({ page: 1, perPage: 10 });
      setConnecting(false);

      ConsoleServices.dataContainer()
        .getCaches()
        .then((either) => {
          if (either.isRight()) {
            const caches = either.value as CacheInfo[];
            setAvailableCaches(caches);
            setSelectedCacheNames(caches.map((c) => c.name));
          }
        });
    }
  }, [props.isOpen]);

  const filteredCaches = useMemo(
    () => availableCaches.filter((c) => onSearch(cacheSearchValue, c.name)),
    [availableCaches, cacheSearchValue]
  );

  const pagedCaches = useMemo(() => {
    const start = (cachePagination.page - 1) * cachePagination.perPage;
    return filteredCaches.slice(start, start + cachePagination.perPage);
  }, [filteredCaches, cachePagination]);

  const areAllSelected = filteredCaches.length > 0 && filteredCaches.every((c) => selectedCacheNames.includes(c.name));
  const areSomeSelected = !areAllSelected && filteredCaches.some((c) => selectedCacheNames.includes(c.name));

  const selectAll = (isSelecting: boolean) => {
    if (isSelecting) {
      setSelectedCacheNames((prev) => [...new Set([...prev, ...filteredCaches.map((c) => c.name)])]);
    } else {
      const filteredNames = new Set(filteredCaches.map((c) => c.name));
      setSelectedCacheNames((prev) => prev.filter((n) => !filteredNames.has(n)));
    }
  };

  const onSelectCache = (cacheName: string, isSelecting: boolean) => {
    setSelectedCacheNames((prev) => (isSelecting ? [...prev, cacheName] : prev.filter((n) => n !== cacheName)));
  };

  const onCachePageChange = (_event, pageNumber) => {
    setCachePagination({ ...cachePagination, page: pageNumber });
  };

  const onCachePerPageSelect = (_event, perPage) => {
    setCachePagination({ page: 1, perPage });
  };

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

    for (const cacheName of selectedCacheNames) {
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
  }, [host, port, secured, username, password, selectedCacheNames, addAlert, t, props]);

  if (!props.isOpen) return null;

  const CustomFooter = () => {
    const { activeStep, goToNextStep, goToPrevStep } = useWizardContext();

    const isReview = activeStep.id === STEP_REVIEW;
    const isSource = activeStep.id === STEP_SOURCE;

    const nextDisabled =
      (isSource && host.trim().length === 0) || (activeStep.id === STEP_CACHES && selectedCacheNames.length === 0);

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
            <Toolbar>
              <ToolbarContent>
                <ToolbarItem>
                  <SearchInput
                    placeholder={t('rolling-upgrades.wizard.search-caches')}
                    value={cacheSearchValue}
                    onChange={(_event, val) => setCacheSearchValue(val)}
                    onClear={() => setCacheSearchValue('')}
                  />
                </ToolbarItem>
                <ToolbarItem variant={ToolbarItemVariant.pagination}>
                  <Pagination
                    itemCount={filteredCaches.length}
                    perPage={cachePagination.perPage}
                    page={cachePagination.page}
                    onSetPage={onCachePageChange}
                    onPerPageSelect={onCachePerPageSelect}
                    isCompact
                  />
                </ToolbarItem>
              </ToolbarContent>
            </Toolbar>
            <Table aria-label={t('rolling-upgrades.wizard.step-caches')} variant="compact">
              <Thead>
                <Tr>
                  <Th
                    select={{
                      onSelect: (_event, isSelecting) => selectAll(isSelecting),
                      isSelected: areAllSelected,
                      isIndeterminate: areSomeSelected
                    }}
                  />
                  <Th>{t('cache-managers.cache-name')}</Th>
                  <Th>{t('cache-managers.cache-mode')}</Th>
                  <Th>{t('cache-managers.cache-health')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {pagedCaches.map((cache, rowIndex) => (
                  <Tr key={cache.name}>
                    <Td
                      select={{
                        rowIndex,
                        onSelect: (_event, isSelecting) => onSelectCache(cache.name, isSelecting),
                        isSelected: selectedCacheNames.includes(cache.name)
                      }}
                    />
                    <Td dataLabel={t('cache-managers.cache-name')}>{cache.name}</Td>
                    <Td dataLabel={t('cache-managers.cache-mode')}>
                      <Label color={displayUtils.cacheTypeColor(cache.type)}>{cache.type}</Label>
                    </Td>
                    <Td dataLabel={t('cache-managers.cache-health')}>
                      <InfinispanComponentStatus status={cache.health} name={cache.name} isLabel={true} />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
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
                  {selectedCacheNames.join(', ')} ({selectedCacheNames.length})
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
