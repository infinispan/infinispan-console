import React, {useEffect, useState} from 'react';
import {
  Button,
  ButtonVariant,
  Select,
  SelectOption,
  SelectVariant,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  Wizard,
  WizardContextConsumer,
  WizardFooter
} from '@patternfly/react-core';
import {useHistory} from 'react-router';
import {useApiAlert} from '@app/utils/useApiAlert';
import {CacheConfigUtils} from '@services/cacheConfigUtils';
import {useTranslation} from 'react-i18next';
import {ConfigDownloadType} from '@services/infinispanRefData';
import CacheConfigEditor from '@app/Caches/Create/CacheConfigEditor';
import AdvancedOptionsConfigurator from '@app/Caches/Create/AdvancedOptionsConfigurator';
import {useStateCallback} from '@app/services/stateCallbackHook';
import ReviewCacheConfig from '@app/Caches/Create/ReviewCacheConfig';
import CreateCacheGettingStarted from '@app/Caches/Create/CreateCacheGettingStarted';
import BasicCacheConfigConfigurator from '@app/Caches/Create/BasicCacheConfigConfigurator';
import FeaturesSelector from '@app/Caches/Create/FeaturesSelector';
import {ConsoleServices} from '@services/ConsoleServices';
import {DownloadIcon} from '@patternfly/react-icons';
import {useCreateCache} from '@app/services/createCacheHook';
import {validFeatures} from '@app/utils/featuresValidation';

const CacheEditorInitialState: CacheEditorStep = {
  editorConfig: '',
  configs: [],
  validConfig: 'default',
  errorConfig: '',
  selectedConfig: '',
  configExpanded: false,
  editorExpanded: false
};

const CreateCacheWizard = (props: { cacheManager: CacheManager, create: boolean }) => {
  const { addAlert } = useApiAlert();
  const { configuration } = useCreateCache();

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

  // Download type
  const [downloadType, setDownloadType] = useState(ConfigDownloadType.JSON);
  const [downloadURL, setDownloadURL] = useState('data:text/json;charset=utf-8,' + encodeURIComponent(reviewConfig));
  const [isOpenDownloadOption, setIsOpenDownloadOption] = useState(false);

  const history = useHistory();

  const closeWizard = () => {
    history.push('/');
  };

  useEffect(() => {
    if (downloadType === ConfigDownloadType.JSON) {
      setDownloadURL('data:text/json;charset=utf-8,' + encodeURIComponent(reviewConfig));
    } else if (downloadType === ConfigDownloadType.YAML) {
      ConsoleServices.caches()
        .convertConfigFormat(configuration.start.cacheName, reviewConfig, 'yaml')
        .then((r) => {
          if (r.success) {
            setDownloadURL('data:text/yaml;charset=utf-8,' + encodeURIComponent(r.data ? r.data : ''));
          }
        });
    } else if (downloadType === ConfigDownloadType.XML) {
      ConsoleServices.caches()
        .convertConfigFormat(configuration.start.cacheName, reviewConfig, 'xml')
        .then((r) => {
          if (r.success) {
            setDownloadURL('data:text/xml;charset=utf-8,' + encodeURIComponent(r.data ? r.data : ''));
          }
        });
    }
  }, [downloadType, reviewConfig]);

  const getNextStep = (event, activeStep, callback) => {
    event.stopPropagation();
    if (activeStep.id === 1) {
      if (configuration.start.createType === 'configure') {
        setStateObj(
          {
            ...stateObj,
            showCacheEditor: false,
            showConfigurationSteps: true,
          },
          () => callback()
        );
      } else {
        setStateObj(
          {
            ...stateObj,
            showCacheEditor: true,
            showConfigurationSteps: false,
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
    setStateObj(
      {
        ...stateObj,
        showCacheEditor: false,
        showConfigurationSteps: false,
      },
      () => callback()
    );
  };

  // Steps
  const stepGettingStarted = {
    id: 1,
    name: t('caches.create.getting-started.nav-title'),
    component: <CreateCacheGettingStarted create={props.create}/>,
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
    component: <ReviewCacheConfig setReviewConfig={setReviewConfig} />,
    canJumpTo: validFeatures(configuration)
  };

  const steps = [
    stepGettingStarted,
    ...(stateObj.showConfigurationSteps ? [stepConfigure, stepReview] : []),
    ...(stateObj.showCacheEditor ? [stepCodeEditor] : [])
  ];

  const downloadOptions = () => {
    return Object.keys(ConfigDownloadType).map((key) => <SelectOption key={key} value={ConfigDownloadType[key]} />);
  };

  const onSelectDownloadOption = (event, selection, isPlaceholder) => {
    setDownloadType(selection);
    setIsOpenDownloadOption(false);
  };

  const isCreateButton = (activeStepId: number): boolean => {
    return activeStepId === 2 || activeStepId === 6;
  }

  const isButtonNextOrCreateDisabled = (activeStepId: number): boolean => {
    let activeButton = true;
    switch (activeStepId) {
      case 1:
        activeButton = configuration.start.valid;
        break;
      case 2:
        if (!props.create) activeButton = false;
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
        if (!props.create) activeButton = false;
        break;
      default:
    }

    return !activeButton;
  };

  const nextOrCreateToolbarItem = (activeStep, onNext) => {
    const activeStepId = activeStep.id;

    if (isCreateButton(activeStepId) && isButtonNextOrCreateDisabled(activeStepId)) {
      // The user is not allowed to create a cache, don't display the create button
      return (
        <ToolbarItem>
        </ToolbarItem>
      )
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
          {t('caches.create.back-button-label')}
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

    return (
      <React.Fragment>
        <ToolbarItem variant="separator"></ToolbarItem>
        <ToolbarItem>
          <Select
            direction="up"
            variant={SelectVariant.single}
            aria-label="Select config format"
            onToggle={() => setIsOpenDownloadOption(!isOpenDownloadOption)}
            onSelect={onSelectDownloadOption}
            selections={downloadType}
            isOpen={isOpenDownloadOption}
            placeholderText="Select config format"
          >
            {downloadOptions()}
          </Select>
        </ToolbarItem>
        <ToolbarItem>
          <a href={downloadURL} download={configuration.start.cacheName + `.` + downloadType.toLocaleLowerCase()}>
            <Button variant={ButtonVariant.tertiary} icon={<DownloadIcon />}>
              {t('caches.create.download-button-label', { format: downloadType })}
            </Button>
          </a>
        </ToolbarItem>
      </React.Fragment>
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
                  {backToolbarItem(activeStep, onBack)}
                  {cancelToolbarItem(onClose)}
                  {downloadToolbarItem(activeStep)}
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
            configuration.start.cacheName
          );

    createCacheCall
      .then((actionResponse) => {
        if (actionResponse.success) {
          history.push('/');
        }
        return actionResponse;
      })
      .then((actionResponse) => addAlert(actionResponse));
  };

  const title = 'Create Cache';

  return (
    <Wizard
      navAriaLabel={`${title} steps`}
      mainAriaLabel={`${title} content`}
      onClose={closeWizard}
      onSave={onSave}
      steps={steps}
      footer={CustomFooter}
    />
  );
};

export { CreateCacheWizard };
