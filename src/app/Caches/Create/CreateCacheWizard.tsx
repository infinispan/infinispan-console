import React, { useState } from 'react';
import {
  Button,
  PageSection,
  PageSectionTypes,
  PageSectionVariants,
  Toolbar,
  ToolbarContent,
  ToolbarItem
} from '@patternfly/react-core';
import { Wizard, WizardContextConsumer, WizardFooter } from '@patternfly/react-core/deprecated';
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
import { useSearchParams } from 'react-router-dom';

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
  const [stepIdReached, setStepIdReached] = useState(1);
  const [reviewConfig, setReviewConfig] = useState<string>('');
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const canCreateCache = ConsoleServices.security().hasConsoleACL(ConsoleACL.CREATE, connectedUser);
  const [contentType, setContentType] = useState<'json' | 'yaml' | 'xml'>('json');

  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const closeWizard = () => {
    navigate('/' + searchParams);
  };

  const getNextStep = (event, activeStep, callback) => {
    event.stopPropagation();
    if (activeStep.id === 1) {
      if (configuration.start.createType === 'configure') {
        setStateObj(
          {
            ...stateObj,
            showCacheEditor: false,
            showConfigurationSteps: true
          },
          () => callback()
        );
      } else {
        setStateObj(
          {
            ...stateObj,
            showCacheEditor: true,
            showConfigurationSteps: false
          },
          () => callback()
        );
      }
    } else if (activeStep.id === 2) {
      onSave();
    } else {
      callback();
    }
  };

  const getPreviousStep = (event, activeStep, callback) => {
    event.stopPropagation();
    if (configuration.start.createType === 'configure') {
      setStateObj(
        {
          ...stateObj,
          showCacheEditor: false
        },
        () => callback()
      );
    } else if (configuration.start.createType === 'edit') {
      setStateObj(
        {
          ...stateObj,
          showConfigurationStep: false
        },
        () => callback()
      );
    }
  };

  // Steps
  const stepGettingStarted = {
    id: 1,
    name: t('caches.create.getting-started.nav-title'),
    component: <CreateCacheGettingStarted create={props.create} />,
    enableNext: configuration.start.valid,
    canJumpTo: stepIdReached >= 1,
    hideBackButton: true
  };

  const stepCodeEditor = {
    id: 2,
    name: t('caches.create.edit-config.nav-title'),
    component: (
      <CacheConfigEditor
        cacheEditor={cacheEditor}
        cacheEditorModifier={setCacheEditor}
        cmName={props.cacheManager.name}
        setReviewConfig={setReviewConfig}
      />
    )
  };

  const stepConfigure = {
    name: t('caches.create.configurations.nav-title'),
    steps: [
      {
        id: 3,
        name: t('caches.create.configurations.basic.nav-title'),
        component: <BasicCacheConfigConfigurator />,
        enableNext: configuration.basic.valid
      },
      {
        id: 4,
        name: t('caches.create.configurations.feature.nav-title', { brandname: brandname }),
        component: <FeaturesSelector />,
        enableNext: validFeatures(configuration)
      },
      {
        id: 5,
        name: t('caches.create.configurations.advanced-options.nav-title'),
        component: <AdvancedOptionsConfigurator />,
        enableNext: configuration.advanced.valid,
        canJumpTo: validFeatures(configuration)
      }
    ]
  };

  const stepReview = {
    id: 6,
    name: t('caches.create.review.nav-title'),
    component: (
      <ReviewCacheConfig setReviewConfig={setReviewConfig} setContentType={setContentType} contentType={contentType} />
    ),
    canJumpTo: validFeatures(configuration)
  };

  const steps = [
    stepGettingStarted,
    ...(stateObj.showConfigurationSteps ? [stepConfigure, stepReview] : []),
    ...(stateObj.showCacheEditor ? [stepCodeEditor] : [])
  ];

  const isCreateButton = (activeStepId: number): boolean => {
    return activeStepId === 2 || activeStepId === 6;
  };

  const isButtonNextOrCreateDisabled = (activeStepId: number): boolean => {
    let activeButton = true;
    switch (activeStepId) {
      case 1:
        activeButton = configuration.start.valid;
        break;
      case 2:
        activeButton = props.create && cacheEditor.validConfig === 'success';
        break;
      case 3:
        activeButton = configuration.basic.valid;
        break;
      case 4:
        activeButton = validFeatures(configuration);
        break;
      case 5:
        activeButton = configuration.advanced.valid;
        break;
      case 6:
        activeButton = props.create;
        break;
      default:
    }

    return !activeButton;
  };

  const nextOrCreateToolbarItem = (activeStep, onNext) => {
    const activeStepId = activeStep.id;

    if (isCreateButton(activeStepId) && isButtonNextOrCreateDisabled(activeStepId)) {
      // The user is not allowed to create a cache, don't display the create button
      return;
    }

    const buttonId = isCreateButton(activeStepId) ? 'create-cache' : 'next-step';
    return (
      <ToolbarItem>
        <Button
          id={buttonId}
          name={buttonId}
          variant="primary"
          type="submit"
          onClick={(event) => getNextStep(event, activeStep, onNext)}
          isDisabled={isButtonNextOrCreateDisabled(activeStep.id)}
          data-cy="wizardNextButton"
        >
          {isCreateButton(activeStep.id)
            ? t('caches.create.create-button-label')
            : t('caches.create.next-button-label')}
        </Button>
      </ToolbarItem>
    );
  };

  const backToolbarItem = (activeStep, onBack) => {
    if (activeStep.id === 1) {
      return '';
    }

    return (
      <ToolbarItem>
        <Button
          variant="secondary"
          onClick={(event) => getPreviousStep(event, activeStep, onBack)}
          data-cy="wizardBackButton"
        >
          {t('common.actions.back')}
        </Button>
      </ToolbarItem>
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
    if (activeStep.id !== 2 && activeStep.id !== 6) {
      return '';
    }
    if (activeStep.id === 6 && !configuration.advanced.valid) {
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

  const CustomFooter = (
    <WizardFooter>
      <WizardContextConsumer>
        {({ activeStep, goToStepByName, goToStepById, onNext, onBack, onClose }) => {
          return (
            <>
              <Toolbar id="create-cache-wizard-toolbar">
                <ToolbarContent>
                  {nextOrCreateToolbarItem(activeStep, onNext)}
                  {downloadToolbarItem(activeStep)}
                  {backToolbarItem(activeStep, onBack)}
                  {cancelToolbarItem(onClose)}
                </ToolbarContent>
              </Toolbar>
            </>
          );
        }}
      </WizardContextConsumer>
    </WizardFooter>
  );

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

  const title = 'Create Cache';

  return (
    <PageSection type={PageSectionTypes.wizard} variant={PageSectionVariants.light}>
      <Wizard
        navAriaLabel={`${title} steps`}
        mainAriaLabel={`${title} content`}
        onClose={closeWizard}
        onSave={onSave}
        steps={steps}
        footer={CustomFooter}
      />
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
