import React, { useEffect, useState } from 'react';
import { Button, Wizard, WizardContextConsumer, WizardFooter, } from '@patternfly/react-core';
import { useHistory } from 'react-router';
import { useApiAlert } from '@app/utils/useApiAlert';
import { CacheConfigUtils } from '@services/cacheConfigUtils';
import { useTranslation } from 'react-i18next';
import { CacheType, EncodingType, IsolationLevel, StorageType, CacheMode } from "@services/infinispanRefData";
import GettingStarted from './GettingStarted';
import CacheEditor from './CacheEditor';
import ConfigurationBasic from './ConfigurationBasic';
import AdvancedOptions from './AdvancedOptions';
import { useStateCallback } from '@app/services/stateCallbackHook';
import Review from './Review';
import { ConsoleServices } from '@services/ConsoleServices';

export interface GettingStartedState {
    cacheName: '';
    createType: 'configure' | 'edit',
}

const GettingStartedInitialState: GettingStartedState = {
    cacheName: '',
    createType: 'configure',
}

const CacheEditorInitialState: CacheEditorStep = {
    editorConfig: '',
    configs: [],
    validConfig: 'default',
    errorConfig: '',
    selectedConfig: '',
    configExpanded: false,
    editorExpanded: false
}

const BasicConfigurationInitialState: BasicConfigurationStep = {
    topology: CacheType.Distributed,
    mode: CacheMode.ASYNC,
    numberOfOwners: 1,
    encoding: EncodingType.Protobuf,
    statistics: true
}

const AdvancedOptionsInitialState: AdvancedConfigurationStep = {
    storage: StorageType.HEAP,
    concurrencyLevel: 0,
    isolationLevel: IsolationLevel.READ_COMMITTED,
    lockAcquisitionTimeout: 0,
    striping: true
}

