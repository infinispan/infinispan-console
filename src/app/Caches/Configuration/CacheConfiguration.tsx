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
  TabTitleText,
  TabContent,
  TabContentBody
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { useFetchConfigurationYAML, useFetchConfigurationXML } from '@app/services/configHook';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { githubGist } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const CacheConfiguration = (props: { cacheName: string; editable: boolean; config: string }) => {
  const { t } = useTranslation();
  const encodingDocs = t('brandname.encoding-docs-link');

  const yamlConfig = useFetchConfigurationYAML(props.cacheName);
  const xmlConfig = useFetchConfigurationXML(props.cacheName);

  const contentRef1 = React.createRef<HTMLElement>();
  const contentRef2 = React.createRef<HTMLElement>();
  const contentRef3 = React.createRef<HTMLElement>();

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
          <ClipboardCopy isReadOnly isCode variant={ClipboardCopyVariant.inline}>
            {config}
          </ClipboardCopy>
          <SyntaxHighlighter wrapLines={false} style={githubGist} useInlineStyles={true} showLineNumbers={true}>
            {config}
          </SyntaxHighlighter>
        </CardBody>
      </Card>
    );
  };

  return (
    <React.Fragment>
      <Tabs defaultActiveKey={0} style={{ backgroundColor: 'white' }}>
        <Tab eventKey={0} title={<TabTitleText>JSON</TabTitleText>} tabContentId="tab1" tabContentRef={contentRef1} />
        <Tab eventKey={1} title={<TabTitleText>XML</TabTitleText>} tabContentId="tab2" tabContentRef={contentRef2} />
        <Tab eventKey={2} title={<TabTitleText>YAML</TabTitleText>} tabContentId="tab3" tabContentRef={contentRef3} />
      </Tabs>
      <div>
        <TabContent eventKey={0} id="tab1" ref={contentRef1}>
          <TabContentBody> {displayConfig(props.config)} </TabContentBody>
        </TabContent>
        <TabContent eventKey={1} id="tab2" ref={contentRef2} hidden>
          <TabContentBody> {xmlConfig && displayConfig(xmlConfig.configuration)} </TabContentBody>
        </TabContent>
        <TabContent eventKey={2} id="tab3" ref={contentRef3} hidden>
          <TabContentBody> {yamlConfig && displayConfig(yamlConfig.configuration)} </TabContentBody>
        </TabContent>
      </div>
    </React.Fragment>
  );
};

export { CacheConfiguration };
