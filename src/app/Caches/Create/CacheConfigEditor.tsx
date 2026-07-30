import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Button,
  ExpandableSection,
  Form,
  FormGroup,
  FormHelperText,
  FormSection,
  HelperText,
  HelperTextItem,
  Spinner,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, UploadIcon } from '@patternfly/react-icons';
import {
  CodeEditor,
  CodeEditorControl,
  Language,
} from '@patternfly/react-code-editor';
import { useTranslation } from 'react-i18next';
import { ConsoleServices } from '@services/ConsoleServices';
import { CacheConfigUtils } from '@services/cacheConfigUtils';
import { useApiAlert } from '@app/utils/useApiAlert';
import { DARK, ThemeContext } from '@app/providers/ThemeProvider';
import { SelectSingleTypehead } from '@app/Common/SelectSingleTypehead';
import { selectOptionPropsFromArray } from '@utils/selectOptionPropsCreator';

const CacheConfigEditor = (props: {
  cacheEditor: CacheEditorStep;
  cacheEditorModifier: (CacheEditorStep) => void;
  setReviewConfig: (string) => void;
  setContentType: (contentType: 'json' | 'yaml' | 'xml') => void;
}) => {
  const { theme } = useContext(ThemeContext);
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

  const { addAlert } = useApiAlert();
  const { t } = useTranslation();
  const configurationDocs = t('brandname.configuration-docs-link');
  const [selectedConfigDisabled, setSelectedConfigDisabled] = useState(false);

  const [editorConfig, setEditorConfig] = useState(
    props.cacheEditor.editorConfig || sampleConfig,
  );
  const [configs, setConfigs] = useState(props.cacheEditor.configs);
  const [validConfig, setValidConfig] = useState(props.cacheEditor.validConfig);
  const [errorConfig, setErrorConfig] = useState(props.cacheEditor.errorConfig);
  const [selectedConfig, setSelectedConfig] = useState(
    props.cacheEditor.selectedConfig,
  );
  const [configExpanded, setConfigExpanded] = useState(
    props.cacheEditor.configExpanded,
  );
  const [editorExpanded, setEditorExpanded] = useState(
    props.cacheEditor.editorExpanded,
  );
  const languageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [editorLanguage, setEditorLanguage] = useState<Language>(Language.json);
  const [loading, setLoading] = useState(true);

  const detectLanguage = (content: string): Language | undefined => {
    const trimmed = content.trim();
    if (trimmed.length === 0) {
      return undefined;
    }
    const result = CacheConfigUtils.validateConfig(trimmed);
    if (result.isRight()) {
      switch (result.value) {
        case 'json':
          return Language.json;
        case 'xml':
          return Language.xml;
        case 'yaml':
          return Language.yaml;
      }
    }
    return undefined;
  };

  const updateLanguage = useCallback((content: string) => {
    if (languageTimerRef.current) {
      clearTimeout(languageTimerRef.current);
    }
    languageTimerRef.current = setTimeout(() => {
      const detected = detectLanguage(content);
      if (detected) {
        setEditorLanguage(detected);
        const result = CacheConfigUtils.validateConfig(content.trim());
        if (result.isRight()) {
          props.setContentType(result.value);
        }
      }
    }, 300);
  }, []);

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        handleChangeConfig(content);
      };
      reader.readAsText(file);
      event.target.value = '';
    },
    [],
  );

  useEffect(() => {
    if (loading) {
      ConsoleServices.dataContainer()
        .getCacheConfigurationTemplates()
        .then((eitherTemplates) => {
          if (eitherTemplates.isRight()) {
            const options: TemplateOptionSelect[] = [];
            eitherTemplates.value.forEach((template) => {
              options.push({ value: template.name });
            });
            setConfigs(options);
          } else {
            addAlert(eitherTemplates.value);
          }
        })
        .finally(() => setLoading(false));
    }
    props.cacheEditorModifier({
      editorConfig: editorConfig,
      configs: configs,
      validConfig: validConfig,
      errorConfig: errorConfig,
      selectedConfig: selectedConfig,
      configExpanded: configExpanded,
      editorExpanded: editorExpanded,
    });
    props.setReviewConfig(editorConfig);
  }, [
    editorConfig,
    configs,
    validConfig,
    errorConfig,
    selectedConfig,
    configExpanded,
    editorExpanded,
    loading,
  ]);

  const handleChangeConfig = (value) => {
    props.setReviewConfig(value);
    setEditorConfig(value);
    updateLanguage(value);
    setValidConfig('success');
  };

  const onSelectTemplate = (selection) => {
    setSelectedConfig(selection);
    setValidConfig('success');
  };

  const clearSelection = () => {
    setSelectedConfig('');
    setValidConfig('default');
  };

  const onToggleConfigPanel = () => {
    const expanded = !editorExpanded;
    setEditorExpanded(expanded);
    setSelectedConfigDisabled(expanded);
    setSelectedConfig('');
    expanded ? setValidConfig('success') : setValidConfig('default');
  };

  const displayCacheConfigEditor = () => {
    return (
      <FormGroup
        label={
          <>
            {t('caches.create.edit-config.cache-config')}{' '}
            <Button
              variant="link"
              isInline
              icon={<ExternalLinkAltIcon />}
              iconPosition="end"
              onClick={() => window.open(configurationDocs, '_blank')}
            >
              {t('caches.create.cache-configuration-docs')}
            </Button>
          </>
        }
        fieldId="cache-config"
        isRequired={configs.length == 0}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.xml,.yaml,.yml"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
        <CodeEditor
          isLineNumbersVisible
          isCopyEnabled
          isLanguageLabelVisible
          copyButtonAriaLabel={t('common.actions.copy-to-clipboard')}
          copyButtonToolTipText={t('common.actions.copy-to-clipboard')}
          customControls={
            <CodeEditorControl
              icon={<UploadIcon />}
              aria-label={t('common.actions.upload')}
              tooltipProps={{ content: t('common.actions.upload') }}
              onClick={() => fileInputRef.current?.click()}
            />
          }
          language={editorLanguage}
          code={editorConfig}
          onCodeChange={handleChangeConfig}
          id="cache-config"
          height="300px"
          isDarkTheme={theme === DARK}
          options={{ editContext: false }}
        />
      </FormGroup>
    );
  };

  const templates = () => {
    return selectOptionPropsFromArray(configs.map((c) => c.value));
  };

  const handleTemplates = () => {
    if (loading) {
      return <Spinner size={'xl'} />;
    }

    if (configs.length == 0) {
      return displayCacheConfigEditor();
    }

    return (
      <Form>
        <FormSection
          title={t('caches.create.edit-config.page-title')}
          titleElement="h2"
        >
          <FormGroup
            fieldId="cache-config-name"
            label={t('caches.create.templates')}
          >
            <SelectSingleTypehead
              id="templates"
              onSelect={onSelectTemplate}
              selected={selectedConfig}
              isDisabled={selectedConfigDisabled}
              placeholder={t('caches.create.templates-placeholder')}
              onClear={clearSelection}
              options={templates()}
              style={{ width: '400px' }}
            />
            <FormHelperText>
              <HelperText>
                <HelperTextItem variant={validConfig}>
                  {t('caches.create.templates-help')}
                </HelperTextItem>
              </HelperText>
            </FormHelperText>
          </FormGroup>
          <ExpandableSection
            data-cy="provideConfigArea"
            toggleId={'provideConfigAreaToggle'}
            toggleText={t('caches.create.configuration-provide')}
            isExpanded={editorExpanded}
            onToggle={onToggleConfigPanel}
            role={'display-editor'}
          >
            {displayCacheConfigEditor()}
          </ExpandableSection>
        </FormSection>
      </Form>
    );
  };

  return <React.Fragment>{handleTemplates()}</React.Fragment>;
};

export default CacheConfigEditor;
