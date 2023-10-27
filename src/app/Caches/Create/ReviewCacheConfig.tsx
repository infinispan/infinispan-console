import React, { useContext, useEffect, useState } from 'react';
import { Flex, Form, FormGroup, Text, TextContent, TextVariants } from '@patternfly/react-core';
import { CodeEditor } from '@patternfly/react-code-editor';
import { useTranslation } from 'react-i18next';
import { CacheConfigUtils } from '@services/cacheConfigUtils';
import { useCreateCache } from '@app/services/createCacheHook';
import { ThemeContext } from '@app/providers/ThemeProvider';

const ReviewCacheConfig = (props: { setReviewConfig: (string) => void }) => {
  const { configuration } = useCreateCache();
  const { t } = useTranslation();
  const [config, setConfig] = useState(CacheConfigUtils.createCacheConfigFromData(configuration));
  const {theme} = useContext(ThemeContext);

  useEffect(() => {
    const jsonFormatConfig = CacheConfigUtils.createCacheConfigFromData(configuration);
    setConfig(jsonFormatConfig);
    props.setReviewConfig(jsonFormatConfig);
  }, []);

  const onChangeConfig = (editedConfig) => {
    props.setReviewConfig(editedConfig);
    setConfig(config);
  };

  const displayCacheConfigEditor = () => {
    return (
      <FormGroup fieldId="cache-config">
        <CodeEditor
          onChange={onChangeConfig}
          isLineNumbersVisible
          code={config}
          height="sizeToFit"
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

      {displayCacheConfigEditor()}
    </Form>
  );
};

export default ReviewCacheConfig;
