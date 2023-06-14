import React from 'react';
import { useState, useEffect } from 'react';
import {
  Alert,
  AlertVariant,
  ButtonVariant,
  CodeBlock,
  CodeBlockAction,
  CodeBlockCode,
  ClipboardCopyButton,
  Radio,
  Modal,
  ModalVariant,
  Button,
  Form,
  FormGroup
} from '@patternfly/react-core';
import { ConfigDownloadType } from '@services/infinispanRefData';
import { useTranslation } from 'react-i18next';
import { DownloadIcon } from '@patternfly/react-icons';
import { ConsoleServices } from '@services/ConsoleServices';
import { formatXml } from '@app/utils/dataSerializerUtils';

const DownloadCacheModal = (props: {
  cacheName: string;
  configuration: string;
  isModalOpen: boolean;
  closeModal: () => void;
}) => {
  const { t } = useTranslation();

  const [downloadLanguage, setDownloadLanguage] = useState(ConfigDownloadType.JSON);
  const [copied, setCopied] = useState(false);
  const [code, setCode] = useState('');
  const [jsonConfig, setJsonConfig] = useState(props.configuration);
  const [yamlConfig, setYamlConfig] = useState('');
  const [xmlConfig, setXmlConfig] = useState('');
  const [error, setError] = useState('');
  const [downloadURL, setDownloadURL] = useState(
    'data:text/json;charset=utf-8,' + encodeURIComponent(props.configuration)
  );

  useEffect(() => {
    downloadLanguage === ConfigDownloadType.JSON
      ? setCode(jsonConfig)
      : downloadLanguage === ConfigDownloadType.YAML
      ? setCode(yamlConfig)
      : setCode(xmlConfig);
  }, [jsonConfig, yamlConfig, xmlConfig, downloadLanguage]);

  useEffect(() => {
    if (props.configuration && props.isModalOpen) {
      // Convert the config to all formats
      // Also to check if the config is valid
      ConsoleServices.caches()
        .convertConfigFormat(props.cacheName, props.configuration, 'json')
        .then((r) => {
          if (r.success) {
            setJsonConfig(JSON.stringify(JSON.parse(r.data), null, 2));
            setError('');
          } else {
            setError(r.message);
          }
        });

      ConsoleServices.caches()
        .convertConfigFormat(props.cacheName, props.configuration, 'yaml')
        .then((r) => {
          if (r.success) {
            setYamlConfig(r.data);
            setError('');
          } else {
            setError(r.message);
          }
        });

      ConsoleServices.caches()
        .convertConfigFormat(props.cacheName, props.configuration, 'xml')
        .then((r) => {
          if (r.success) {
            setXmlConfig(formatXml(r.data));
            setError('');
          } else {
            setError(r.message);
          }
        });

      setDownloadURL('data:text/json;charset=utf-8,' + encodeURIComponent(props.configuration));
    }
  }, [props.configuration, props.isModalOpen]);

  useEffect(() => {
    if (downloadLanguage === ConfigDownloadType.JSON) {
      setDownloadURL('data:text/json;charset=utf-8,' + encodeURIComponent(jsonConfig));
    } else if (downloadLanguage === ConfigDownloadType.YAML) {
      setDownloadURL('data:text/yaml;charset=utf-8,' + encodeURIComponent(yamlConfig));
    } else if (downloadLanguage === ConfigDownloadType.XML) {
      setDownloadURL('data:text/yaml;charset=utf-8,' + encodeURIComponent(xmlConfig));
    }
  }, [downloadLanguage, jsonConfig, props.configuration, xmlConfig, yamlConfig]);

  const clipboardCopyFunc = (event, text) => {
    navigator.clipboard.writeText(text.toString());
  };

  const onClick = (event, text) => {
    clipboardCopyFunc(event, text);
    setCopied(true);
  };

  const actions = (
    <CodeBlockAction>
      <ClipboardCopyButton
        id="expandable-copy-button"
        textId="code-content"
        aria-label="Copy to clipboard"
        onClick={(e) => onClick(e, jsonConfig)}
        exitDelay={copied ? 1500 : 600}
        maxWidth="110px"
        variant="plain"
        onTooltipHidden={() => setCopied(false)}
      >
        {copied ? 'Successfully copied to clipboard!' : 'Copy to clipboard'}
      </ClipboardCopyButton>
    </CodeBlockAction>
  );

  const codeBlock = (
    <React.Fragment>
      {error !== '' ? (
        <Alert style={{ marginBottom: '1rem' }} title="Invalid configuration" variant={AlertVariant.danger}>
          {error}
        </Alert>
      ) : (
        <CodeBlock actions={actions}>
          <CodeBlockCode>{code}</CodeBlockCode>
        </CodeBlock>
      )}
    </React.Fragment>
  );

  return (
    <Modal
      variant={ModalVariant.medium}
      title={t('caches.create.review.download-title')}
      description={t('caches.create.review.download-description')}
      isOpen={props.isModalOpen}
      onClose={props.closeModal}
      actions={[
        <Button
          component="a"
          key="download"
          data-cy="downloadButton"
          variant={ButtonVariant.tertiary}
          icon={<DownloadIcon />}
          onClick={props.closeModal}
          isDisabled={error !== ''}
          href={downloadURL}
          download={props.cacheName + `.` + downloadLanguage.toLocaleLowerCase()}
        >
          {t('caches.create.review.download-button')}
        </Button>,
        <Button key="cancel" variant="link" onClick={props.closeModal}>
          {t('caches.create.review.cancel-button')}
        </Button>
      ]}
    >
      <Form isHorizontal id="download-modal-form">
        <FormGroup hasNoPaddingTop isInline label="Code language" fieldId="code-language-radio-field">
          <Radio
            name="language-radio"
            id="JSON"
            onChange={() => {
              setDownloadLanguage(ConfigDownloadType.JSON);
            }}
            isChecked={(downloadLanguage as ConfigDownloadType) == ConfigDownloadType.JSON}
            label={t('caches.create.review.json')}
          />
          <Radio
            name="language-radio"
            id="XML"
            onChange={() => setDownloadLanguage(ConfigDownloadType.XML)}
            isChecked={(downloadLanguage as ConfigDownloadType) == ConfigDownloadType.XML}
            label={t('caches.create.review.xml')}
          />
          <Radio
            name="language-radio"
            id="YAML"
            onChange={() => setDownloadLanguage(ConfigDownloadType.YAML)}
            isChecked={(downloadLanguage as ConfigDownloadType) == ConfigDownloadType.YAML}
            label={t('caches.create.review.yaml')}
          />
        </FormGroup>
        {codeBlock}
      </Form>
    </Modal>
  );
};
export default DownloadCacheModal;
