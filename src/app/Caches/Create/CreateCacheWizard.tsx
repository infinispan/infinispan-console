import React, { useEffect, useState } from 'react';
import { Wizard } from '@patternfly/react-core';
import GettingStarted from './GettingStarted';
import EditCache from './EditConfig';
import { useHistory } from 'react-router';
import { useApiAlert } from '@app/utils/useApiAlert';
import { ConsoleServices } from '@services/ConsoleServices';
import { CacheConfigUtils } from '@services/cacheConfigUtils';
import { useTranslation } from 'react-i18next';

const CreateCacheWizard = (props) => {
    const { addAlert } = useApiAlert();
    const { t } = useTranslation();
    const cmName = props.cmName;
    const [formCacheName, setFormCacheName] = useState('')
    const [formCreateType, setFormCreateType] = useState<'configure' | 'edit'>('edit');
    const [formConfig, setFormConfig] = useState('')
    const [stepIdReached, setStepIdReached] = useState(1);
    const [isFormValid, setIsFormValid] = useState(false);
    const [configs, setConfigs] = useState<OptionSelect[]>([]);
    const [validConfig, setValidConfig] = useState<
        'success' | 'error' | 'default'
    >('default');
    const [errorConfig, setErrorConfig] = useState('');
    const [selectedConfig, setSelectedConfig] = useState<string>('');
    const [configExpanded, setConfigExpanded] = useState(false);

    const history = useHistory();

    interface OptionSelect {
        value: string;
        disabled?: boolean;
        isPlaceholder?: boolean;
    }

    useEffect(() => {
        ConsoleServices.dataContainer()
            .getCacheConfigurationTemplates(cmName)
            .then((eitherTemplates) => {
                if (eitherTemplates.isRight()) {
                    let options: OptionSelect[] = [];
                    eitherTemplates.value.forEach((template) => {
                        options.push({ value: template.name });
                    });
                    setConfigs(options);
                } else {
                    addAlert(eitherTemplates.value);
                }
            })
    }, []);

    const title = 'Create Cache';

    const onFormChange = (isValid, value) => {
        setIsFormValid(isValid);
        setFormCacheName(value.cacheName);
        setFormCreateType(value.createType);
    };

    const handleConfigExpanded = (expanded) => {
        setConfigExpanded(expanded);
    };

    const handleSelectedConfig = (value) => {
        setSelectedConfig(value);
    };

    const handleFormConfig = (config) => {
        setFormConfig(config);
    };

    const handleValidConfig = (config) => {
        setValidConfig(config);
    };

    const createCache = () => {
        const name = formCacheName.trim();

        // Validate Name
        const isValidName: 'success' | 'error' = name.length > 0 ? 'success' : 'error';

        // Validate the config
        let isValidConfig: 'success' | 'error';
        let configValidation;

        if (selectedConfig != '') {
            // User has chosen a template
            isValidConfig = 'success';
        } else {
            if (configs.length == 0 || configExpanded) {
                // there are no  templates or the expanded area is opened, we validate the text area content
                configValidation = CacheConfigUtils.validateConfig(formConfig);

                isValidConfig = configValidation.isRight() ? 'success' : 'error';
                if (configValidation.isLeft()) {
                    setErrorConfig(configValidation.value);
                }
            } else {
                // There are no templates chosen and the config text area is not visible
                isValidConfig = 'error';
            }
        }

        setValidConfig(isValidConfig);

        if (isValidName == 'error' || isValidConfig == 'error') {
            return;
        }

        let createCacheCall: Promise<ActionResponse>;
        if (selectedConfig != '') {
            createCacheCall = ConsoleServices.caches().createCacheByConfigName(
                name,
                selectedConfig
            );
        } else {
            createCacheCall = ConsoleServices.caches().createCacheWithConfiguration(
                name,
                formConfig,
                configValidation.value
            );
        }
        createCacheCall
            .then((actionResponse) => {
                if (actionResponse.success) {
                    history.push('/');
                }
                return actionResponse;
            })
            .then((actionResponse) => addAlert(actionResponse));
    };

    const allStepsValid = (isValid) => {
        setIsFormValid(isValid);
    };

    const onNext = (step, prevStep) => {
        setStepIdReached(step.id);
        // setIsFormValid(true);
    };

    const onBack = (step, prevStep) => {
        // setIsFormValid(true);
    };

    const onSave = () => {
        createCache();
    }

    const closeWizard = () => {
        history.push('/');
    };

    // Steps
    const stepGettingStarted = {
        id: 1,
        name: t('caches.create.getting-started.nav-title'),
        component: (
            <GettingStarted
                formCacheName={formCacheName}
                formCreateType={formCreateType}
                onFormChange={onFormChange}
                isFormValid={isFormValid}
            />
        ),
        enableNext: isFormValid,
        canJumpTo: stepIdReached >= 1,
        hideBackButton: true,
    };

    const stepEditCode = {
        id: 2,
        name: t('caches.create.edit-config.nav-title'),
        component: <EditCache formConfig={formConfig} configs={configs} selectedConfig={selectedConfig} validConfig={validConfig} errorConfig={errorConfig} configExpanded={configExpanded}
            handleConfigExpanded={handleConfigExpanded} handleSelectedConfig={handleSelectedConfig} handleFormConfig={handleFormConfig} handleValidConfig={handleValidConfig}
        />,
        nextButtonText: 'Create Cache',
    };

    const steps = [stepGettingStarted, stepEditCode];

    return (
        <Wizard
            navAriaLabel={`${title} steps`}
            mainAriaLabel={`${title} content`}
            onNext={onNext}
            onBack={onBack}
            onClose={closeWizard}
            onSave={onSave}
            steps={steps}
        />
    );
};

export { CreateCacheWizard };
