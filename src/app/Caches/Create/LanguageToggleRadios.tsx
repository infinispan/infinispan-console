import React from 'react';
import { FormGroup, Radio } from '@patternfly/react-core';
import { ConfigDownloadType } from '@services/infinispanRefData';
import { useTranslation } from 'react-i18next';

const LanguageToggleRadios = (props: { language: ConfigDownloadType; setLanguage: (ConfigDownloadType) => void }) => {
  const { t } = useTranslation();

  return (
    <FormGroup hasNoPaddingTop isInline label="Code language" fieldId="code-language-radio-field">
      <Radio
        name="language-radio"
        id="JSON"
        onChange={() => {
          props.setLanguage(ConfigDownloadType.JSON);
        }}
        isChecked={(props.language as ConfigDownloadType) == ConfigDownloadType.JSON}
        label={t('caches.create.review.json')}
      />
      <Radio
        name="language-radio"
        id="XML"
        onChange={() => {
          props.setLanguage(ConfigDownloadType.XML);
        }}
        isChecked={(props.language as ConfigDownloadType) == ConfigDownloadType.XML}
        label={t('caches.create.review.xml')}
      />
      <Radio
        name="language-radio"
        id="YAML"
        onChange={() => {
          props.setLanguage(ConfigDownloadType.YAML);
        }}
        isChecked={(props.language as ConfigDownloadType) == ConfigDownloadType.YAML}
        label={t('caches.create.review.yaml')}
      />
    </FormGroup>
  );
};

export default LanguageToggleRadios;
