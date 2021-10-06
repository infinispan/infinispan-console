import * as React from 'react';
import {useEffect, useState} from 'react';

import {
  ActionGroup, Alert, AlertActionLink, AlertVariant,
  Button,
  Card,
  CardBody,
  ExpandableSection,
  Form,
  FormGroup,
  PageSection,
  PageSectionVariants,
  Select,
  SelectOption,
  SelectVariant, Spinner,
  Text,
  TextArea,
  TextContent,
  TextInput,
  TextVariants,
  Toolbar,
  ToolbarContent,
} from '@patternfly/react-core';
import {CubeIcon} from '@patternfly/react-icons';
import {Link} from 'react-router-dom';
import displayUtils from '@services/displayUtils';
import {useHistory} from 'react-router';
import {useApiAlert} from '@app/utils/useApiAlert';
import {DataContainerBreadcrumb} from '@app/Common/DataContainerBreadcrumb';
import {ConsoleServices} from "@services/ConsoleServices";
import {CacheConfigUtils} from "@services/cacheConfigUtils";
import { useTranslation } from 'react-i18next';

const CreateCache: React.FunctionComponent<any> = (props) => {
  const { addAlert } = useApiAlert();
  const cmName = props.computedMatch.params.cmName;
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [cacheName, setCacheName] = useState('');
  const [validName, setValidName] = useState<'success' | 'error' | 'default'>(
    'default'
  );
  const sampleConfig = '{\n' +
    '  "distributed-cache": {\n' +
    '    "mode": "SYNC",\n' +
    '    "encoding": {\n' +
    '      "media-type": "application/x-protostream"\n' +
    '    },\n' +
    '    "statistics": true\n' +
    '  }\n' +
    '}';

  const [config, setConfig] = useState(sampleConfig);
  const [configs, setConfigs] = useState<OptionSelect[]>([]);
  const [expandedSelect, setExpandedSelect] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<string>('');
  const [selectedConfigDisabled, setSelectedConfigDisabled] = useState(false);
  const [configExpanded, setConfigExpanded] = useState(false);
  const [validConfig, setValidConfig] = useState<
    'success' | 'error' | 'default'
  >('default');
  const [errorConfig, setErrorConfig] = useState('');
  const { t } = useTranslation();
  const brandname = t('brandname.brandname');
  const configurationDocs = t('brandname.configuration-docs-link');

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
      .finally(() => setLoading(false));
  }, []);

  const onToggleConfigPanel = () => {
    const expanded = !configExpanded;
    setConfigExpanded(expanded);
    setSelectedConfigDisabled(expanded);
    setSelectedConfig('');
  };

  const handleChangeName = (name) => {
    setCacheName(name);
  };

  const handleChangeConfig = (config) => {
    setConfig(config);
    setValidConfig('success');
  };

  const onToggleTemplateName = (isExpanded) => {
    setExpandedSelect(isExpanded);
  };

  const clearSelection = () => {
    setSelectedConfig('');
    setExpandedSelect(false);
  };

  const onSelectTemplate = (event, selection, isPlaceholder) => {
    if (isPlaceholder) clearSelection();
    else {
      setSelectedConfig(selection);
      setExpandedSelect(false);
    }
  };

  const createCache = () => {
    setErrorConfig('');
    const name = cacheName.trim();
    // Validate Name
    let isValidName: 'success' | 'error' =
      name.length > 0 ? 'success' : 'error';
    setValidName(isValidName);

    // Validate the config
    let isValidConfig: 'success' | 'error';
    let configValidation;
    if (selectedConfig != '') {
      // User has chosen a template
      isValidConfig = 'success';
    } else {
      if (configs.length == 0 || configExpanded) {
        // there are no  templates or the expanded area is opened, we validate the text area content
        configValidation = CacheConfigUtils.validateConfig(config);
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
      createCacheCall = ConsoleServices.caches().createCacheWithConfiguration(name, config, configValidation.value);
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

  const titleId = 'plain-typeahead-select-id';
  let title = 'Data container is empty.';
  if (cmName !== undefined) {
    title = displayUtils.capitalize(cmName);
  }
  const displayCacheConfigEditor = () => {
    return (
      <FormGroup
        label={t('caches.create.configuration')}
        fieldId="cache-config"
        validated={validConfig}
        helperText={t('caches.create.configuration-help')}
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
        <Alert isInline title={t('caches.create.configuration-info')}
               variant={AlertVariant.info}
               actionLinks={
                 <AlertActionLink onClick={() => window.open(configurationDocs, "_blank")}>
                   {t('caches.create.cache-configuration-docs')}</AlertActionLink>
               }
        />
      </FormGroup>
    )
  }

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
          validated={validConfig}
          helperTextInvalid={errorConfig}
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
            validated={validConfig}
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
    )
  }

  const displayPageContent = () => {
    if (loading) {
      return (
        <Spinner size={'lg'}/>
      )
    }

    return (
      <Form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <FormGroup
          label={t('caches.create.cache-name')}
          isRequired
          fieldId="cache-name"
          helperText={t('caches.create.cache-name-help')}
          validated={validName}
          helperTextInvalid={t('caches.create.cache-name-help-invalid')}
        >
          <TextInput
            isRequired
            type="text"
            id="cache-name"
            name="cache-name"
            aria-describedby="cache-name-helper"
            value={cacheName}
            onChange={handleChangeName}
            validated={validName}
          />
        </FormGroup>
        {handleTemplates()}
        <ActionGroup>
          <Button id="create-button" variant="primary" onClick={createCache}>
            {t('caches.create.create-button-label')}
          </Button>
          <Link to="/">
            <Button id="back-button" variant="secondary" target="_blank">
              {t('caches.create.back-button-label')}
            </Button>
          </Link>
        </ActionGroup>
      </Form>
    );
  }

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <DataContainerBreadcrumb currentPage="Create a cache" />
        <Toolbar id="create-cache-header">
          <ToolbarContent style={{ paddingLeft: 0 }}>
            <TextContent>
              <Text component={TextVariants.h1}>{t('caches.create.page-title', {"cmName" : title})}</Text>
            </TextContent>
          </ToolbarContent>
        </Toolbar>
      </PageSection>
      <PageSection>
        <Card>
          <CardBody>
            {displayPageContent()}
          </CardBody>
        </Card>
      </PageSection>
    </React.Fragment>
  );
};
export { CreateCache };