const CreateCacheWizard = (props) => {
    const { addAlert } = useApiAlert();
    const { t } = useTranslation();

    // State for wizard steps
    const [stateObj, setStateObj] = useStateCallback({
        showCacheEditor: false,
        showConfigurationStep: false,
        showReviewStep: false
    });

    const [isFormValid, setIsFormValid] = useState(false);
    const [stepIdReached, setStepIdReached] = useState(1);

    // State for the form (Getting Started)
    const [gettingStarted, setGettingStarted] = useState<GettingStartedState>(GettingStartedInitialState);

    // State for the form (Edit Code)
    const [cacheEditor, setCacheEditor] = useState<CacheEditorStep>(CacheEditorInitialState);

    // State for the form (Configuration Basic)
    const [basicConfiguration, setBasicConfiguration] = useState<BasicConfigurationStep>(BasicConfigurationInitialState);

    // State for the form (Advanced Options)
    const [advancedOptions, setAdvancedOptions] = useState<AdvancedConfigurationStep>(AdvancedOptionsInitialState);

    const [configuration, setConfiguration] = useState<CacheConfiguration>({ basic: basicConfiguration, advanced: advancedOptions })

    const history = useHistory();

    const title = 'Create Cache';

    // TODO: quick stuff. I think we can handle all with the same state but we can do that in the end a refactoring.
    useEffect(() => {
        setConfiguration({ basic: basicConfiguration, advanced: advancedOptions });
    }, [basicConfiguration, advancedOptions]);

    const closeWizard = () => {
        history.push('/');
    };

    const getNextStep = (event, activeStep, callback) => {
        event.stopPropagation();
        if (activeStep.id === 1) {
            if (gettingStarted.createType === "configure") {
                setStateObj(
                    {
                        ...stateObj,
                        showCacheEditor: false,
                        showConfigurationStep: true,
                        showReviewStep: true
                    },
                    () => callback()
                );
            } else {
                setStateObj(
                    {
                        ...stateObj,
                        showCacheEditor: true,
                        showConfigurationStep: false,
                        showReviewStep: false
                    },
                    () => callback()
                );
            }
        }
        else if (activeStep.id === 2) {
            onSave();
        }
        else {
            callback();
        }
    };

    const getPreviousStep = (event, activeStep, callback) => {
        event.stopPropagation();
        if (gettingStarted.createType === "configure") {
            setStateObj(
                {
                    ...stateObj,
                    showCacheEditor: false
                },
                () => callback()
            );
        } else if (gettingStarted.createType === "edit") {
            setStateObj(
                {
                    ...stateObj,
                    showConfigurationStep: false,
                    showReviewStep: false
                },
                () => callback()
            );
        } else {
            callback();
        }
    };

    // Steps
    const stepGettingStarted = {
        id: 1,
        name: t('caches.create.getting-started.nav-title'),
        component: (
            <GettingStarted
                gettingStarted={gettingStarted}
                gettingStartedModifier={setGettingStarted}
                isFormValid={isFormValid}
                handleIsFormValid={setIsFormValid}
            />
        ),
        enableNext: isFormValid,
        canJumpTo: stepIdReached >= 1,
        hideBackButton: true,
    };

    const stepCodeEditor = {
        id: 2,
        name: t('caches.create.edit-config.nav-title'),
        component: <CacheEditor cacheEditor={cacheEditor} cacheEditorModifier={setCacheEditor} cmName={props.cmName} />,
    };

    const stepConfigure = {
        name: t('caches.create.configurations.nav-title'),
        steps: [
            {
                id: 3,
                name: t('caches.create.configurations.basic.nav-title'),
                component: (<ConfigurationBasic basicConfiguration={basicConfiguration} basicConfigurationModifier={setBasicConfiguration} />)
            },
            { id: 5, name: t('caches.create.configurations.advanced-options.nav-title'), component: <AdvancedOptions advancedOptions={advancedOptions} advancedOptionsModifier={setAdvancedOptions} /> },
        ]
    };

    const stepReview = {
        id: 6,
        name: t('caches.create.review.nav-title'),
        component: <Review cacheName={gettingStarted.cacheName} cacheConfiguration={configuration} />
    }

    const steps = [stepGettingStarted,
        ...(stateObj.showConfigurationStep ? [stepConfigure] : []),
        ...(stateObj.showCacheEditor ? [stepCodeEditor] : []),
        ...(stateObj.showReviewStep ? [stepReview] : [])
    ];

    const CustomFooter = (
        <WizardFooter>
            <WizardContextConsumer>
                {({ activeStep, goToStepByName, goToStepById, onNext, onBack, onClose }) => {
                    return (
                        <>
                            <Button
                                variant="primary"
                                type="submit"
                                onClick={(event) => getNextStep(event, activeStep, onNext)}
                                isDisabled={!isFormValid}
                            >
                                {activeStep.id === 2 || activeStep.id === 6 ? t('caches.create.create-button-label') : t('caches.create.next-button-label')}
                            </Button>
                            {activeStep.id !== 1 && (
                                <Button
                                    variant="secondary"
                                    onClick={(event) => getPreviousStep(event, activeStep, onBack)}
                                >
                                    {t('caches.create.back-button-label')}
                                </Button>)}
                            <Button variant="link" onClick={onClose}>
                                {t('caches.create.cancel-button-label')}
                            </Button>
                        </>
                    )
                }}
            </WizardContextConsumer>
        </WizardFooter>
    );

    const onSave = () => {
        const createCacheCall =
            gettingStarted.createType === 'edit' ?  // Check wizard option
                CacheConfigUtils.createCacheWithEditorStep(cacheEditor, gettingStarted.cacheName) :
                CacheConfigUtils.createCacheWithWizardStep(configuration, gettingStarted.cacheName)

        createCacheCall
            .then((actionResponse) => {
                if (actionResponse.success) {
                    history.push('/');
                }
                return actionResponse;
            })
            .then((actionResponse) => addAlert(actionResponse));
    }

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
