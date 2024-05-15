import React, { useContext, useEffect, useState } from 'react';
import { Alert, AlertVariant, Flex, Form, FormGroup, Text, TextContent, TextVariants } from '@patternfly/react-core';
import { CodeEditor } from '@patternfly/react-code-editor';
import { useTranslation } from 'react-i18next';
import { CacheConfigUtils } from '@services/cacheConfigUtils';
import { useCreateCache } from '@app/services/createCacheHook';
import { ThemeContext } from '@app/providers/ThemeProvider';
import LanguageToggleRadios from './LanguageToggleRadios';
import { ConfigDownloadType } from '@services/infinispanRefData';
import { ConsoleServices } from '@services/ConsoleServices';

const ReviewCacheConfig = (props: {
  setReviewConfig: (string) => void;
  setContentType: (string) => void;
  contentType: 'json' | 'yaml' | 'xml';
}) => {
  const { configuration } = useCreateCache();
  const { t } = useTranslation();
  const [config, setConfig] = useState(CacheConfigUtils.createCacheConfigFromData(configuration));
  const { theme } = useContext(ThemeContext);

  const [language, setLanguage] = useState(ConfigDownloadType.JSON);
  const [jsonConfig, setJsonConfig] = useState(CacheConfigUtils.createCacheConfigFromData(configuration));
  const [yamlConfig, setYamlConfig] = useState('');
  const [xmlConfig, setXmlConfig] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    props.setContentType('json');
  }, []);
  useEffect(() => {
    props.setReviewConfig(config);

    if (configuration && config && language.toLowerCase() === props.contentType) {
      // Convert the config to all formats
      // Also to check if the config is valid
      ConsoleServices.caches()
        .convertToAllFormat(configuration.start.cacheName, config, props.contentType)
        .then((r) => {
          if (r.isRight()) {
            setYamlConfig(r.value.yaml);
            setJsonConfig(r.value.json);
            setXmlConfig(r.value.xml);
            setError('');
          } else {
            setError(r.value.message);
          }
        });
    }
  }, [config, configuration]);

  useEffect(() => {
    language === ConfigDownloadType.JSON
      ? setConfig(jsonConfig)
      : language === ConfigDownloadType.YAML
        ? setConfig(yamlConfig)
        : setConfig(xmlConfig);
  }, [jsonConfig, yamlConfig, xmlConfig, language]);

  const onChangeConfig = (editedConfig) => {
    props.setReviewConfig(editedConfig);
    setConfig(editedConfig);
  };

  const displayCacheConfigEditor = () => {
    return (
      <FormGroup fieldId="cache-config">
        {error !== '' && (
          <Alert style={{ marginBottom: '1rem' }} title="Invalid configuration" variant={AlertVariant.danger}>
            {error}
          </Alert>
        )}
        <CodeEditor
          onChange={onChangeConfig}
          isLineNumbersVisible
          code={config}
          height={'400px'}
          isCopyEnabled
          isDarkTheme={theme === 'dark'}
          copyButtonSuccessTooltipText={t('caches.create.review.copied-tooltip')}
          copyButtonToolTipText={t('caches.create.review.copy-tooltip')}
        />
      </FormGroup>
    );
  };

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <TextContent>
        <Text component={TextVariants.h1}>{t('caches.create.review.review-title')}</Text>
        <TextContent>
          <Text component={TextVariants.p}>{t('caches.create.review.review-subtitle')}</Text>
        </TextContent>
        <Flex>
          <Text component={TextVariants.p}>{t('caches.create.review.review-cache-name')}</Text>
          <Text component={TextVariants.h4}>{configuration.start.cacheName}</Text>
        </Flex>
      </TextContent>
      <LanguageToggleRadios language={language} setLanguage={setLanguage} setContentType={props.setContentType} />
      {displayCacheConfigEditor()}
    </Form>
  );
};

export default ReviewCacheConfig;
