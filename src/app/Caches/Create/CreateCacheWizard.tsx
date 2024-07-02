import React, { useState } from 'react';
import {
  Button,
  PageSection,
  PageSectionTypes,
  PageSectionVariants,
  ToolbarItem,
  useWizardContext,
  Wizard,
  WizardFooterWrapper,
  WizardStep,
  WizardStepType
} from '@patternfly/react-core';
import { useNavigate } from 'react-router';
import { useApiAlert } from '@app/utils/useApiAlert';
import { useCreateCache } from '@app/services/createCacheHook';
import { useStateCallback } from '@app/services/stateCallbackHook';
import { useTranslation } from 'react-i18next';
import { CacheConfigUtils } from '@services/cacheConfigUtils';
import { validFeatures } from '@app/utils/featuresValidation';
import CacheConfigEditor from '@app/Caches/Create/CacheConfigEditor';
import AdvancedOptionsConfigurator from '@app/Caches/Create/AdvancedOptionsConfigurator';
import ReviewCacheConfig from '@app/Caches/Create/ReviewCacheConfig';
import CreateCacheGettingStarted from '@app/Caches/Create/CreateCacheGettingStarted';
import BasicCacheConfigConfigurator from '@app/Caches/Create/BasicCacheConfigConfigurator';
import FeaturesSelector from '@app/Caches/Create/FeaturesSelector';
import DownloadCacheModal from '@app/Caches/Create/DownloadCacheModal';
import { ConsoleACL } from '@services/securityService';
import { useConnectedUser } from '@app/services/userManagementHook';
import { ConsoleServices } from '@services/ConsoleServices';

const CacheEditorInitialState: CacheEditorStep = {
  editorConfig: '',
  configs: [],
  validConfig: 'default',
  errorConfig: '',
  selectedConfig: '',
  configExpanded: false,
  editorExpanded: false
};

