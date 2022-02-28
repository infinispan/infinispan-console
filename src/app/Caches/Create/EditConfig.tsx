import React, { useEffect, useState } from 'react';

import {
    Form,
    FormGroup,
    Text,
    TextContent,
    TextArea,
    AlertVariant,
    TextVariants,
    Alert,
    AlertActionLink,
    Select,
    SelectOption,
    SelectVariant,
    ExpandableSection,

} from '@patternfly/react-core';
import { CubeIcon } from '@patternfly/react-icons';

import { useTranslation } from 'react-i18next';

const EditCache = ({ formConfig, configs, validConfig, errorConfig, configExpanded, handleConfigExpanded, handleSelectedConfig, handleFormConfig, selectedConfig, handleValidConfig }) => {
    const { t } = useTranslation();

    const sampleConfig =
        '{\n' +
        '  "distributed-cache": {\n' +
        '    "mode": "SYNC",\n' +
        '    "encoding": {\n' +
        '      "media-type": "application/x-protostream"\n' +
        '    },\n' +
        '    "statistics": true\n' +
        '  }\n' +
        '}';

    const [config, setConfig] = useState(formConfig || sampleConfig);
    const [expandedSelect, setExpandedSelect] = useState(false)
    const [selectedConfigDisabled, setSelectedConfigDisabled] = useState(false);
    const [validConfigSelected, setValidConfigSelected] = useState<
        'success' | 'error' | 'default'
    >('default');
    const configurationDocs = t('brandname.configuration-docs-link');

    useEffect(() => {
        if (formConfig && formConfig.length > 0) {
            handleFormConfig(formConfig);
        }
        else {
            handleFormConfig(sampleConfig);
            handleValidConfig('success')
        }
        setSelectedConfigDisabled(configExpanded)
    }, []);

    const handleChangeConfig = (config) => {
        setConfig(config);
        handleFormConfig(config);
        handleValidConfig('success')
    };

    const onToggleTemplateName = (isExpanded) => {
        setExpandedSelect(isExpanded);
    };

    const onSelectTemplate = (event, selection, isPlaceholder) => {
        if (isPlaceholder) clearSelection();
        else {
            handleSelectedConfig(selection);
            setExpandedSelect(false);
            setValidConfigSelected('success');
        }
    };

    const clearSelection = () => {
        handleSelectedConfig('');
        setExpandedSelect(false);
    };

    const onToggleConfigPanel = () => {
        const expanded = !configExpanded;
        handleConfigExpanded(expanded);
        setSelectedConfigDisabled(expanded);
        handleSelectedConfig('')
    };

    const displayCacheConfigEditor = () => {
        return (
            <Form>
                <FormGroup
                    label={t('caches.create.configuration')}
                    fieldId="cache-config"
                    validated={validConfig}
                    helperTextInvalid={t('caches.create.configuration-help-invalid')}
                    isRequired={configs.length == 0}
                >
                    <TextArea
                        isRequired
                        value={config}
                        onChange={handleChangeConfig}
                        name="cache-config"
                        id="cache-config"
                        validated={validConfig}
                        rows={10}
                    />
                    <Alert
                        isInline
                        title={t('caches.create.configuration-info')}
                        variant={AlertVariant.info}
                        actionLinks={
                            <AlertActionLink
                                onClick={() => window.open(configurationDocs, '_blank')}
                            >
                                {t('caches.create.cache-configuration-docs')}
                            </AlertActionLink>
                        }
                    />
                </FormGroup>
            </Form>
        );
    };

    const titleId = 'plain-typeahead-select-id';

    const handleTemplates = () => {
        if (configs.length == 0) {
            return displayCacheConfigEditor();
        }

        return (
            <React.Fragment>
                <FormGroup
                    fieldId="cache-config-name"
                    label={t('caches.create.templates')}
                    helperText={t('caches.create.templates-help')}
                    validated={validConfigSelected}
                    helperTextInvalid={t('caches.create.template-help-invalid')}
                >
                    <Select
                        data-testid="template-selector"
                        toggleIcon={<CubeIcon />}
                        variant={SelectVariant.typeahead}
                        aria-label={t('caches.create.templates')}
                        onToggle={onToggleTemplateName}
                        onSelect={onSelectTemplate}
                        // @ts-ignore
                        selections={selectedConfig}
                        isOpen={expandedSelect}
                        isDisabled={selectedConfigDisabled}
                        aria-labelledby={titleId}
                        placeholderText={t('caches.create.templates-placeholder')}
                        onClear={clearSelection}
                        validated={validConfigSelected}
                    >
                        {configs.map((option, index) => (
                            <SelectOption
                                isDisabled={option.disabled}
                                key={index}
                                value={option.value}
                                isPlaceholder={option.isPlaceholder}
                            />
                        ))}
                    </Select>
                </FormGroup>
                <ExpandableSection
                    toggleText={t('caches.create.configuration-provide')}
                    isExpanded={configExpanded}
                    onToggle={onToggleConfigPanel}
                    role={'display-editor'}
                >
                    {displayCacheConfigEditor()}
                </ExpandableSection>
            </React.Fragment>
        );
    };

    return (
        <React.Fragment>
            <TextContent>
                <Text component={TextVariants.h3}> {t('caches.create.edit-config.page-title')}</Text>
            </TextContent>
            <TextContent style={{ padding: "2rem" }}>
                <Text component={TextVariants.p}> {t('caches.create.configuration-help')}</Text>
            </TextContent>
            <Form
            >
                {handleTemplates()}
            </Form>
        </React.Fragment>
    );
};

export default EditCache;
