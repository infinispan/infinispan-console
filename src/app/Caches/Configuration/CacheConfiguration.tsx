import React from 'react';
import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Card,
  CardBody,
  CardHeader,
  ClipboardCopy,
  ClipboardCopyVariant,
  Spinner,
  Tabs,
  Tab,
  TabTitleText
} from '@patternfly/react-core';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { githubGist } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useTranslation } from 'react-i18next';
import { useFetchConfigurationYAML, useFetchConfigurationXML } from '@app/services/configHook';

const CacheConfiguration = (props: { cacheName: string; editable: boolean; config: string }) => {
  const { t } = useTranslation();
  const encodingDocs = t('brandname.encoding-docs-link');

  const yamlConfig = useFetchConfigurationYAML(props.cacheName);
  const xmlConfig = useFetchConfigurationXML(props.cacheName);

  if (!props.config) {
    return <Spinner size={'md'} />;
  }

  const displayHeaderAlert = () => {
    if (props.editable) {
      return '';
    }

    return (
      <CardHeader>
        <Alert
          isInline
          title={t('caches.configuration.no-encoding-warning')}
          variant={AlertVariant.warning}
          actionLinks={
            <AlertActionLink onClick={() => window.open(encodingDocs, '_blank')}>
              {t('caches.configuration.encoding-docs-message')}
            </AlertActionLink>
          }
        />
      </CardHeader>
    );
  };

  const displayConfig = (config: string) => {
    if (!config) {
      return <Spinner size={'sm'} />;
    }

    return (
      <Card>
        {displayHeaderAlert()}
        <CardBody>
          <SyntaxHighlighter wrapLines={false} style={githubGist} useInlineStyles={true} showLineNumbers={true}>
            {config}
          </SyntaxHighlighter>
          <ClipboardCopy isReadOnly isCode variant={ClipboardCopyVariant.inline}>
            {config}
          </ClipboardCopy>
        </CardBody>
      </Card>
    );
  };

  return (
    <Tabs defaultActiveKey={0} style={{ backgroundColor: 'white' }}>
      <Tab eventKey={0} title={<TabTitleText>JSON</TabTitleText>}>
        {displayConfig(props.config)}
      </Tab>
      <Tab eventKey={1} title={<TabTitleText>XML</TabTitleText>}>
        {xmlConfig && displayConfig(xmlConfig.configuration)}
      </Tab>
      <Tab eventKey={2} title={<TabTitleText>YAML</TabTitleText>}>
        {yamlConfig && displayConfig(yamlConfig.configuration)}
      </Tab>
    </Tabs>
  );
};

export { CacheConfiguration };