const CreateCacheWizard = (props: { cacheManager: CacheManager; create: boolean }) => {
  const { addAlert } = useApiAlert();
  const { configuration } = useCreateCache();
  const { connectedUser } = useConnectedUser();

  const { t } = useTranslation();
  const brandname = t('brandname.brandname');

  // State for wizard steps
  const [stateObj, setStateObj] = useStateCallback({
    showCacheEditor: false,
    showConfigurationSteps: false
  });

  const [cacheEditor, setCacheEditor] = useState<CacheEditorStep>(CacheEditorInitialState);
  const [reviewConfig, setReviewConfig] = useState<string>('');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const canCreateCache = ConsoleServices.security().hasConsoleACL(ConsoleACL.CREATE, connectedUser);
  const [contentType, setContentType] = useState<'json' | 'yaml' | 'xml'>('json');

  const navigate = useNavigate();
  const closeWizard = () => {
    navigate('/');
  };

  const isCreateButton = (activeStep: WizardStepType): boolean => {
    return activeStep.id === 2 || activeStep.id === 7;
  };

  const isButtonNextOrCreateDisabled = (activeStep: WizardStepType): boolean => {
    let activeButton = true;
    switch (activeStep.id) {
      case 1:
        activeButton = configuration.start.valid;
        break;
      case 2:
        activeButton = props.create && cacheEditor.validConfig !== 'error';
        break;
      case 3:
        activeButton = configuration.basic.valid;
        break;
      case 4:
        activeButton = configuration.basic.valid;
        break;
      case 5:
        activeButton = validFeatures(configuration);
        break;
      case 6:
        activeButton = configuration.advanced.valid;
        break;
      case 7:
        activeButton = props.create;
        break;
      default:
    }

    return !activeButton;
  };

  const nextOrCreateToolbarItem = (activeStep: WizardStepType, onNext) => {
    if (isCreateButton(activeStep) && isButtonNextOrCreateDisabled(activeStep)) {
      // The user is not allowed to create a cache, don't display the create button
      return;
    }

    const buttonId = isCreateButton(activeStep) ? 'create-cache' : 'next-step';
    return (
      <ToolbarItem>
        <Button
          id={buttonId}
          name={buttonId}
          variant="primary"
          type="submit"
          onClick={onNext}
          isDisabled={isButtonNextOrCreateDisabled(activeStep)}
          data-cy="wizardNextButton"
        >
          {isCreateButton(activeStep) ? t('caches.create.create-button-label') : t('caches.create.next-button-label')}
        </Button>
      </ToolbarItem>
    );
  };

  const backToolbarItem = (activeStep: WizardStepType, onBack) => {
    return (
      <Button isDisabled={activeStep.id == 1} variant="secondary" onClick={onBack} data-cy="wizardBackButton">
        {t('common.actions.back')}
      </Button>
    );
  };

  const cancelToolbarItem = (onClose) => {
    return (
      <ToolbarItem>
        <Button variant="link" onClick={onClose} data-cy="cancelWizard">
          {t('caches.create.cancel-button-label')}
        </Button>
      </ToolbarItem>
    );
  };

  const downloadToolbarItem = (activeStep) => {
    if (activeStep.id !== 2 && activeStep.id !== 7) {
      return '';
    }
    if (activeStep.id === 7 && !configuration.advanced.valid) {
      return '';
    }

    if (activeStep.id === 2 && cacheEditor.validConfig !== 'success') {
      return '';
    }

    const buttonVariant = canCreateCache ? 'secondary' : 'primary';

    return (
      <ToolbarItem>
        <Button variant={buttonVariant} onClick={() => setIsDownloadModalOpen(true)} data-cy="downloadModal">
          {t('caches.create.download-button-label')}
        </Button>
      </ToolbarItem>
    );
  };

  const onSave = () => {
    const createCacheCall =
      configuration.start.createType === 'edit' // Check wizard option
        ? CacheConfigUtils.createCacheWithEditorStep(cacheEditor, configuration.start.cacheName)
        : CacheConfigUtils.createCacheWithWizardStep(
            reviewConfig === '' ? CacheConfigUtils.createCacheConfigFromData(configuration) : reviewConfig,
            configuration.start.cacheName,
            contentType
          );

    createCacheCall
      .then((actionResponse) => {
        if (actionResponse.success) {
          navigate('/');
        }
        return actionResponse;
      })
      .then((actionResponse) => addAlert(actionResponse));
  };

  const CustomStepsFooter = () => {
    const { activeStep, goToNextStep, goToPrevStep, close } = useWizardContext();
    return (
      <WizardFooterWrapper>
        {backToolbarItem(activeStep, goToPrevStep)}
        {nextOrCreateToolbarItem(activeStep, goToNextStep)}
        {downloadToolbarItem(activeStep)}
        {cancelToolbarItem(close)}
      </WizardFooterWrapper>
    );
  };

  return (
    <PageSection type={PageSectionTypes.wizard} variant={PageSectionVariants.light}>
      <Wizard navAriaLabel={'Create Cache steps'} onClose={closeWizard} onSave={onSave}>
        <WizardStep name={t('caches.create.getting-started.nav-title')} id={1} footer={<CustomStepsFooter />}>
          <CreateCacheGettingStarted create={props.create} />
        </WizardStep>
        <WizardStep
          name={t('caches.create.edit-config.nav-title')}
          id={2}
          footer={<CustomStepsFooter />}
          isHidden={!configuration.start.valid || configuration.start.createType == 'configure'}
        >
          <CacheConfigEditor
            cacheEditor={cacheEditor}
            cacheEditorModifier={setCacheEditor}
            setReviewConfig={setReviewConfig}
          />
        </WizardStep>
        <WizardStep
          name={'Configure the cache'}
          isHidden={!configuration.start.valid || configuration.start.createType == 'edit'}
          id={3}
          footer={<CustomStepsFooter />}
          steps={[
            <WizardStep
              name={t('caches.create.configurations.basic.nav-title')}
              id={4}
              footer={<CustomStepsFooter />}
              key={'basics'}
            >
              <BasicCacheConfigConfigurator />
            </WizardStep>,
            <WizardStep
              name={t('caches.create.configurations.feature.nav-title', { brandname: brandname })}
              id={5}
              footer={<CustomStepsFooter />}
              isDisabled={!configuration.basic.valid}
              key={'features'}
            >
              <FeaturesSelector />
            </WizardStep>,
            <WizardStep
              name={t('caches.create.configurations.advanced-options.nav-title')}
              id={6}
              footer={<CustomStepsFooter />}
              isDisabled={!configuration.basic.valid || !validFeatures(configuration)}
              key={'advanced'}
            >
              <AdvancedOptionsConfigurator cacheManager={props.cacheManager} />
            </WizardStep>
          ]}
        />

        <WizardStep
          name={t('caches.create.review.nav-title')}
          footer={<CustomStepsFooter />}
          isDisabled={!configuration.basic.valid || !validFeatures(configuration) || !configuration.advanced.valid}
          isHidden={!configuration.start.valid || configuration.start.createType == 'edit'}
          id={7}
        >
          <ReviewCacheConfig
            setReviewConfig={setReviewConfig}
            setContentType={setContentType}
          />
        </WizardStep>
      </Wizard>
      <DownloadCacheModal
        cacheName={configuration.start.cacheName}
        configuration={reviewConfig}
        isModalOpen={isDownloadModalOpen}
        closeModal={() => setIsDownloadModalOpen(false)}
        contentType={contentType}
      />
    </PageSection>
  );
};

export { CreateCacheWizard };
